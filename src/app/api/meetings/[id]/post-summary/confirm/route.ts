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

    const summaryData = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;

    // Run in transaction to update summaries, decisions, and tasks
    await prisma.$transaction(async (tx) => {
      // Update other post summaries
      await tx.aiSummary.updateMany({
        where: {
          meetingId: id,
          summaryType: 'post_meeting',
          id: { not: summaryId }
        },
        data: { status: 'superseded' }
      });

      // Update confirmed summary
      await tx.aiSummary.update({
        where: { id: summaryId },
        data: {
          status: 'confirmed',
          resultJson: JSON.stringify(summaryData),
          confirmedAt: new Date(),
          confirmedBy: session.id
        }
      });

      // Fetch all active users to match assignees by name
      const users = await tx.user.findMany({ where: { isActive: true } });
      const userMap = new Map(users.map((u) => [u.name.trim(), u.id]));

      // Create Decisions
      const agendaResults = summaryData.agenda_results || [];
      const decisionMap = new Map<string, string>(); // maps agendaId -> decisionId

      for (const res of agendaResults) {
        if (res.decision_status === 'decided' && res.decision) {
          const decision = await tx.decision.create({
            data: {
              meetingId: id,
              agendaId: res.agenda_id || null,
              content: res.decision,
              status: 'decided',
              sourceType: 'ai_summary',
              sourceReference: res.evidence || null,
              isConfirmed: true
            }
          });
          if (res.agenda_id) {
            decisionMap.set(res.agenda_id, decision.id);
          }
        }
      }

      // Create Tasks (Action Items)
      const actionItems = summaryData.action_items || [];
      for (const item of actionItems) {
        // Try to match assignee name
        const assigneeName = item.assignee_name?.trim();
        const assigneeId = assigneeName ? userMap.get(assigneeName) || null : null;

        // Try to find if this task relates to an agenda decision
        // (For simplicity, we check if the item title or description mentions any agenda titles)
        const decisionId = null; 

        await tx.task.create({
          data: {
            title: item.title,
            description: item.description || null,
            assigneeId,
            requesterId: session.id,
            dueDate: item.due_date ? new Date(item.due_date) : null,
            status: 'todo',
            priority: item.priority || 'medium',
            sourceType: 'ai_summary',
            meetingId: id,
            decisionId,
            confirmationStatus: assigneeId ? 'pending' : 'not_required'
          }
        });
      }

      // Update meeting status
      await tx.meeting.update({
        where: { id },
        data: {
          status: 'post_confirmed',
          confirmedPostSummaryId: summaryId
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Confirm post-summary error:', error);
    return NextResponse.json(
      { error: '사후 요약 확정 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
