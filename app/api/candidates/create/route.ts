import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const firstName = formData.get('firstName') as string | null;
    const lastName = formData.get('lastName') as string | null;
    const email = formData.get('email') as string | null;
    const market = formData.get('market') as string | null;
    const cvFile = formData.get('cv') as File | null;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and email are required' },
        { status: 400 },
      );
    }

    const resolvedMarket = market === 'BG' ? 'BG' : 'CH';

    // Optional fields
    const phone = formData.get('phone') as string | null;
    const phoneCode = formData.get('phoneCode') as string | null;
    const linkedin = formData.get('linkedin') as string | null;
    const workEligibility = formData.get('workEligibility') as string | null;
    const yearsExp = formData.get('yearsOfExperience') as string | null;
    const highlight = formData.get('highlight') as string | null;

    // CV upload
    let cvStoragePath: string | null = null;
    let cvOriginalFilename: string | null = null;
    const profileId = uuidv4();

    if (cvFile && cvFile.size > 0) {
      if (cvFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'CV must be less than 5MB' },
          { status: 400 },
        );
      }
      if (!VALID_MIME_TYPES.includes(cvFile.type as (typeof VALID_MIME_TYPES)[number])) {
        return NextResponse.json(
          { success: false, error: 'CV must be PDF or DOCX' },
          { status: 400 },
        );
      }

      const ext = MIME_TO_EXT[cvFile.type] || 'pdf';
      const storageName = `${profileId}/cv.${ext}`;
      const buffer = Buffer.from(await cvFile.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('talent-pool-cvs')
        .upload(storageName, buffer, { contentType: cvFile.type, upsert: false });

      if (uploadError) {
        console.error('CV upload error:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload CV' },
          { status: 500 },
        );
      }

      cvStoragePath = uploadData.path;
      cvOriginalFilename = cvFile.name;
    }

    // Create user_profiles record
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: profileId,
        contact_first_name: firstName.trim(),
        contact_last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        linkedinUrl: linkedin?.trim() || null,
        country_code: phoneCode?.trim() || null,
        phoneNumber: phone?.trim() || null,
        years_of_experience: yearsExp ? parseInt(yearsExp, 10) : null,
        work_eligibility: workEligibility || null,
        highlight: highlight?.trim() || null,
        cv_storage_path: cvStoragePath,
        cv_original_filename: cvOriginalFilename,
        market: resolvedMarket,
        accepted_terms: false,
        participates_in_talent_pool: true,
      })
      .select('id, email, talent_id')
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to create candidate profile' },
        { status: 500 },
      );
    }

    // Create talent_profiles record (PII-free mirror)
    const { error: talentError } = await supabaseAdmin.from('talent_profiles').insert({
      profile_id: profile.id,
      talent_id: profile.talent_id,
      years_of_experience: yearsExp ? parseInt(yearsExp, 10) : null,
      work_eligibility: workEligibility || null,
      highlight: highlight?.trim() || null,
      market: resolvedMarket,
    });

    if (talentError) {
      console.error('talent_profiles insert error:', talentError);
    }

    // Trigger parser if CV was uploaded
    if (cvStoragePath) {
      const { data: jobData, error: jobError } = await supabaseAdmin
        .from('cv_parsing_jobs')
        .insert({ profile_id: profile.id, status: 'pending', job_type: 'talent_pool' })
        .select()
        .single();

      if (jobError) {
        console.error('Failed to create parsing job:', jobError);
      }

      const parserUrl = process.env.RAILWAY_API_URL;
      const parserKey = process.env.PARSER_API_KEY;

      if (parserUrl && parserKey && jobData) {
        fetch(`${parserUrl}/api/v1/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-api-key': parserKey },
          body: JSON.stringify({
            jobId: jobData.id,
            storagePath: cvStoragePath,
            market: resolvedMarket,
          }),
        }).catch((err) => console.error('Parser trigger failed:', err));
      }
    }

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      talentId: profile.talent_id,
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Submission failed' },
      { status: 500 },
    );
  }
}
