import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface CompanySession {
  companyId: string;
  companyName: string;
  contactEmail: string;
}

export async function getCompanyFromRequest(): Promise<CompanySession | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: company, error } = await supabaseAdmin
      .from('company_accounts')
      .select('id, company_name, contact_email, status')
      .eq('auth_user_id', user.id)
      .single();

    if (error || !company) return null;

    // Reject suspended/deactivated accounts
    if (company.status !== 'active') return null;

    return {
      companyId: company.id,
      companyName: company.company_name,
      contactEmail: company.contact_email,
    };
  } catch (error) {
    console.error('getCompanyFromRequest failed:', error);
    return null;
  }
}
