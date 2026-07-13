# 내부용 AI 회의·협업 관리 시스템 개발 명세서

문서 버전: v1.0  
목적: 코딩 전문 프로그램 또는 개발자가 바로 구현을 시작할 수 있도록 제품 범위, 기능 요구사항, 화면 구성, 데이터 구조, AI 처리 규칙과 MVP 우선순위를 정의한다.  
사용 환경: 소규모 조직 내부 전용  
제품 성격: 가벼운 회의 관리 시스템 + 최소한의 협업 기능  
핵심 원칙: AI가 초안을 만들고 사람이 검토·수정·확정한다.

---

## 1. 프로젝트 개요

### 1.1 프로젝트명

가칭: Internal AI Meeting Hub

### 1.2 한 줄 정의

회의 준비, 회의 기록, AI 요약, 사람의 검토, 할 일 관리와 후속 회의 연결을 하나의 가벼운 내부 웹 프로그램에서 처리하는 시스템이다.

### 1.3 해결하려는 문제

현재 회의 관련 정보가 여러 곳에 흩어질 가능성이 높다.

- 회의 전 안건은 메신저나 문서에 존재한다.
- 참고 자료는 파일, 링크, 메일 등에 분산된다.
- 회의 후 회의록 작성 방식이 사람마다 다르다.
- 녹음본이 있어도 다시 듣고 정리하는 데 시간이 많이 든다.
- 결정 사항과 업무 담당자가 명확하게 남지 않는다.
- 이전 회의의 미완료 항목이 다음 회의에서 누락된다.
- 회의에서 발생한 할 일이 실제 업무 관리로 이어지지 않는다.

본 시스템은 이 문제를 다음 흐름으로 해결한다.

회의 준비  
→ AI 사전 요약  
→ 사람의 검토  
→ 회의 녹음 및 참석자 기록  
→ AI 사후 요약  
→ 사람의 검토  
→ 할 일 관리  
→ 후속 회의 연결

---

## 2. 제품 목표와 비목표

### 2.1 제품 목표

1. 회의 준비 정보를 한 화면에 정리한다.
2. 이전 회의의 미완료 업무와 보류 안건을 다음 회의에 연결한다.
3. AI가 회의 전 준비 자료를 요약하고, 사람이 수정할 수 있도록 한다.
4. 회의 녹음본과 참석자 회의록을 함께 분석한다.
5. 결정 사항, 미결 사항, 할 일, 담당자, 마감일을 구조화한다.
6. 모든 AI 결과는 사람이 검토한 뒤 확정한다.
7. 회의에서 발생한 업무와 일반 업무를 하나의 할 일 구조로 관리한다.
8. 내부 사용에 맞게 설치와 운영을 단순하게 유지한다.

### 2.2 비목표

초기 버전에서는 다음 기능을 구현하지 않는다.

- 실시간 회의 참여 AI 봇
- Zoom, Google Meet, Microsoft Teams 자동 입장
- 실시간 자막
- 실시간 자동 요약
- 복잡한 결재선
- 다단계 승인 프로세스
- 칸반, 간트 차트 등 전문 프로젝트 관리 기능
- 사내 메신저 대체
- 실시간 공동 문서 편집
- 조직 전체 성과 분석
- 참석자 평가 또는 감정 분석
- 외부 고객용 멀티테넌트 SaaS 구조
- 복잡한 권한 체계
- 모바일 네이티브 앱

---

## 3. 사용자 유형

### 3.1 일반 사용자

- 회의를 생성한다.
- 회의에 참석한다.
- 사전 의견을 남긴다.
- 안건 추가를 요청한다.
- 회의 중 메모를 작성한다.
- 자신의 할 일을 확인하고 상태를 변경한다.
- 업무 배정 내용을 확인하거나 수정 요청한다.

### 3.2 회의 요청자

일반 사용자 기능에 더해 다음 권한을 가진다.

- 회의 정보를 등록하고 수정한다.
- 이전 회의 자료를 불러온다.
- AI 사전 요약을 생성한다.
- AI 결과를 수정하고 확정한다.
- 녹음본과 회의록을 등록한다.
- AI 사후 요약을 생성한다.
- 결정 사항과 할 일을 확정한다.
- 후속 회의를 생성한다.

### 3.3 관리자

초기 버전에서는 최소 기능만 제공한다.

- 사용자 등록 및 비활성화
- 기본 조직 정보 설정
- 파일 보관 기간 설정
- AI API 설정
- 시스템 사용량 확인
- 오류 로그 확인

---

## 4. 핵심 업무 흐름

### 4.1 단계 1: 회의 준비 정보 등록

회의 요청자는 다음 정보를 입력한다.

#### 필수 항목

- 회의 주제
- 참석 대상자
- 주요 안건

#### 선택 항목

- 회의 목표
- 참고 자료
- 회의 일시
- 장소 또는 온라인 링크
- 예상 결정 사항
- 사전 준비 요청
- 관련 태그
- 이전 회의 연결

#### 이전 회의 자료 불러오기

특정 회의의 후속 회의인 경우 이전 회의를 선택한다.

사용자는 이전 회의의 모든 내용을 자동으로 가져오지 않고, 다음 항목 중 필요한 것만 선택한다.

