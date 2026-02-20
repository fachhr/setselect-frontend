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

    // Enrich with auth user last_sign_in_at
    const enriched: CompanyAccount[] = await Promise.all(
      (companies || []).map(async (company) => {
        let lastSignInAt: string | null = null;

        if (company.auth_user_id) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
            company.auth_user_id
          );
          lastSignInAt = authUser?.user?.last_sign_in_at ?? null;
        }

        return {
          id: company.id,
          company_name: company.company_name,
          contact_email: company.contact_email,
          invited_by: company.invited_by,
          invited_at: company.invited_at,
          last_sign_in_at: lastSignInAt,
        };
      })
    );

    return NextResponse.json({ companies: enriched });
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
