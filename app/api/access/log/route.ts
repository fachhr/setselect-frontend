import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, accessType } = body;

    // Validate email format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate access type
    if (!accessType || !['unlock', 'request'].includes(accessType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid access type' },
        { status: 400 }
      );
    }

    // Insert into database
    const { error } = await supabaseAdmin
      .from('company_access_log')
      .insert({
        email: email.toLowerCase().trim(),
        access_type: accessType
      });

    if (error) {
      console.error('Failed to log access:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to log access' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