- 이전 회의 요약
- 결정 사항
- 미완료 업무
- 미결 안건
- 보류 항목
- 추가 확인 사항
- 첨부 자료
- 참석자
- 기존 안건

불러온 항목은 현재 회의에서 수정할 수 있다.

### 4.2 단계 2: AI 사전 요약 및 휴먼 터치

AI는 입력된 회의 정보와 참고 자료를 분석해 다음 결과를 생성한다.

- 회의 목적 요약
- 핵심 안건 정리
- 안건별 확인해야 할 질문
- 참석자별 사전 준비 사항
- 결정이 필요한 항목
- 이전 회의에서 이어지는 내용
- 미완료 업무 확인 목록
- 예상 진행 순서
- 누락 가능성이 있는 정보
- 회의 전 확인이 필요한 위험 요소

#### 사람의 검토 기능

회의 요청자는 다음 작업을 할 수 있다.

- 전체 문장 직접 수정
- 항목 추가
- 항목 삭제
- 항목 순서 변경
- 특정 카드만 다시 생성
- 최초 AI 결과로 되돌리기
- 최종 확정

#### 확정 전 규칙

- AI 결과는 자동 공유하지 않는다.
- 회의 요청자가 확정한 뒤 참석자에게 공유된다.
- 확정 후 원본 입력 정보가 변경되면 사전 요약 상태를 다시 `검토 필요`로 변경한다.

### 4.3 단계 3: 실제 회의 기록

회의 종료 후 다음 자료를 입력한다.

#### 필수 입력

다음 둘 중 하나 이상이 필요하다.

- 회의 녹음본
- 참석자가 작성한 회의록

#### 선택 입력

- 공동 회의 메모
- 중요 발언 표시
- 결정 후보
- 보류 항목
- 추후 확인 사항

#### 녹음본 처리

지원 파일 형식 예시:

- mp3
- wav
- m4a
- webm

처리 과정:

파일 업로드  
→ 음성 파일 저장  
→ 비동기 전사 작업  
→ 화자 분리  
→ 타임스탬프 생성  
→ 녹취록 저장  
→ AI 분석 가능 상태로 변경

#### 참석자 회의록

참석자는 자유 형식으로 회의록을 입력할 수 있다.

추가 구조화 필드는 선택 사항으로 제공한다.

- 관련 안건
- 결정 사항
- 할 일
- 미결 사항
- 중요 메모

정해진 양식을 강제하지 않는다.

### 4.4 단계 4: AI 사후 요약 및 휴먼 터치

AI는 다음 자료를 함께 분석한다.

- 회의 준비 정보
- AI 사전 요약 확정본
- 녹취록
- 참석자 회의록
- 공동 메모
- 중요 발언 표시
- 이전 회의 미완료 항목

AI 출력:

- 전체 회의 요약
- 안건별 논의 내용
- 결정 사항
- 미결 사항
- 보류 항목
- 추가 확인 사항
- 할 일
- 담당자
- 마감일
- 우선순위
- 후속 회의 필요 여부
- 후속 회의 추천 안건
- 이전 회의 항목의 처리 결과
- 충돌하거나 불명확한 기록
- 근거 발언 또는 근거 메모

#### 사람의 검토 기능

- AI 결과 직접 수정
- 결정 사항 확정
- 담당자 변경
- 마감일 변경
- 불명확 항목 확인
- 충돌 기록 해결
- 할 일 추가 및 삭제
- 후속 회의 여부 확정
- 최종 결과 확정

#### 확정 후 처리

- 회의 결과 화면 저장
- 참석자에게 내부 공유
- 할 일 생성
- 담당자 확인 요청
- 후속 회의 후보 생성
- 검색 대상에 포함

---

## 5. 회의 관련 추가 협업 기능 8개

### 5.1 사전 의견 입력

참석자가 회의 전에 안건별 의견이나 질문을 남긴다.

필드:

- 회의 ID
- 안건 ID
- 작성자
- 의견 또는 질문
- 공개 범위
- 작성일
- 상태

상태:

- 미검토
- 회의 반영
- 답변 완료
- 보류

### 5.2 안건 추가 요청

참석자가 새 안건을 제안한다.

필드:

- 요청 제목
- 요청 설명
- 요청자
- 제안된 안건
- 관련 자료
- 처리 상태
- 처리 의견

상태:

- 검토 중
- 현재 회의 반영
- 후속 회의 후보
- 제외

### 5.3 공동 회의 메모

참석자별 메모가 시간순으로 쌓이는 방식으로 구현한다.

초기 버전에서는 Google Docs 형태의 실시간 동시 편집을 구현하지 않는다.

필드:

- 회의 ID
- 작성자
- 작성 시간
- 메모 내용
- 관련 안건
- 중요 여부
- 메모 유형

메모 유형:

- 일반
- 결정 후보
- 할 일 후보
- 추후 확인
- 보류

### 5.4 중요 발언 표시

녹음 중 또는 녹취록 검토 중 중요한 구간을 표시한다.

표시 유형:

- 결정 사항
- 업무 요청
- 추후 확인
- 의견 충돌
- 중요 참고

필드:

- 회의 ID
- 녹음 ID
- 시작 시간
- 종료 시간
- 표시 유형
- 메모
- 작성자

