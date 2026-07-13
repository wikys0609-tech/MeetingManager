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
    const status = searchParams.get('status');

    const meetings = await prisma.meeting.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status } : {}),
      },
      include: {
        creator: {
          select: { name: true, email: true },
        },
        participants: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        agendas: true,
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Fetch meetings error:', error);
    return NextResponse.json(
      { error: '회의 목록을 불러오는 도중 오류가 발생했습니다.' },
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

    const { title, objective, scheduledAt, location, onlineUrl, agendas, participants, parentMeetingId } = await req.json();

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: '회의 주제와 일시는 필수 입력 사항입니다.' },
        { status: 400 }
      );
    }

    // Create meeting, agendas, and participants inside a transaction
    const newMeeting = await prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.create({
        data: {
          title,
          objective,
          scheduledAt: new Date(scheduledAt),
          location,
          onlineUrl,
          status: 'draft',
          creatorId: session.id,
          parentMeetingId,
        },
      });

      // Add agendas
      if (agendas && agendas.length > 0) {
        await tx.agenda.createMany({
          data: agendas.map((agenda: any, idx: number) => ({
            meetingId: meeting.id,
            title: agenda.title,
            description: agenda.description || '',
            orderIndex: idx + 1,
            decisionRequired: agenda.decisionRequired || false,
            sourceType: agenda.sourceType || 'new',
            sourceMeetingId: agenda.sourceMeetingId || null,
          })),
        });
      }

      // Add participants (always include creator as attendant/facilitator)
      const participantData = [
        {
          meetingId: meeting.id,
          userId: session.id,
          participantRole: '진행자',
          attendanceStatus: 'attending',
        },
      ];

      if (participants && participants.length > 0) {
        participants.forEach((p: any) => {
          if (p.userId !== session.id) {
            participantData.push({
              meetingId: meeting.id,
              userId: p.userId,
              participantRole: p.role || '참석자',
              attendanceStatus: 'invited',
            });
          }
        });
      }

      await tx.meetingParticipant.createMany({
        data: participantData,
      });

      // If parentMeetingId is defined, create follow-up links for selected carried over items
      return meeting;
    });

    return NextResponse.json({ success: true, meetingId: newMeeting.id });
  } catch (error) {
    console.error('Create meeting error:', error);
    return NextResponse.json(
      { error: '회의를 생성하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
