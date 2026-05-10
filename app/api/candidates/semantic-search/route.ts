import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/embeddings';

const DEFAULT_LIMIT = 50;
const MIN_SIMILARITY = 0.25;

export async function POST(request: NextRequest) {
  try {
    const { query, market, limit } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const embedding = await generateEmbedding(query.trim());

    const { data, error } = await supabaseAdmin.rpc('semantic_search_candidates', {
      query_embedding: JSON.stringify(embedding),
      similarity_threshold: MIN_SIMILARITY,
      match_count: limit || DEFAULT_LIMIT,
      filter_market: market || null,
    });

    if (error) throw error;

    return NextResponse.json({
      results: (data || []).map((r: { profile_id: string; similarity: number }) => ({
        profileId: r.profile_id,
        score: r.similarity,
      })),
    });
  } catch (err) {
    console.error('Semantic search error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