### 5.5 할 일 등록

회의에서 발생한 업무를 구조화한다.

필드:

- 제목
- 상세 내용
- 담당자
- 요청자
- 마감일
- 상태
- 우선순위
- 생성 경로
- 관련 회의
- 관련 결정 사항
- 근거 발언
- 담당자 확인 상태

상태:

- 미착수
- 진행 중
- 완료
- 보류

우선순위:

- 낮음
- 보통
- 높음

생성 경로:

- 회의 AI 결과
- 회의 수동 등록
- 일반 업무 직접 등록
- 동료 업무 요청
- 확인 요청에서 생성

### 5.6 담당자 확인

업무 담당자는 배정된 업무를 확인한다.

응답 유형:

- 확인
- 담당자 변경 요청
- 업무 내용 수정 요청
- 마감일 조정 요청

필드:

- 업무 ID
- 담당자
- 응답 유형
- 의견
- 응답 일시
- 처리 상태

### 5.7 후속 회의 연결

현재 회의에서 다음 항목을 선택해 후속 회의를 생성한다.

- 미완료 업무
- 미결 안건
- 보류 항목
- 추가 조사 사항
- 재논의할 결정 사항
- 참고 자료

자동 입력 후보:

- 회의 제목
- 참석자
- 관련 태그
- 연결된 이전 회의
- 주요 안건
- 참고 자료

모든 자동 입력 값은 수정 가능해야 한다.

### 5.8 내 할 일 모아보기

사용자는 여러 회의와 일반 업무에서 자신에게 배정된 업무를 한 화면에서 확인한다.

필터:

- 전체
- 미착수
- 진행 중
- 완료
- 보류
- 마감 임박
- 확인 필요
- 회의 발생 업무
- 일반 업무

정렬:

- 마감일
- 생성일
- 우선순위
- 최근 수정일

---

## 6. 회의 외 경량 협업 기능

초기 범위에 모두 포함하지 않는다. 우선순위에 따라 단계적으로 구현한다.

### 6.1 1차 포함 권장 기능

#### 간단한 업무 요청

동료에게 일반 업무를 요청한다.

- 제목
- 내용
- 요청자
- 담당자
- 마감일
- 우선순위
- 첨부 자료
- 상태

#### 개인 및 팀 할 일

사용자가 업무를 직접 등록할 수 있다.

- 개인 업무
- 팀 업무
- 회의 발생 업무
- 동료 요청 업무

모든 업무는 동일한 `Task` 모델을 사용한다.

#### 확인 요청

문서, 결과물, 일정 또는 업무 내용을 상대방에게 확인받는다.

응답:

- 확인 완료
- 수정 필요
- 의견 있음

#### 자료 공유

내부 파일이나 링크를 공유한다.

- 자료명
- 설명
- 파일 또는 링크
- 공유 대상
- 태그
- 관련 업무
- 관련 회의

#### 업무 댓글 및 진행 메모

각 업무에 댓글과 진행 상황을 남긴다.

- 진행 내용
- 문의 사항
- 변경 사항
- 완료 보고

#### 간단한 의견 수집

간단한 내부 의견 수집 기능을 제공한다.

유형:

- 주관식
- 찬성·반대
- 단일 선택
- 복수 선택

### 6.2 추후 검토 기능

- 간단한 공지
- 일정 공유
- 담당자 찾기
- 업무 인수인계
- 반복 업무 체크리스트
- 팀별 업무 요청함

---

## 7. 권장 메뉴 구조

### 7.1 홈

표시 내용:

- 오늘의 회의
- 예정된 회의
- 검토가 필요한 회의
- 내 할 일
- 마감 임박 업무
- 담당자 확인 요청
- 최근 공유 자료

### 7.2 회의

하위 메뉴:

- 예정된 회의
- 완료된 회의
- 후속 회의
- 내가 만든 회의
- 내가 참석한 회의

### 7.3 업무

하위 메뉴:

- 내 할 일
- 팀 할 일
- 업무 요청
- 담당자 확인
- 완료 업무

### 7.4 협업

하위 메뉴:

- 확인 요청
- 의견 수집
- 공유 자료

### 7.5 검색

검색 대상:

- 회의 제목
- 회의 요약
- 안건
- 참석자
- 결정 사항
- 미결 사항
- 할 일
- 회의록
- 공유 자료

### 7.6 설정

- 내 프로필
- 알림 설정
- AI 설정
- 파일 보관 정책
- 사용자 관리
- 시스템 로그

---

## 8. 화면별 요구사항

### 8.1 로그인 화면

필수 기능:

- 이메일 로그인
- 비밀번호 로그인
- 로그인 상태 유지
- 비밀번호 변경

내부 전용이므로 초기에는 소셜 로그인 없이 구현할 수 있다.

### 8.2 홈 대시보드

카드:

- 오늘의 회의
- 검토 대기 회의
- 내 할 일
- 마감 임박
- 확인 요청
- 최근 회의

초기 버전에서는 차트보다 목록 중심으로 구성한다.

### 8.3 회의 생성 화면

섹션:

