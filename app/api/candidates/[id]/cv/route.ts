import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get the CV storage path from user_profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('cv_storage_path')
      .eq('id', id)
      .single();

    if (profileError || !profile?.cv_storage_path) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Generate signed URL (5 minute expiry)
    const { data, error } = await supabaseAdmin.storage
      .from('talent-pool-cvs')
      .createSignedUrl(profile.cv_storage_path, 300);

    if (error || !data?.signedUrl) {
      console.error('Signed URL error:', error);
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (err) {
    console.error('CV URL error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
