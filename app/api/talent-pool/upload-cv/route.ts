import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';
import { MAX_CV_FILE_SIZE, VALID_CV_MIME_TYPES, MIME_TO_EXTENSION } from '@/lib/formOptions';

/**
 * POST /api/talent-pool/upload-cv
 *
 * Handles CV file upload to Supabase Storage.
 *
 * Flow:
 * 1. Receive CV file from form
 * 2. Validate file (type, size)
 * 3. Generate unique profile ID
 * 4. Upload to Supabase Storage: talent-pool-cvs/{profileId}/cv.{ext}
 * 5. Return profileId and storage path
 */
export async function POST(req: NextRequest) {
  try {
    // Get file from form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_CV_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size must be less than ${MAX_CV_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate file type (MIME type check)
    if (!VALID_CV_MIME_TYPES.includes(file.type as typeof VALID_CV_MIME_TYPES[number])) {
      return NextResponse.json(
        { success: false, error: 'File must be PDF or DOCX' },
        { status: 400 }
      );
    }

    // Generate unique profile ID
    const profileId = uuidv4();

    // Sanitize and validate file extension
    // Use MIME-derived extension for security (don't trust filename)
    const fileExt = MIME_TO_EXTENSION[file.type] || 'pdf';
    const fileName = `${profileId}/cv.${fileExt}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Debug logging
    console.log('[Upload] Attempting upload:', {
      bucket: 'talent-pool-cvs',
      fileName,
      fileSize: buffer.length,
      contentType: file.type
    });

    // Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from('talent-pool-cvs')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload CV to storage' },
        { status: 500 }
      );
    }

    // Return success with profile ID and storage path
    return NextResponse.json({
      success: true,
      profileId,
      cvStoragePath: data.path,
      originalFilename: file.name
    });

  } catch (error) {
    console.error('Upload CV error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      },
      { status: 500 }
    );
  }
}
