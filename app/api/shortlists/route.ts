import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCompanyFromRequest } from '@/lib/auth/getCompanyFromRequest';

export async function GET() {
  const company = await getCompanyFromRequest();
  if (!company) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('company_shortlists')
    .select('talent_id, notes, created_at')
    .eq('company_id', company.companyId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ shortlists: data });
}

export async function POST(request: NextRequest) {
  const company = await getCompanyFromRequest();
  if (!company) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { talentId, notes } = await request.json();

  if (!talentId) {
    return NextResponse.json({ error: 'talentId is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('company_shortlists')
    .upsert(
      {
        company_id: company.companyId,
        talent_id: talentId,
        notes: notes || null,
      },
      { onConflict: 'company_id,talent_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { error } = await supabaseAdmin
    .from('company_shortlists')
    .delete()
    .eq('company_id', company.companyId)
    .eq('talent_id', talentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
