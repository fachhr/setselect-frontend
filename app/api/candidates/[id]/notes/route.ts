import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { RecruiterNote } from '@/types/recruiter';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { text, author } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    // Get current notes
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('recruiter_candidates')
      .select('notes')
      .eq('profile_id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const notes: RecruiterNote[] = current?.notes || [];
    const newNote: RecruiterNote & { type: 'note' } = {
      type: 'note',
      id: crypto.randomUUID(),
      text: text.trim(),
      author: author || 'Recruiter',
      created_at: new Date().toISOString(),
    };
    notes.unshift(newNote);

    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('recruiter_candidates')
      .update({ notes, updated_at: now, last_activity_at: now })
      .eq('profile_id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(newNote, { status: 201 });
  } catch (err) {
    console.error('POST note error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json({ error: 'noteId is required' }, { status: 400 });
    }

    // Get current notes
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('recruiter_candidates')
      .select('notes')
      .eq('profile_id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const notes: RecruiterNote[] = (current?.notes || []).filter(
      (n: RecruiterNote) => n.id !== noteId
    );

    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('recruiter_candidates')
      .update({ notes, updated_at: now, last_activity_at: now })
      .eq('profile_id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE note error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