1. 기본 정보
2. 참석자
3. 주요 안건
4. 참고 자료
5. 이전 회의 불러오기
6. 사전 의견
7. 안건 추가 요청
8. AI 사전 요약

필수 동작:

- 임시 저장
- 수정
- 삭제
- AI 요약 생성
- 이전 회의 항목 선택
- 참석자 공유

### 8.4 AI 사전 요약 검토 화면

카드 구성:

- 회의 목적
- 핵심 안건
- 준비 사항
- 결정 필요 항목
- 이전 회의 연결 항목
- 예상 진행 순서
- 확인 필요 사항

각 카드 기능:

- 직접 수정
- 다시 생성
- 삭제
- 순서 이동
- 원본 보기

### 8.5 회의 진행 및 기록 화면

구성:

- 현재 안건
- 녹음 파일 업로드
- 참석자 회의록 입력
- 공동 메모
- 중요 발언 표시
- 보류 항목
- 추후 확인 사항

실시간 녹음은 선택 기능이다. 초기 버전에서는 파일 업로드 우선으로 구현한다.

### 8.6 녹취록 검토 화면

구성:

- 화자
- 시작 시간
- 종료 시간
- 발언 내용
- 신뢰도
- 수정 여부
- 중요 표시
- 해당 구간 재생

기능:

- 화자명 수정
- 텍스트 수정
- 구간 재생
- 중요 발언 표시
- 검색

### 8.7 AI 사후 요약 검토 화면

카드 구성:

- 전체 요약
- 안건별 논의
- 결정 사항
- 미결 사항
- 할 일
- 보류 항목
- 추가 확인
- 후속 회의
- 충돌 기록

할 일 편집 기능:

- 제목
- 담당자
- 마감일
- 우선순위
- 설명
- 근거
- 상태

### 8.8 회의 결과 화면

표시 내용:

- 회의 기본 정보
- 확정 요약
- 안건별 결과
- 결정 사항
- 미결 사항
- 할 일
- 첨부 자료
- 후속 회의
- 검토 이력

### 8.9 내 할 일 화면

목록 필드:

- 업무명
- 관련 회의
- 요청자
- 담당자
- 마감일
- 상태
- 우선순위
- 확인 상태

지원 동작:

- 상태 변경
- 담당자 확인
- 댓글 작성
- 완료 처리
- 수정 요청

### 8.10 일반 업무 등록 화면

회의와 무관한 업무를 등록한다.

필드:

- 제목
- 상세 내용
- 담당자
- 요청자
- 마감일
- 우선순위
- 첨부 자료
- 관련 태그

---

## 9. 데이터 모델

아래 구조는 관계형 데이터베이스 기준이다.

### 9.1 User

```text
id
name
email
password_hash
role
department
is_active
created_at
updated_at
```

### 9.2 Meeting

```text
id
title
objective
scheduled_at
location
online_url
status
creator_id
parent_meeting_id
confirmed_pre_summary_id
confirmed_post_summary_id
created_at
updated_at
deleted_at
```

Meeting status:

```text
draft
pre_summary_processing
pre_review
pre_confirmed
meeting_completed
transcription_processing
post_review
post_confirmed
closed
```

### 9.3 MeetingParticipant

```text
id
meeting_id
user_id
participant_role
attendance_status
created_at
```

Attendance status:

```text
invited
attending
not_attending
undecided
```

### 9.4 Agenda

```text
id
meeting_id
title
description
order_index
decision_required
source_type
source_meeting_id
created_at
updated_at
```

### 9.5 Attachment

```text
id
meeting_id
task_id
uploaded_by
filename
storage_path
mime_type
size_bytes
text_extraction_status
created_at
deleted_at
```

### 9.6 PreMeetingOpinion

```text
id
meeting_id
agenda_id
author_id
content
visibility
status
created_at
updated_at
```

### 9.7 AgendaRequest

```text
id
meeting_id
requester_id
title
description
status
resolution_note
created_at
updated_at
```

### 9.8 MeetingNote

```text
id
meeting_id
author_id
agenda_id
content
note_type
is_important
created_at
updated_at
```

### 9.9 Recording

```text
id
meeting_id
uploaded_by
storage_path
filename
duration_seconds
language
status
created_at
processed_at
deleted_at
```

Recording status:

```text
uploaded
queued
processing
completed
failed
```

### 9.10 TranscriptSegment

```text
id
recording_id
speaker_label
speaker_user_id
start_seconds
end_seconds
content
confidence
is_edited
created_at
updated_at
```

### 9.11 ImportantMoment

```text
id
meeting_id
recording_id
created_by
start_seconds
end_seconds
moment_type
note
created_at
```

### 9.12 AiSummary

```text
id
meeting_id
summary_type
version
source_snapshot
result_json
status
created_by
created_at
confirmed_at
confirmed_by
```

Summary type:

```text
pre_meeting
post_meeting
```

Summary status:

```text
generated
reviewing
confirmed
superseded
```

### 9.13 Decision

```text
id
meeting_id
agenda_id
content
status
source_type
source_reference
is_confirmed
created_at
updated_at
```

Decision status:

```text
decided
pending
revisit
cancelled
```

### 9.14 Task

```text
id
title
description
assignee_id
requester_id
due_date
status
priority
source_type
meeting_id
decision_id
confirmation_status
created_at
updated_at
completed_at
```

