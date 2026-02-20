import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await supabaseAdmin
      .from('company_accounts')
      .update({ first_login_at: new Date().toISOString() })
      .eq('auth_user_id', user.id)
      .is('first_login_at', null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to set first_login_at:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
