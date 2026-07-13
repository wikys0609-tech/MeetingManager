import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.AI_API_KEY || '';
const modelName = process.env.AI_MODEL || 'gemini-2.5-flash';

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to return realistic mock pre-meeting summary
function getMockPreMeetingSummary(meeting: any) {
  const agendas = meeting.agendas || [];
  return {
    meeting_purpose: `본 회의는 '${meeting.title}'을(를) 목적으로 하며, 주요 안건들을 검토하고 신속한 결정을 내리기 위해 준비되었습니다.`,
    key_agendas: agendas.map((a: any) => ({
      agenda_id: a.id,
      title: a.title,
      summary: a.description || '이 안건에 대해 구체적인 논의를 진행하고 해결 방안을 도출합니다.',
      questions: [
        '주요 구현 일정 및 리소스가 충분한가요?',
        '이전에 제기된 병목 현상이 해결되었습니까?'
      ],
      decision_required: a.decisionRequired
    })),
    participant_preparation: (meeting.participants || []).map((p: any) => ({
      participant_name: p.user?.name || '참석자',
      items: [
        '담당 영역의 현황 브리핑 자료 준비',
        '논의 사항에 대한 사전 의견 검토'
      ]
    })),
    carry_over_items: [
      {
        source_meeting_title: '이전 회의',
        type: 'unfinished_task',
        content: '인프라 및 환경 설정 동기화'
      }
    ],
    expected_flow: [
      '1. 개회 및 이전 결정사항 이행 상태 공유 (5분)',
      '2. 각 안건별 현황 공유 및 집중 토론 (30분)',
      '3. 할 일 분배 및 마감일 지정 (10분)',
      '4. 후속 일정 확인 및 폐회 (5분)'
    ],
    missing_information: [
      '일부 리소스 세부 견적서 및 일정 검토용 캘린더 연동 필요'
    ],
    risks: [
      '주요 마일스톤 대비 개발 리소스 투입이 지연될 우려가 있음'
    ]
  };
}

// Helper to return realistic mock post-meeting summary
function getMockPostMeetingSummary(meeting: any) {
  const agendas = meeting.agendas || [];
  return {
    meeting_summary: `회의 '${meeting.title}'에서 각 안건에 대해 심도 있게 논의하였으며, 최종 목표 달성을 위한 구체적인 일정과 담당 업무를 조율하였습니다.`,
    agenda_results: agendas.map((a: any) => ({
      agenda_id: a.id,
      discussion_summary: `${a.title}에 대해 각 팀의 현 상황을 점검하고, 리스크 요인을 최소화하기 위한 의견을 나누었습니다.`,
      decision_status: a.decisionRequired ? 'decided' : 'revisit',
      decision: a.decisionRequired 
        ? '논의된 방향성에 합의하고 담당자 배정 및 일정 내 구현을 최종 승인함.'
        : '추가 검토 및 피드백 수렴 후 차기 회의에서 확정하기로 보류함.',
      evidence: '녹취록 및 공유 메모 근거 (facilitator 브리핑 요약)'
    })),
    action_items: (meeting.participants || []).map((p: any, idx: number) => ({
      title: `${agendas[idx % agendas.length]?.title || '회의 후속 조치'} 관련 상세 구현 및 피드백 반영`,
      description: '회의에서 공유된 세부 요구사항을 충실히 반영하여 시안 보완 및 검토 요청 진행.',
      assignee_name: p.user?.name || '담당자',
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0], // 7 days later
      priority: idx % 3 === 0 ? 'high' : idx % 3 === 1 ? 'medium' : 'low'
    })),
    unresolved_issues: [
      '외부 API 연동 지연 관련 대응 방안 및 일정 조율 건'
    ],
    parking_lot: [
      '장기 유지보수 및 자동화 빌드 파이프라인 고도화 계획'
    ],
    conflicts: [],
    follow_up: {
      required: true,
      suggested_title: `${meeting.title} 후속 피드백 점검 회의`,
      suggested_agendas: ['1. 할 일 완료 상태 점검', '2. 추가 요구사항 및 보완사항 검토']
    }
  };
}