Confirmation status:

```text
not_required
pending
confirmed
change_requested
```

### 9.15 TaskComment

```text
id
task_id
author_id
content
comment_type
created_at
updated_at
```

### 9.16 TaskConfirmation

```text
id
task_id
user_id
response_type
comment
status
created_at
resolved_at
```

### 9.17 FollowUpLink

```text
id
source_meeting_id
target_meeting_id
linked_item_type
linked_item_id
created_at
```

### 9.18 ReviewRequest

```text
id
title
description
requester_id
reviewer_id
status
related_task_id
related_meeting_id
created_at
resolved_at
```

### 9.19 SharedResource

```text
id
title
description
resource_type
url
attachment_id
shared_by
visibility
created_at
updated_at
```

### 9.20 Poll

```text
id
title
description
poll_type
creator_id
status
expires_at
created_at
```

---

## 10. AI 처리 설계

### 10.1 AI 처리 원칙

1. AI는 초안을 생성한다.
2. AI가 생성한 결과는 자동 확정하지 않는다.
3. 결정 사항과 할 일은 가능한 한 근거를 포함한다.
4. 담당자가 불명확하면 임의로 확정하지 않는다.
5. 마감일이 불명확하면 추정값임을 표시한다.
6. 서로 다른 기록이 충돌하면 하나를 임의로 선택하지 않는다.
7. 녹취 품질이 낮은 구간은 검토 필요로 표시한다.
8. AI 결과는 구조화된 JSON으로 반환한다.

### 10.2 사전 요약 입력

입력 데이터:

- 회의 제목
- 회의 목표
- 참석자
- 주요 안건
- 참고 자료 텍스트
- 이전 회의 요약
- 이전 회의 미완료 업무
- 사전 의견
- 안건 추가 요청

### 10.3 사전 요약 출력 구조 예시

```json
{
  "meeting_purpose": "회의 목적 요약",
  "key_agendas": [
    {
      "agenda_id": 1,
      "title": "안건 제목",
      "summary": "안건 설명",
      "questions": ["확인 질문"],
      "decision_required": true
    }
  ],
  "participant_preparation": [
    {
      "participant_id": 10,
      "items": ["준비 항목"]
    }
  ],
  "carry_over_items": [
    {
      "source_meeting_id": 3,
      "type": "unfinished_task",
      "content": "이전 업무"
    }
  ],
  "expected_flow": ["진행 순서"],
  "missing_information": ["누락 가능 정보"],
  "risks": ["확인 필요 사항"]
}
```

### 10.4 사후 요약 입력

입력 데이터:

- 확정된 사전 요약
- 녹취록
- 참석자 회의록
- 공동 메모
- 중요 발언
- 이전 회의 미완료 업무
- 기존 안건

### 10.5 사후 요약 출력 구조 예시

```json
{
  "meeting_summary": "전체 요약",
  "agenda_results": [
    {
      "agenda_id": 1,
      "discussion_summary": "논의 내용",
      "decision_status": "decided",
      "decision": "결정 사항",
      "evidence": [
        {
          "type": "transcript",
          "recording_id": 2,
          "start_seconds": 320,
          "end_seconds": 355
        }
      ]
    }
  ],
  "action_items": [
    {
      "title": "업무명",
      "description": "업무 설명",
      "assignee_user_id": 7,
      "assignee_confidence": 0.91,
      "due_date": "2026-08-15",
      "due_date_is_inferred": false,
      "priority": "high",
      "evidence": []
    }
  ],
  "unresolved_issues": [],
  "parking_lot": [],
  "conflicts": [
    {
      "type": "record_conflict",
      "description": "녹취록과 참석자 메모의 내용이 다름",
      "sources": []
    }
  ],
  "follow_up": {
    "required": true,
    "suggested_title": "후속 회의 제목",
    "suggested_agendas": []
  }
}
```

### 10.6 AI 오류 방지 규칙

- 명시되지 않은 참석자를 담당자로 지정하지 않는다.
- 회의에서 언급되지 않은 결론을 생성하지 않는다.
- 의견을 결정 사항으로 바꾸지 않는다.
- “검토하자”, “생각해보자”를 확정된 업무로 처리하지 않는다.
- 모호한 상대 날짜는 회의 일시를 기준으로 계산하되 추정 표시를 한다.
- 참석자 회의록과 녹취가 충돌하면 `conflicts` 배열에 기록한다.
- 근거를 찾을 수 없는 항목은 `evidence`를 비우고 검토 필요 표시를 한다.

---

## 11. API 초안

REST API 기준 예시다.

