import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { buildEmbeddingText, generateEmbeddings } from '@/lib/embeddings';

const BATCH_SIZE = 50;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const profileId = body.profileId as string | undefined;
    const forceAll = body.force === true;

    if (profileId) {
      const { data: candidate, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, desired_roles, short_summary, highlight, profile_bio, functional_expertise, technical_skills, professional_experience, education_history, languages, work_eligibility, desired_locations')
        .eq('id', profileId)
        .single();

      if (error || !candidate) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      const text = buildEmbeddingText(candidate);
      if (!text.trim()) {
        return NextResponse.json({ error: 'No embeddable content' }, { status: 400 });
      }

      const [embedding] = await generateEmbeddings([text]);

      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ embedding: JSON.stringify(embedding) })
        .eq('id', profileId);

      if (updateError) throw updateError;

      return NextResponse.json({ updated: 1, profileId });
    }

    let query = supabaseAdmin
      .from('user_profiles')
      .select('id, desired_roles, short_summary, highlight, profile_bio, functional_expertise, technical_skills, professional_experience, education_history, languages, work_eligibility, desired_locations')
      .order('created_at', { ascending: true });

    if (!forceAll) {
      query = query.is('embedding', null);
    }

    const { data: candidates, error } = await query;

    if (error) throw error;
    if (!candidates?.length) {
      return NextResponse.json({ updated: 0, message: 'All candidates already have embeddings' });
    }

    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE);
      const texts = batch.map(c => buildEmbeddingText(c));

      const validIndices: number[] = [];
      const validTexts: string[] = [];
      for (let j = 0; j < texts.length; j++) {
        if (texts[j].trim()) {
          validIndices.push(j);
          validTexts.push(texts[j]);
        } else {
          skipped++;
        }
      }

      if (validTexts.length === 0) continue;

      const embeddings = await generateEmbeddings(validTexts);

      for (let j = 0; j < validIndices.length; j++) {
        const candidate = batch[validIndices[j]];
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({ embedding: JSON.stringify(embeddings[j]) })
          .eq('id', candidate.id);

        if (updateError) {
          console.error(`Failed to update embedding for ${candidate.id}:`, updateError);
          continue;
        }
        updated++;
      }
    }

    return NextResponse.json({ updated, skipped, total: candidates.length });
  } catch (err) {
    console.error('Embedding generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
