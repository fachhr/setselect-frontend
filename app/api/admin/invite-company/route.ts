import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

async function sendMagicLinkEmail(email: string, actionLink: string, companyName: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'SetSelect <noreply@setberry.com>',
    to: email,
    subject: `You've been invited to SetSelect`,
    text: [
      `Hello,`,
      ``,
      `You've been invited to join SetSelect as a representative of ${companyName}.`,
      ``,
      `Click the link below to sign in:`,
      actionLink,
      ``,
      `This link expires in 24 hours. If it has expired, you can request a new one at ${process.env.NEXT_PUBLIC_SITE_URL || 'https://setselect.vercel.app'}/login`,
      ``,
      `— The SetSelect Team`,
    ].join('\n'),
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    const adminKey = request.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, companyName, invitedBy } = await request.json();

    if (!email || !companyName) {
      return NextResponse.json(
        { error: 'email and companyName are required' },
        { status: 400 }
      );
    }

    // Check if company already exists with this email
    const { data: existing } = await supabaseAdmin
      .from('company_accounts')
      .select('id')
      .eq('contact_email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A company account with this email already exists' },
        { status: 409 }
      );
    }

    // Create auth user
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
      });

    if (authError) {
      // If user already exists in auth but not in company_accounts, link them
      if (authError.message?.includes('already been registered')) {
        // Use generateLink to get the existing user's ID and a magic link in one call
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://setselect.vercel.app'}/auth/callback`,
            },
          });

        if (linkError || !linkData?.user) {
          return NextResponse.json(
            { error: `Failed to resolve existing auth user: ${linkError?.message || 'user not found'}` },
            { status: 500 }
          );
        }

        const { error: insertError } = await supabaseAdmin
          .from('company_accounts')
          .insert({
            auth_user_id: linkData.user.id,
            company_name: companyName,
            contact_email: email,
            invited_by: invitedBy || null,
            invited_at: new Date().toISOString(),
          });

        if (insertError) {
          return NextResponse.json(
            { error: `Failed to create company account: ${insertError.message}` },
            { status: 500 }
          );
        }

        // generateLink does NOT send emails — send via Resend
        try {
          await sendMagicLinkEmail(email, linkData.properties.action_link, companyName);
        } catch (emailError) {
          console.error('Failed to send magic link email:', emailError);
          return NextResponse.json({
            success: true,
            warning: 'Account created but invitation email failed. User can request a new link at /login.',
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Company account created (existing auth user linked). Magic link sent.',
        });
      }

      return NextResponse.json(
        { error: `Auth error: ${authError.message}` },
        { status: 500 }
      );
    }

    // Create company_accounts row
    const { error: insertError } = await supabaseAdmin
      .from('company_accounts')
      .insert({
        auth_user_id: authUser.user.id,
        company_name: companyName,
        contact_email: email,
        invited_by: invitedBy || null,
        invited_at: new Date().toISOString(),
      });

    if (insertError) {
      // Cleanup: remove the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: `Failed to create company account: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Generate magic link and send via Resend
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://setselect.vercel.app'}/auth/callback`,
        },
      });

    if (linkError || !linkData) {
      console.error('Failed to generate magic link:', linkError);
      return NextResponse.json({
        success: true,
        warning: 'Account created but magic link generation failed. User can request a new link at /login.',
      });
    }

    // generateLink does NOT send emails — send via Resend
    try {
      await sendMagicLinkEmail(email, linkData.properties.action_link, companyName);
    } catch (emailError) {
      console.error('Failed to send magic link email:', emailError);
      return NextResponse.json({
        success: true,
        warning: 'Account created but invitation email failed. User can request a new link at /login.',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Company "${companyName}" invited. Magic link sent to ${email}.`,
    });
  } catch (error) {
    console.error('Failed to invite company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