### 11.1 인증

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PATCH  /api/auth/password
```

### 11.2 사용자

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

### 11.3 회의

```text
GET    /api/meetings
POST   /api/meetings
GET    /api/meetings/:id
PATCH  /api/meetings/:id
DELETE /api/meetings/:id
POST   /api/meetings/:id/duplicate
POST   /api/meetings/:id/follow-up
```

### 11.4 참석자

```text
GET    /api/meetings/:id/participants
POST   /api/meetings/:id/participants
DELETE /api/meetings/:id/participants/:participantId
PATCH  /api/meetings/:id/participants/:participantId
```

### 11.5 안건

```text
GET    /api/meetings/:id/agendas
POST   /api/meetings/:id/agendas
PATCH  /api/agendas/:agendaId
DELETE /api/agendas/:agendaId
```

### 11.6 이전 회의 불러오기

```text
GET  /api/meetings/:id/previous-candidates
GET  /api/meetings/:sourceId/carry-over-items
POST /api/meetings/:targetId/import-items
```

### 11.7 사전 의견 및 안건 요청

```text
GET    /api/meetings/:id/opinions
POST   /api/meetings/:id/opinions
PATCH  /api/opinions/:opinionId
DELETE /api/opinions/:opinionId

GET    /api/meetings/:id/agenda-requests
POST   /api/meetings/:id/agenda-requests
PATCH  /api/agenda-requests/:requestId
```

### 11.8 AI 사전 요약

```text
POST /api/meetings/:id/pre-summary/generate
GET  /api/meetings/:id/pre-summary
PATCH /api/meetings/:id/pre-summary
POST /api/meetings/:id/pre-summary/regenerate-section
POST /api/meetings/:id/pre-summary/confirm
```

### 11.9 녹음 및 녹취

```text
POST   /api/meetings/:id/recordings
GET    /api/meetings/:id/recordings
GET    /api/recordings/:recordingId
POST   /api/recordings/:recordingId/transcribe
GET    /api/recordings/:recordingId/transcript
PATCH  /api/transcript-segments/:segmentId
DELETE /api/recordings/:recordingId
```

### 11.10 공동 메모와 중요 발언

```text
GET    /api/meetings/:id/notes
POST   /api/meetings/:id/notes
PATCH  /api/notes/:noteId
DELETE /api/notes/:noteId

GET    /api/meetings/:id/important-moments
POST   /api/meetings/:id/important-moments
PATCH  /api/important-moments/:momentId
DELETE /api/important-moments/:momentId
```

### 11.11 AI 사후 요약

```text
POST /api/meetings/:id/post-summary/generate
GET  /api/meetings/:id/post-summary
PATCH /api/meetings/:id/post-summary
POST /api/meetings/:id/post-summary/regenerate-section
POST /api/meetings/:id/post-summary/confirm
```

### 11.12 업무

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/comments
GET    /api/tasks/:id/comments
POST   /api/tasks/:id/confirm
POST   /api/tasks/:id/request-change
```

### 11.13 확인 요청

```text
GET    /api/review-requests
POST   /api/review-requests
GET    /api/review-requests/:id
PATCH  /api/review-requests/:id
POST   /api/review-requests/:id/respond
```

### 11.14 자료 공유

```text
GET    /api/resources
POST   /api/resources
GET    /api/resources/:id
PATCH  /api/resources/:id
DELETE /api/resources/:id
```

### 11.15 의견 수집

```text
GET    /api/polls
POST   /api/polls
GET    /api/polls/:id
POST   /api/polls/:id/respond
PATCH  /api/polls/:id/close
```

---

## 12. 권장 기술 스택

내부용 경량 프로그램 기준이다.

### 12.1 프런트엔드

권장:

- Next.js
- TypeScript
- React
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod

### 12.2 백엔드

선택지 A:

- Next.js API Routes 또는 Server Actions

선택지 B:

- FastAPI
- Python
- Pydantic
- SQLAlchemy

초기 개발 속도를 우선하면 Next.js 단일 프로젝트가 가장 가볍다.

음성 처리와 AI 작업이 복잡해지면 FastAPI 작업 서버를 별도로 추가한다.

### 12.3 데이터베이스

- PostgreSQL
- Prisma ORM 또는 SQLAlchemy
- 소규모 로컬 테스트는 SQLite 가능
- 운영은 PostgreSQL 권장

### 12.4 파일 저장

초기:

- 로컬 파일 시스템 또는 사내 NAS

확장:

- S3 호환 객체 저장소
- MinIO
- AWS S3

### 12.5 비동기 작업

초기:

- 단순 DB job table + 주기적 worker

확장:

- Redis
- BullMQ
- Celery

### 12.6 AI 및 음성 인식

모델 제공자를 교체할 수 있도록 어댑터 계층을 둔다.

```text
AIProvider
- generatePreMeetingSummary()
- generatePostMeetingSummary()
- regenerateSection()
- validateStructuredOutput()

TranscriptionProvider
- transcribe()
- getJobStatus()
```

---

## 13. 권장 프로젝트 구조

Next.js 단일 프로젝트 예시:

```text
src/
  app/
    login/
    dashboard/
    meetings/
      new/
      [id]/
        overview/
        preparation/
        recording/
        transcript/
        result/
    tasks/
    collaboration/
      reviews/
      resources/
      polls/
    settings/
  components/
    meeting/
    task/
    ai/
    common/
  server/
    auth/
    db/
    services/
      meeting.service.ts
      task.service.ts
      ai.service.ts
      transcription.service.ts
      file.service.ts
    repositories/
    jobs/
  lib/
    validation/
    permissions/
    date/
    logger/
  types/
prisma/
  schema.prisma
storage/
tests/
```

---

## 14. 파일 처리 규칙

### 14.1 업로드 제한

초기 권장값:

