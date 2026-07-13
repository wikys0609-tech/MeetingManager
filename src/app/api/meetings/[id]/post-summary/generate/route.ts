import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generatePostMeetingSummary } from '@/lib/ai';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch meeting details, agendas, participants, notes, and recordings
    const meeting = await prisma.meeting.findFirst({
      where: { id, deletedAt: null },
      include: {
        agendas: true,
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        notes: true,
        recordings: {
          include: { segments: true }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: '회의를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Call AI helper
    const summaryJson = await generatePostMeetingSummary(meeting);

    // Find current version
    const latestSummary = await prisma.aiSummary.findFirst({
      where: { meetingId: id, summaryType: 'post_meeting' },
      orderBy: { version: 'desc' }
    });
    const version = latestSummary ? latestSummary.version + 1 : 1;

    // Save summary
    const newSummary = await prisma.aiSummary.create({
      data: {
        meetingId: id,
        summaryType: 'post_meeting',
        version,
        sourceSnapshot: JSON.stringify(meeting),
        resultJson: JSON.stringify(summaryJson),
        status: 'generated',
        createdBy: session.id
      }
    });

    // Update meeting status to post_review
    await prisma.meeting.update({
      where: { id },
      data: { status: 'post_review' }
    });

    return NextResponse.json({ success: true, summary: newSummary });
  } catch (error) {
    console.error('Generate post-summary error:', error);
    return NextResponse.json(
      { error: '사후 요약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
