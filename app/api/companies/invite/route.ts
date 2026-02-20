import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Validate recruiter session
    const token = await getSessionToken();
    if (!token || !(await validateSessionToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, companyName, invitedBy, regenerateLink } =
      await request.json();

    if (!email || !companyName) {
      return NextResponse.json(
        { error: 'email and companyName are required' },
        { status: 400 }
      );
    }

    const redirectTo = `${process.env.FRONTEND_URL || 'https://www.setselect.io'}/auth/invite-callback`;

    // Check if company already exists with this email
    const { data: existing } = await supabaseAdmin
      .from('company_accounts')
      .select('id')
      .eq('contact_email', email)
      .maybeSingle();

    if (existing && !regenerateLink) {
      return NextResponse.json(
        { error: 'A company account with this email already exists. Check "Regenerate link" to create a new login link.' },
        { status: 409 }
      );
    }

    // Regenerate link for existing company
    if (existing && regenerateLink) {
      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: { redirectTo },
        });

      if (linkError || !linkData) {
        return NextResponse.json(
          { error: `Failed to generate link: ${linkError?.message || 'unknown error'}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `New login link generated for "${companyName}".`,
        actionLink: linkData.properties.action_link,
      });
    }

    // Create new auth user
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
      });

    if (authError) {
      // If user exists in auth but not in company_accounts, link them
      if (authError.message?.includes('already been registered')) {
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: { redirectTo },
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

        return NextResponse.json({
          success: true,
          message: `Company "${companyName}" created (existing auth user linked).`,
          actionLink: linkData.properties.action_link,
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

    // Generate magic link
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo },
      });

    if (linkError || !linkData) {
      return NextResponse.json({
        success: true,
        warning: 'Account created but magic link generation failed. The company can request a new link at /login.',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Company "${companyName}" invited successfully.`,
      actionLink: linkData.properties.action_link,
    });
  } catch (error) {
    console.error('Failed to invite company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
