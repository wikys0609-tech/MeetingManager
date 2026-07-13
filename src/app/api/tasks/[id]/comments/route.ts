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
    const { content, commentType } = await req.json();

    if (!content) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        authorId: session.id,
        content,
        commentType: commentType || 'general'
      },
      include: {
        author: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Create task comment error:', error);
    return NextResponse.json(
      { error: '댓글을 등록하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
