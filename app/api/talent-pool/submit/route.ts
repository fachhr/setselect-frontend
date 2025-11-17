import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { talentPoolSchemaRefined } from '@/lib/validation/talentPoolSchema';

/**
 * POST /api/talent-pool/submit
 *
 * Handles talent pool profile submission.
 *
 * Flow:
 * 1. Validate form data
 * 2. Create profile record in database (with user-provided fields only)
 * 3. Create parsing job record
 * 4. Trigger async parser service (non-blocking)
 * 5. Return success response immediately
 *
 * Parser will fill remaining fields in background.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Remove cvFile from validation (already uploaded)
    const { cvFile, cvStoragePath, originalFilename, ...formData } = body;

    // Validate CV storage path exists
    if (!cvStoragePath || typeof cvStoragePath !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'CV upload required - storage path missing'
        },
        { status: 400 }
      );
    }

    // Validate form data (without cvFile since it's already uploaded and validated)
    // We create a temporary File object just for validation since the schema requires it
    const validationResult = talentPoolSchemaRefined.safeParse({
      ...formData,
      cvFile: new File([], 'validated.pdf', { type: 'application/pdf' })
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Create profile with user-provided data (using admin client)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        // Contact Details (user-provided)
        contact_first_name: validatedData.contact_first_name,
        contact_last_name: validatedData.contact_last_name,
        email: validatedData.email,
        linkedinUrl: validatedData.linkedinUrl || null,
        country_code: validatedData.country_code,
        phoneNumber: validatedData.phoneNumber,

        // Job Preferences (user-provided)
        notice_period_months: validatedData.notice_period_months,
        desired_locations: validatedData.desired_locations,
        desired_other_location: validatedData.desired_other_location || null,
        salary_min: validatedData.salary_min,
        salary_max: validatedData.salary_max,

        // CV Info
        cv_storage_path: cvStoragePath,
        cv_original_filename: originalFilename,

        // Terms & Participation
        accepted_terms: true,
        accepted_terms_at: new Date().toISOString(),
        participates_in_talent_pool: true,

        // All other fields are NULL and will be filled by parser
        // (education_history, professional_experience, skills, etc.)
      })
      .select('id, email')
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Create parsing job
    const { data: jobData, error: jobError } = await supabaseAdmin
      .from('cv_parsing_jobs')
      .insert({
        profile_id: profile.id,
        status: 'pending',
        job_type: 'talent_pool'
      })
      .select()
      .single();

    if (jobError) {
      console.error('Failed to create parsing job:', jobError);
      // Don't fail the request - parsing can be retried manually
    }

    // ========================================
    // TRIGGER ASYNC PARSING (non-blocking)
    // ========================================
    // IMPORTANT: Use server-side only env vars (no NEXT_PUBLIC_ prefix)
    // NEXT_PUBLIC_ vars are exposed to client bundle which leaks internal API URLs
    const parserUrl = process.env.RAILWAY_API_URL;
    const parserApiKey = process.env.PARSER_API_KEY;

    if (parserUrl && parserApiKey && jobData) {
      // Fire and forget - don't await
      fetch(`${parserUrl}/api/v1/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': parserApiKey
        },
        body: JSON.stringify({
          jobId: jobData.id,
          storagePath: cvStoragePath
        })
      }).catch(err => {
        console.error('Parser trigger failed:', err);
        // Parsing can be retried via cron or manual trigger
      });
    } else {
      console.warn('Parser service not configured - skipping automatic parsing');
    }

    // Return success immediately (parser runs in background)
    return NextResponse.json({
      success: true,
      profileId: profile.id,
      message: 'Profile submitted successfully'
    });

  } catch (error) {
    console.error('Submit profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Submission failed'
      },
      { status: 500 }
    );
  }
}