- 음성 파일 최대 500MB
- 일반 첨부 파일 최대 50MB
- 회의당 음성 파일 최대 3개
- 회의당 첨부 파일 최대 20개

### 14.2 허용 형식

문서:

- pdf
- docx
- xlsx
- pptx
- txt
- md

음성:

- mp3
- wav
- m4a
- webm

### 14.3 보관 정책

관리자 설정값:

- 녹음본 보관 기간
- 녹취록 보관 기간
- 첨부 자료 보관 기간

초기 기본값 예시:

- 녹음본 90일
- 녹취록 무기한 또는 수동 삭제
- 첨부 자료 무기한 또는 수동 삭제

---

## 15. 알림

초기 버전에서는 프로그램 내부 알림만 구현한다.

알림 대상:

- 회의 참석 요청
- 회의 사전 요약 확정
- 회의 결과 확정
- 할 일 배정
- 담당자 확인 요청
- 업무 수정 요청
- 마감 임박
- 후속 회의 생성
- 확인 요청 도착

추후 이메일 또는 사내 메신저 연동을 검토한다.

---

## 16. 검색

### 16.1 검색 대상

- 회의 제목
- 회의 목표
- 안건
- 참석자
- 확정 요약
- 결정 사항
- 미결 사항
- 할 일
- 참석자 회의록
- 공동 메모
- 공유 자료

### 16.2 필터

- 날짜 범위
- 참석자
- 회의 상태
- 업무 상태
- 태그
- 작성자
- 후속 회의 여부

---

## 17. 보안과 개인정보

내부용이라도 녹음과 회의록은 민감 정보가 될 수 있다.

필수 요구사항:

- 로그인한 사용자만 접근
- 회의 참석자와 회의 요청자 중심의 접근 제한
- 관리자라도 필요 이상의 원문 접근을 제한할 수 있도록 고려
- 파일 다운로드 권한 검사
- 녹음 사실 고지
- 업로드 및 삭제 이력 기록
- AI API로 전송하는 데이터 최소화
- 비밀번호 해시 저장
- HTTPS 적용
- 데이터베이스 백업
- 환경 변수로 API 키 관리
- 로그에 회의 원문과 AI API 키를 남기지 않음

---

## 18. 감사 및 변경 이력

다음 작업은 로그로 남긴다.

- 회의 생성
- 회의 수정
- 이전 회의 자료 불러오기
- AI 요약 생성
- AI 요약 재생성
- AI 결과 확정
- 녹음 업로드
- 녹취 수정
- 결정 사항 수정
- 업무 담당자 변경
- 업무 완료
- 후속 회의 생성
- 파일 삭제

로그 필드:

```text
user_id
action
entity_type
entity_id
before_data
after_data
created_at
```

---

## 19. MVP 우선순위

### 19.1 P0: 반드시 구현

- 로그인
- 사용자 관리
- 회의 생성 및 수정
- 참석자 등록
- 참고 자료 업로드
- 안건 관리
- 이전 회의 선택
- 이전 회의 항목 불러오기
- AI 사전 요약
- AI 사전 요약 수정 및 확정
- 녹음 파일 업로드
- 음성 전사
- 참석자 회의록 입력
- 공동 회의 메모
- 중요 발언 표시
- AI 사후 요약
- AI 사후 요약 수정 및 확정
- 결정 사항
- 미결 사항
- 할 일 생성
- 담당자 확인
- 후속 회의 생성
- 내 할 일
- 기본 검색

### 19.2 P1: MVP 이후 빠르게 추가

- 일반 업무 직접 등록
- 업무 요청
- 업무 댓글
- 확인 요청
- 자료 공유
- 간단한 의견 수집
- 내부 알림
- 사용자별 필터

### 19.3 P2: 필요성 확인 후 추가

- 공지
- 팀 일정
- 반복 업무
- 인수인계
- 팀별 요청함
- 외부 메신저 연동
- 이메일 발송
- 실시간 브라우저 녹음

---

## 20. 개발 단계

### 20.1 1단계: 기본 기반

- 프로젝트 생성
- 인증
- 사용자
- 데이터베이스
- 파일 업로드
- 공통 레이아웃
- 회의 CRUD

### 20.2 2단계: 회의 준비

- 참석자
- 안건
- 참고 자료
- 이전 회의 불러오기
- 사전 의견
- 안건 추가 요청
- AI 사전 요약
- 휴먼 터치

### 20.3 3단계: 회의 기록

- 녹음 파일
- 전사 작업
- 녹취록
- 참석자 회의록
- 공동 메모
- 중요 발언

### 20.4 4단계: 회의 결과

- AI 사후 요약
- 결과 편집
- 결정 사항
- 미결 사항
- 할 일
- 담당자 확인
- 후속 회의

### 20.5 5단계: 일반 협업

- 일반 업무
- 댓글
- 확인 요청
- 자료 공유
- 의견 수집

### 20.6 6단계: 안정화

- 접근 권한
- 오류 처리
- 로그
- 백업
- 성능 최적화
- 파일 정리
- 사용자 테스트

---

## 21. 핵심 승인 기준

### 21.1 회의 준비

