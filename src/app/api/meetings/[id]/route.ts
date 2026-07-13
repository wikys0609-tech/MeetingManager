import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, department: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, department: true },
            },
          },
        },
        agendas: {
          orderBy: { orderIndex: 'asc' },
        },
        notes: {
          include: {
            author: { select: { name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        recordings: {
          include: {
            segments: { orderBy: { startSeconds: 'asc' } },
          },
        },
        summaries: {
          orderBy: { version: 'desc' },
        },
        decisions: {
          include: {
            agenda: true,
          },
        },
        tasks: {
          include: {
            assignee: { select: { name: true } },
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: '회의를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Fetch meeting detail error:', error);
    return NextResponse.json(
      { error: '회의 세부 정보를 불러오는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting) {
      return NextResponse.json({ error: '회의를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Update fields
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.objective ? { objective: body.objective } : {}),
        ...(body.scheduledAt ? { scheduledAt: new Date(body.scheduledAt) } : {}),
        ...(body.location ? { location: body.location } : {}),
        ...(body.onlineUrl ? { onlineUrl: body.onlineUrl } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.confirmedPreSummaryId ? { confirmedPreSummaryId: body.confirmedPreSummaryId } : {}),
        ...(body.confirmedPostSummaryId ? { confirmedPostSummaryId: body.confirmedPostSummaryId } : {}),
      },
    });

    return NextResponse.json({ success: true, meeting: updatedMeeting });
  } catch (error) {
    console.error('Update meeting error:', error);
    return NextResponse.json(
      { error: '회의를 수정하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({ where: { id } });

    if (!meeting) {
      return NextResponse.json({ error: '회의를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Soft delete
    await prisma.meeting.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return NextResponse.json(
      { error: '회의를 삭제하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
