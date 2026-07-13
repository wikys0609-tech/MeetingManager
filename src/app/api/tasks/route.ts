import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');

    const tasks = await prisma.task.findMany({
      where: {
        ...(assigneeId ? { assigneeId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, department: true } },
        requester: { select: { id: true, name: true } },
        meeting: { select: { id: true, title: true } },
        comments: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json(
      { error: '할 일 목록을 불러오는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { title, description, assigneeId, dueDate, priority, meetingId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: '할 일 제목은 필수 입력 사항입니다.' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId: assigneeId || null,
        requesterId: session.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'todo',
        priority: priority || 'medium',
        sourceType: 'manual',
        meetingId: meetingId || null,
        confirmationStatus: assigneeId ? 'pending' : 'not_required'
      }
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: '할 일을 등록하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