- 사용자가 5분 안에 회의를 생성할 수 있다.
- 이전 회의의 필요한 항목만 선택해 가져올 수 있다.
- AI 사전 요약의 각 항목을 개별 수정할 수 있다.
- AI 결과를 확정하기 전에는 참석자용 확정본으로 표시되지 않는다.

### 21.2 회의 기록

- 음성 파일 업로드 상태를 확인할 수 있다.
- 전사 실패 시 재처리할 수 있다.
- 녹취록의 화자와 내용을 수정할 수 있다.
- 자유 형식 회의록을 추가할 수 있다.
- 중요 발언과 녹음 시간을 연결할 수 있다.

### 21.3 회의 결과

- AI가 안건별 논의 결과를 구분한다.
- 결정 사항과 미결 사항을 분리한다.
- 담당자가 불명확한 업무는 검토 필요로 표시한다.
- 사람이 모든 결과를 수정할 수 있다.
- 확정된 할 일이 담당자 화면에 표시된다.
- 후속 회의 생성 시 선택 항목이 자동으로 반영된다.

### 21.4 업무

- 회의 업무와 일반 업무가 같은 목록에서 관리된다.
- 생성 경로를 구분할 수 있다.
- 담당자가 업무를 확인하거나 수정 요청할 수 있다.
- 업무 댓글과 상태 변경 이력이 남는다.

---

## 22. 예외 처리

### 22.1 녹음 없이 회의록만 있는 경우

참석자 회의록과 공동 메모만 사용해 AI 사후 요약을 생성한다.

결과 화면에 `녹취 근거 없음`을 표시한다.

### 22.2 회의록 없이 녹음만 있는 경우

녹취록을 중심으로 분석한다.

화자 분리 정확도가 낮은 경우 담당자 추출을 제한한다.

### 22.3 녹음과 회의록이 충돌하는 경우

AI가 임의로 하나를 선택하지 않는다.

충돌 항목으로 분리하고 사람이 확인한다.

### 22.4 담당자를 찾을 수 없는 경우

담당자 미지정 상태로 생성한다.

확정 전에 담당자 선택을 요구한다.

### 22.5 마감일이 없는 경우

마감일 미정 상태로 생성한다.

AI가 추정한 경우 추정 표시를 한다.

### 22.6 AI 호출 실패

- 재시도 버튼 제공
- 오류 메시지 표시
- 사용자가 수동으로 계속 작성 가능
- 기존 입력 데이터 보존

### 22.7 전사 실패

- 파일 재업로드 없이 재처리
- 실패 원인 기록
- 다른 전사 제공자 선택 가능하도록 서비스 계층 분리

---

## 23. 환경 변수 예시

```env
DATABASE_URL=
AUTH_SECRET=
FILE_STORAGE_PATH=
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
TRANSCRIPTION_PROVIDER=
TRANSCRIPTION_API_KEY=
MAX_AUDIO_FILE_MB=500
MAX_ATTACHMENT_FILE_MB=50
RECORDING_RETENTION_DAYS=90
```

---

## 24. 테스트 항목

### 24.1 단위 테스트

- 회의 상태 변경
- 이전 회의 항목 불러오기
- 업무 생성
- 담당자 확인
- 후속 회의 생성
- AI JSON 검증
- 접근 권한 검사

### 24.2 통합 테스트

- 회의 생성부터 사전 요약 확정
- 녹음 업로드부터 녹취 완료
- 사후 요약부터 할 일 생성
- 담당자 확인
- 후속 회의 생성

### 24.3 사용자 테스트

- 회의 생성 시간
- AI 결과 수정 비율
- 잘못된 담당자 비율
- 잘못된 결정 사항 비율
- 회의 결과 확정 시간
- 회의 후 할 일 누락률
- 이전 회의 미완료 업무 반영률

---

## 25. 완료 정의

기능은 다음 조건을 모두 만족해야 완료로 본다.

- 요구 기능이 구현되어 있다.
- 빈 상태, 오류 상태, 로딩 상태가 존재한다.
- 권한 검사가 적용되어 있다.
- 데이터가 새로고침 후에도 유지된다.
- 모바일 웹에서 최소한의 사용이 가능하다.
- 주요 동작에 테스트가 존재한다.
- 사용자가 오류 발생 후 작업을 계속할 수 있다.
- AI 결과를 사람이 수정할 수 있다.
- AI 원본과 확정본이 구분된다.
- 로그에 민감 정보가 과도하게 남지 않는다.

---

## 26. 최종 제품 원칙

1. 회의 관리가 제품의 중심이다.
2. 협업 기능은 회의 결과를 실행하는 데 필요한 수준까지만 제공한다.
3. 기능 수보다 사용 흐름의 단순성을 우선한다.
4. 사용자가 정해진 양식에 맞춰 과도하게 입력하게 만들지 않는다.
5. AI는 결론을 자동 확정하지 않는다.
6. 사람의 검토와 수정이 항상 가능해야 한다.
7. 이전 회의와 후속 회의의 연결이 자연스러워야 한다.
8. 회의 업무와 일반 업무는 하나의 `Task` 모델로 관리한다.
9. 실시간 기능보다 안정적인 비동기 처리를 우선한다.
10. 외부 서비스 연동 없이도 내부에서 완결되도록 한다.
