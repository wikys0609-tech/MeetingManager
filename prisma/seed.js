const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.taskConfirmation.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.aiSummary.deleteMany();
  await prisma.importantMoment.deleteMany();
  await prisma.transcriptSegment.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.meetingNote.deleteMany();
  await prisma.agendaRequest.deleteMany();
  await prisma.preMeetingOpinion.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.agenda.deleteMany();
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: '관리자',
      email: 'admin@meetinghub.local',
      passwordHash,
      role: 'admin',
      department: '경영지원팀',
      isActive: true,
    },
  });

  const requesterUser = await prisma.user.create({
    data: {
      name: '김기획',
      email: 'requester@meetinghub.local',
      passwordHash,
      role: 'requester',
      department: '기획팀',
      isActive: true,
    },
  });

  const devUser1 = await prisma.user.create({
    data: {
      name: '이개발',
      email: 'user1@meetinghub.local',
      passwordHash,
      role: 'general',
      department: '개발팀',
      isActive: true,
    },
  });

  const designUser1 = await prisma.user.create({
    data: {
      name: '박디자인',
      email: 'user2@meetinghub.local',
      passwordHash,
      role: 'general',
      department: '디자인팀',
      isActive: true,
    },
  });

  console.log('Users created:', {
    admin: adminUser.email,
    requester: requesterUser.email,
    dev: devUser1.email,
    design: designUser1.email,
  });

  // Create a past meeting (completed)
  const pastMeetingDate = new Date();
  pastMeetingDate.setDate(pastMeetingDate.getDate() - 3);

  const pastMeeting = await prisma.meeting.create({
    data: {
      title: 'UI/UX 신규 디자인 및 연동 관련 사전 회의',
      objective: '신규 프로젝트의 프런트엔드 연동 계획 수립 및 디자인 시안 확정',
      scheduledAt: pastMeetingDate,
      location: '회의실 A',
      status: 'post_confirmed',
      creatorId: requesterUser.id,
    },
  });

  // Add participants
  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: pastMeeting.id, userId: requesterUser.id, participantRole: '진행자', attendanceStatus: 'attending' },
      { meetingId: pastMeeting.id, userId: devUser1.id, participantRole: '개발자', attendanceStatus: 'attending' },
      { meetingId: pastMeeting.id, userId: designUser1.id, participantRole: '디자이너', attendanceStatus: 'attending' },
    ],
  });

  // Add agendas
  const agenda1 = await prisma.agenda.create({
    data: {
      meetingId: pastMeeting.id,
      title: '메인 페이지 디자인 시안 검토',
      description: '어두운 테마 기반의 글래스모피즘 디자인 시안 최종 확인',
      orderIndex: 1,
      decisionRequired: true,
      sourceType: 'new',
    },
  });

  const agenda2 = await prisma.agenda.create({
    data: {
      meetingId: pastMeeting.id,
      title: 'Next.js 15 & Prisma 연동 규격 정의',
      description: 'API Route 및 DB 스키마 동기화 방안 정의',
      orderIndex: 2,
      decisionRequired: true,
      sourceType: 'new',
    },
  });

  // Add decisions
  const decision1 = await prisma.decision.create({
    data: {
      meetingId: pastMeeting.id,
      agendaId: agenda1.id,
      content: '글래스모피즘 기반의 다크 테마 디자인 시안을 최종 승인함. 디테일한 아이콘 디자인만 추가 보완하기로 결정.',
      status: 'decided',
      sourceType: 'manual',
      isConfirmed: true,
    },
  });

  // Add tasks
  await prisma.task.create({
    data: {
      title: '메인 화면 피드백 반영한 최종 아이콘 에셋 전달',
      description: '다크 테마 디자인에 맞춰 세부 아이콘 리소스 보완 및 Figma 공유',
      assigneeId: designUser1.id,
      requesterId: requesterUser.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days later
      status: 'todo',
      priority: 'high',
      sourceType: 'ai_summary',
      meetingId: pastMeeting.id,
      decisionId: decision1.id,
      confirmationStatus: 'pending',
    },
  });

  const devTask = await prisma.task.create({
    data: {
      title: 'Prisma DB 스키마 정의 및 개발 환경 세팅',
      description: 'SQLite 연동 테스트 완료 및 깃 리포지토리 구성',
      assigneeId: devUser1.id,
      requesterId: requesterUser.id,
      dueDate: new Date(), // completed today
      status: 'completed',
      priority: 'medium',
      sourceType: 'ai_summary',
      meetingId: pastMeeting.id,
      completedAt: new Date(),
    },
  });

  await prisma.taskComment.create({
    data: {
      taskId: devTask.id,
      authorId: devUser1.id,
      content: 'Prisma 연동 및 DB 시드 생성을 완료했습니다. 깃허브 리포지토리에 커밋 예정입니다.',
      commentType: 'status_update',
    },
  });

  // Create an upcoming meeting (scheduled)
  const upcomingMeetingDate = new Date();
  upcomingMeetingDate.setDate(upcomingMeetingDate.getDate() + 1);
  upcomingMeetingDate.setHours(14, 0, 0, 0);

  const upcomingMeeting = await prisma.meeting.create({
    data: {
      title: 'AI 요약 시스템 및 DB 연동 점검 회의',
      objective: '백엔드 API 규격 점검 및 AI 사전 요약 성능 고도화 방안 논의',
      scheduledAt: upcomingMeetingDate,
      location: '회의실 B',
      status: 'pre_confirmed',
      creatorId: requesterUser.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: upcomingMeeting.id, userId: requesterUser.id, participantRole: '진행자', attendanceStatus: 'attending' },
      { meetingId: upcomingMeeting.id, userId: devUser1.id, participantRole: '개발자', attendanceStatus: 'attending' },
      { meetingId: upcomingMeeting.id, userId: designUser1.id, participantRole: '디자이너', attendanceStatus: 'undecided' },
    ],
  });

  await prisma.agenda.createMany({
    data: [
      {
        meetingId: upcomingMeeting.id,
        title: '지난 회의 결정사항 이행 상태 점검',
        description: '디자인 에셋 완료 상태 및 DB 스키마 적용 결과 확인',
        orderIndex: 1,
        decisionRequired: false,
        sourceType: 'carry_over',
        sourceMeetingId: pastMeeting.id,
      },
      {
        meetingId: upcomingMeeting.id,
        title: 'Gemini AI API 사전 요약 프롬프트 튜닝',
        description: '구조화된 요약 JSON의 정확도 향상 방안 논의',
        orderIndex: 2,
        decisionRequired: true,
        sourceType: 'new',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
