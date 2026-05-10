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

    const newNote: RecruiterNote & { type: 'note' } = {
      type: 'note',
      id: crypto.randomUUID(),
      text: text.trim(),
      author: author || 'Recruiter',
      created_at: new Date().toISOString(),
    };

    // Atomic prepend — avoids read-modify-write race condition
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .rpc('prepend_note', {
        p_profile_id: id,
        p_note: newNote,
        p_now: now,
      });

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

    // Atomic delete — avoids read-modify-write race condition
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .rpc('delete_note', {
        p_profile_id: id,
        p_note_id: noteId,
        p_now: now,
      });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE note error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
