import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCompanyFromRequest } from '@/lib/auth/getCompanyFromRequest';
import { sendEmail } from '@/lib/email';

export async function GET() {
  const company = await getCompanyFromRequest();
  if (!company) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('intro_requests')
    .select('id, talent_id, status, message, created_at, updated_at, responded_at')
    .eq('company_id', company.companyId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ introRequests: data });
}

export async function POST(request: NextRequest) {
  const company = await getCompanyFromRequest();
  if (!company) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { talentId, message } = await request.json();

  if (!talentId) {
    return NextResponse.json({ error: 'talentId is required' }, { status: 400 });
  }

  // Check if a non-cancelled request already exists
  const { data: existing } = await supabaseAdmin
    .from('intro_requests')
    .select('id, status')
    .eq('company_id', company.companyId)
    .eq('talent_id', talentId)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'An intro request for this candidate already exists', status: existing.status },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin
    .from('intro_requests')
    .upsert(
      {
        company_id: company.companyId,
        talent_id: talentId,
        message: message || null,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'company_id,talent_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send admin notification email (fire-and-forget)
  try {
    await sendEmail({
      from: 'SetSelect <noreply@setberry.com>',
      to: 'hello@setberry.com',
      replyTo: company.contactEmail,
      subject: `New Intro Request: ${talentId} from ${company.companyName}`,
      text: [
        `New introduction request submitted.`,
        ``,
        `Company: ${company.companyName}`,
        `Contact: ${company.contactEmail}`,
        `Candidate: ${talentId}`,
        message ? `Message: ${message}` : '',
        ``,
        `Manage this request in the Supabase Dashboard.`,
      ].filter(Boolean).join('\n'),
    });
  } catch (emailError) {
    console.error('Failed to send intro request notification:', emailError);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const company = await getCompanyFromRequest();
  if (!company) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { talentId } = await request.json();

  if (!talentId) {
    return NextResponse.json({ error: 'talentId is required' }, { status: 400 });
  }

  // Only allow cancelling pending requests
  const { error } = await supabaseAdmin
    .from('intro_requests')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('company_id', company.companyId)
    .eq('talent_id', talentId)
    .eq('status', 'pending');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
