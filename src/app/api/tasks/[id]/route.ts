import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: '할 일을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(body.status ? { 
          status: body.status,
          completedAt: body.status === 'completed' ? new Date() : null 
        } : {}),
        ...(body.assigneeId !== undefined ? { assigneeId: body.assigneeId } : {}),
        ...(body.priority ? { priority: body.priority } : {}),
        ...(body.confirmationStatus ? { confirmationStatus: body.confirmationStatus } : {}),
      }
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: '할 일을 수정하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
