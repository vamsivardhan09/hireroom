import { NextResponse, type NextRequest } from 'next/server';
import { parseResumeBuffer } from '@/lib/resume/parser';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No resume file uploaded' },
        { status: 400 }
      );
    }

    // Validate size (max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit of 10 MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const name = file.name.toLowerCase();
    const validExts = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const hasValidExt = validExts.some(ext => name.endsWith(ext));

    if (!hasValidExt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file format. Please upload a PDF, DOCX, or plain text file.',
        },
        { status: 400 }
      );
    }

    // Convert file to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Execute real resume parsing pipeline
    const { data, log } = await parseResumeBuffer(buffer, file.name, file.type);

    // If Supabase Storage is configured, store the file using fileHash path
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
          cookies: {
            getAll: () => [],
            setAll: () => {},
          },
        });
        await supabase.storage.from('resumes').upload(`${log.fileHash}/${file.name}`, buffer, {
          contentType: file.type,
          upsert: true,
        });
      } catch (storageErr) {
        // Log storage upload warning but don't fail parsing
        console.warn('Supabase storage upload failed:', storageErr);
      }
    }

    return NextResponse.json({
      success: true,
      data,
      log,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to parse resume file',
      },
      { status: 422 }
    );
  }
}