export async function generatePreMeetingSummary(meetingData: any) {
  if (!genAI) {
    console.log('Using mock Pre-Meeting Summary (AI_API_KEY not configured)');
    return getMockPreMeetingSummary(meetingData);
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `
당신은 회의 준비 분석가입니다. 아래 제공되는 회의 상세 정보를 종합적으로 분석하고, 사전 준비 요약을 작성해주세요.
결과는 반드시 한국어로 작성하며, 아래 JSON 스키마를 엄격히 준수하여 순수한 JSON으로만 반환해 주세요.

## 회의 정보
- 제목: ${meetingData.title}
- 목적/목표: ${meetingData.objective || '미지정'}
- 일정: ${meetingData.scheduledAt}
- 안건: ${JSON.stringify(meetingData.agendas || [])}
- 참석자: ${JSON.stringify(meetingData.participants || [])}

## 출력 JSON 스키마 예시
{
  "meeting_purpose": "회의 목적 요약",
  "key_agendas": [
    {
      "agenda_id": "안건 ID",
      "title": "안건 제목",
      "summary": "안건 상세 요약",
      "questions": ["안건별 확인해야 할 핵심 질문 1", "2"],
      "decision_required": true
    }
  ],
  "participant_preparation": [
    {
      "participant_name": "참석자 이름",
      "items": ["사전 준비해야 할 사항 1", "2"]
    }
  ],
  "carry_over_items": [
    {
      "source_meeting_title": "이전 회의 제목",
      "type": "unfinished_task 또는 pending_agenda",
      "content": "미완료 업무 혹은 보류 안건 설명"
    }
  ],
  "expected_flow": ["회의 예상 진행 시간 및 순서"],
  "missing_information": ["사전에 누락되었을 수 있는 정보 목록"],
  "risks": ["회의 전 확인해야 할 위험 요소"]
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Pre-Meeting Summary generate error:', error);
    return getMockPreMeetingSummary(meetingData);
  }
}

export async function generatePostMeetingSummary(meetingData: any) {
  if (!genAI) {
    console.log('Using mock Post-Meeting Summary (AI_API_KEY not configured)');
    return getMockPostMeetingSummary(meetingData);
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `
당신은 전문 회의 서기 및 요약 AI입니다. 아래 제공되는 회의 준비 정보, 안건 정보, 참석자가 작성한 회의록/메모, 녹취 데이터를 분석하여 회의 결과 요약을 작성해주세요.
결과는 반드시 한국어로 작성하며, 아래 JSON 스키마를 엄격히 준수하여 순수한 JSON으로만 반환해 주세요.

## 회의 및 기록 정보
- 제목: ${meetingData.title}
- 안건: ${JSON.stringify(meetingData.agendas || [])}
- 메모/회의록: ${JSON.stringify(meetingData.notes || [])}
- 녹음/녹취 텍스트: ${JSON.stringify(meetingData.transcripts || [])}

## 출력 JSON 스키마 예시
{
  "meeting_summary": "전체 회의 요약",
  "agenda_results": [
    {
      "agenda_id": "안건 ID",
      "discussion_summary": "논의 내용 요약",
      "decision_status": "decided 또는 pending 또는 revisit 또는 cancelled",
      "decision": "결정된 사항",
      "evidence": "근거 내용 (예: 녹취록 타임스탬프 또는 메모 작성자)"
    }
  ],
  "action_items": [
    {
      "title": "업무명",
      "description": "세부 업무 내용",
      "assignee_name": "담당자 이름 (회의 정보에 명시된 참석자 이름 중 매칭)",
      "due_date": "YYYY-MM-DD 형식 (회의일 기준으로 추론 및 계산하여 설정)",
      "priority": "low 또는 medium 또는 high"
    }
  ],
  "unresolved_issues": ["미결 사항 목록"],
  "parking_lot": ["보류 항목"],
  "conflicts": [
    {
      "type": "record_conflict 등",
      "description": "기록 간의 상충되는 정보나 의견 충돌 사항 설명",
      "sources": "출처 정보"
    }
  ],
  "follow_up": {
    "required": true,
    "suggested_title": "후속 회의 제목 제안",
    "suggested_agendas": ["후속 회의 안건 제안 1", "2"]
  }
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Post-Meeting Summary generate error:', error);
    return getMockPostMeetingSummary(meetingData);
  }
}
