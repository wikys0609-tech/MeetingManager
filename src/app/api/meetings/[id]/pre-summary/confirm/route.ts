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
    const { summaryId, resultJson } = await req.json();

    if (!summaryId || !resultJson) {
      return NextResponse.json(
        { error: '확인할 요약 ID와 결과 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Update other pre_meeting summaries of this meeting to superseded
    await prisma.aiSummary.updateMany({
      where: {
        meetingId: id,
        summaryType: 'pre_meeting',
        id: { not: summaryId }
      },
      data: { status: 'superseded' }
    });

    // Update confirmed summary
    const confirmedSummary = await prisma.aiSummary.update({
      where: { id: summaryId },
      data: {
        status: 'confirmed',
        resultJson: typeof resultJson === 'string' ? resultJson : JSON.stringify(resultJson),
        confirmedAt: new Date(),
        confirmedBy: session.id
      }
    });

    // Update meeting status
    await prisma.meeting.update({
      where: { id },
      data: {
        status: 'pre_confirmed',
        confirmedPreSummaryId: summaryId
      }
    });

    return NextResponse.json({ success: true, summary: confirmedSummary });
  } catch (error) {
    console.error('Confirm pre-summary error:', error);
    return NextResponse.json(
      { error: '사전 요약 확정 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
