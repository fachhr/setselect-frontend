import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { talentPoolServerSchemaRefined } from '@/lib/validation/talentPoolSchema';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import { correctGrammar } from '@/lib/ai/grammarCorrection';

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

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptchaToken(
      body.recaptchaToken || '',
      'join_form'
    );

    if (!recaptchaResult.success) {
      console.warn('[Submit] reCAPTCHA verification failed:', recaptchaResult.error);
      return NextResponse.json(
        { success: false, error: 'Security verification failed' },
        { status: 403 }
      );
    }

    // Remove cvFile from validation (already uploaded)
    // Extract languages and functional_expertise separately
    const { cvStoragePath, originalFilename, languages, functional_expertise, other_expertise, ...formData } = body;

    // Validate form data using server schema (expects cvStoragePath, not File)
    const validationResult = talentPoolServerSchemaRefined.safeParse({
      ...formData,
      cvStoragePath,
      originalFilename,
      languages,
      functional_expertise,
      other_expertise,
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
        years_of_experience: validatedData.years_of_experience,
        work_eligibility: validatedData.work_eligibility || null,

        // Job Preferences (user-provided)
        desired_roles: validatedData.desired_roles || null,
        notice_period_months: validatedData.notice_period_months,
        desired_locations: validatedData.desired_locations,
        desired_other_location: validatedData.desired_other_location || null,
        salary_min: validatedData.salary_min,
        salary_max: validatedData.salary_max,

        // Languages (simplified array of strings)
        languages: languages || null,

        // Key achievement/highlight (user-provided)
        highlight: validatedData.highlight || null,

        // Functional expertise (user-selected, parser may supplement)
        functional_expertise: validatedData.functional_expertise || null,
        other_expertise: validatedData.other_expertise || null,

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
      .select('id, email, talent_id')
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Create talent_profiles record (display-only, PII-free)
    const { error: talentProfileError } = await supabaseAdmin
      .from('talent_profiles')
      .insert({
        profile_id: profile.id,
        talent_id: profile.talent_id,
        years_of_experience: validatedData.years_of_experience,
        work_eligibility: validatedData.work_eligibility || null,
        desired_roles: validatedData.desired_roles || null,
        notice_period_months: validatedData.notice_period_months,
        desired_locations: validatedData.desired_locations,
        desired_other_location: validatedData.desired_other_location || null,
        salary_min: validatedData.salary_min,
        salary_max: validatedData.salary_max,
        highlight: validatedData.highlight || null,
        languages: languages || null,
        functional_expertise: validatedData.functional_expertise || null,
        other_expertise: validatedData.other_expertise || null,
        // Parser-populated fields left NULL — filled by trigger + parser
      });

    if (talentProfileError) {
      console.error('talent_profiles insert error:', talentProfileError);
      // Non-fatal — user_profiles is the source of truth
    }

    // Trigger async grammar correction (runs after response is sent)
    after(async () => {
      try {
        const fieldsToCorrect = {
          highlight: validatedData.highlight || null,
          desired_roles: validatedData.desired_roles || null,
          other_expertise: validatedData.other_expertise || null,
          desired_other_location: validatedData.desired_other_location || null,
          languages: validatedData.languages || null,
        };

        const hasContent = Object.values(fieldsToCorrect).some(v => v);
        if (!hasContent) return;

        const corrected = await correctGrammar(fieldsToCorrect);

        // Build update objects with only changed fields
        const updates: Record<string, string | string[]> = {};
        for (const [key, value] of Object.entries(corrected)) {
          if (value && JSON.stringify(value) !== JSON.stringify(fieldsToCorrect[key as keyof typeof fieldsToCorrect])) {
            updates[key] = value;
          }
        }

        if (Object.keys(updates).length === 0) {
          console.log('[Grammar] No corrections needed');
          return;
        }

        console.log('[Grammar] Corrections applied:', updates);

        await Promise.all([
          supabaseAdmin.from('user_profiles').update(updates).eq('id', profile.id),
          supabaseAdmin.from('talent_profiles').update(updates).eq('profile_id', profile.id),
        ]);
      } catch (err) {
        console.error('[Grammar] Correction failed:', err);
        // Non-fatal — original text remains in DB
      }
    });

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

    console.log('[Submit] Parser config check:', {
      parserUrl: parserUrl ? 'SET' : 'NOT SET',
      parserApiKey: parserApiKey ? 'SET' : 'NOT SET',
      jobData: jobData ? 'EXISTS' : 'MISSING'
    });

    if (parserUrl && parserApiKey && jobData) {
      console.log('[Submit] Triggering parser for job:', jobData.id);
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
