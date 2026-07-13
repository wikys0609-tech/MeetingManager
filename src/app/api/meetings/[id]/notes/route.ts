import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { id } = await params;
    const { content, noteType, isImportant, agendaId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: '메모 내용을 입력해주세요.' }, { status: 400 });
    }

    const note = await prisma.meetingNote.create({
      data: {
        meetingId: id,
        authorId: session.id,
        agendaId: agendaId || null,
        content,
        noteType: noteType || 'general',
        isImportant: isImportant || false
      },
      include: {
        author: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Create meeting note error:', error);
    return NextResponse.json(
      { error: '메모를 등록하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
