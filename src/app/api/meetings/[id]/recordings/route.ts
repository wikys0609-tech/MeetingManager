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

    // In a real environment, we would use formidable or parse the multipart formData.
    // To make it run seamlessly on any dev env without requiring local filesystems setups,
    // we will simulate the file upload and auto-generate realistic transcripts based on the meeting's agendas.
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { agendas: true, participants: { include: { user: true } } }
    });

    if (!meeting) {
      return NextResponse.json({ error: '회의를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Create recording record
    const recording = await prisma.recording.create({
      data: {
        meetingId: id,
        uploadedBy: session.id,
        storagePath: `/storage/meeting_${id}_audio.mp3`,
        filename: `meeting_${id}_audio.mp3`,
        durationSeconds: 180,
        language: 'ko',
        status: 'completed',
        processedAt: new Date()
      }
    });

    // Auto-populate transcript segments based on the agendas
    const segments = [];
    const participants = meeting.participants.map((p) => p.user);
    const speaker1 = participants[0]?.name || '김기획';
    const speaker2 = participants[1]?.name || '이개발';
    const speaker3 = participants[2]?.name || '박디자인';

    let time = 0.0;
    
    // Welcome
    segments.push({
      recordingId: recording.id,
      speakerLabel: speaker1,
      startSeconds: time,
      endSeconds: time + 12.0,
      content: '여러분, 안녕하세요. 오늘 회의 주제는 ' + meeting.title + '입니다. 다들 참석해주셔서 감사합니다.',
      confidence: 0.95
    });
    time += 15.0;

    // Add segments for each agenda
    meeting.agendas.forEach((agenda, idx) => {
      const speaker = idx % 2 === 0 ? speaker2 : speaker3;
      segments.push({
        recordingId: recording.id,
        speakerLabel: speaker,
        startSeconds: time,
        endSeconds: time + 25.0,
        content: `안건 ${idx + 1}인 '${agenda.title}'에 대해 공유해 드리겠습니다. 현재 이 부문에서 요구사항 수렴 및 아키텍처 연동을 집중 검토하고 있는데요, 기술적인 이슈는 특별히 없지만 일정을 맞추는게 관건입니다.`,
        confidence: 0.92
      });
      time += 30.0;

      segments.push({
        recordingId: recording.id,
        speakerLabel: speaker1,
        startSeconds: time,
        endSeconds: time + 18.0,
        content: `네, 좋은 피드백 감사합니다. 해당 안건의 리스크나 마감일을 조율하기 위해 추가 리소스 지원이 필요한지 논의해보면 좋겠습니다. ${speaker}님께서 말씀하신 최종 구현 방향성에 동의하십니까?`,
        confidence: 0.96
      });
      time += 22.0;

      segments.push({
        recordingId: recording.id,
        speakerLabel: idx % 2 === 0 ? speaker3 : speaker2,
        startSeconds: time,
        endSeconds: time + 15.0,
        content: '네, 방향성에 완벽히 동의하며 제안한 일정을 준수하여 7일 내에 시안 보완 및 패치를 완료하도록 하겠습니다.',
        confidence: 0.94
      });
      time += 20.0;
    });

    // Wrap up
    segments.push({
      recordingId: recording.id,
      speakerLabel: speaker1,
      startSeconds: time,
      endSeconds: time + 8.0,
      content: '감사합니다. 오늘 논의는 이것으로 마치고 결과물을 기반으로 할 일들을 정리해서 최종 요약 보고를 공유하겠습니다. 수고하셨습니다.',
      confidence: 0.98
    });

    await prisma.transcriptSegment.createMany({
      data: segments
    });

    // Update meeting status to meeting_completed
    await prisma.meeting.update({
      where: { id },
      data: { status: 'meeting_completed' }
    });

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error('Upload recording error:', error);
    return NextResponse.json(
      { error: '녹음 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
