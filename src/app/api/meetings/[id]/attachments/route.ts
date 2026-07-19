import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // directory already exists
    }

    const uniqueFilename = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        meetingId: id,
        uploadedBy: session.id,
        filename: file.name,
        storagePath: `/uploads/${uniqueFilename}`,
        mimeType: file.type,
        sizeBytes: file.size,
        textExtractionStatus: 'completed',
      }
    });

    return NextResponse.json({ success: true, attachment });
  } catch (error) {
    console.error('Upload attachment error:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get('attachmentId');

    if (!attachmentId) {
      return NextResponse.json({ error: '삭제할 파일 ID가 필요합니다.' }, { status: 400 });
    }

    // Soft delete
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete attachment error:', error);
    return NextResponse.json({ error: '파일 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
