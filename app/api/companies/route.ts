import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';
import type { CompanyAccount } from '@/types/recruiter';

export async function GET() {
  try {
    const token = await getSessionToken();
    if (!token || !(await validateSessionToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: companies, error } = await supabaseAdmin
      .from('company_accounts')
      .select('id, company_name, contact_email, invited_by, invited_at, auth_user_id')
      .order('invited_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Look up last_sign_in_at for each company's auth user
    const signInMap = new Map<string, string | null>();
    const authLookups = (companies || [])
      .filter((c) => c.auth_user_id)
      .map((c) => c.auth_user_id as string);

    // Fetch in batches of 10 to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < authLookups.length; i += batchSize) {
      const batch = authLookups.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((id) => supabaseAdmin.auth.admin.getUserById(id))
      );
      for (const { data } of results) {
        if (data?.user) {
          signInMap.set(data.user.id, data.user.last_sign_in_at ?? null);
        }
      }
    }

    const enriched: CompanyAccount[] = (companies || []).map((company) => ({
      id: company.id,
      company_name: company.company_name,
      contact_email: company.contact_email,
      invited_by: company.invited_by,
      invited_at: company.invited_at,
      last_sign_in_at: company.auth_user_id
        ? signInMap.get(company.auth_user_id) ?? null
        : null,
    }));

    return NextResponse.json({ companies: enriched });
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
