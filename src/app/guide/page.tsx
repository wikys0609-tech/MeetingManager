'use client';

import React, { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { 
  BookOpen, Calendar, CheckSquare, Users, Settings, 
  HelpCircle, ChevronRight, AlertCircle, Info, Sparkles, Star
} from 'lucide-react';

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
    { id: 'intro', name: '접속 및 대시보드', icon: HelpCircle },
    { id: 'new_meeting', name: '새 회의 등록 & 안건 설정', icon: Calendar },
    { id: 'meeting_room', name: '회의 진행 & AI 분석', icon: Sparkles },
    { id: 'tasks', name: '업무 관리함 & AI 연동', icon: CheckSquare },
    { id: 'admin', name: '사용자 관리 (Admin)', icon: Settings },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Guide Navigation Menu */}
        <div className="lg:w-64 shrink-0 space-y-4">
          <div className="flex items-center gap-2 border-b border-card-border pb-3">
            <BookOpen className="text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">사용자 매뉴얼</h2>
          </div>

          <div className="glass-panel p-2 rounded-2xl border border-card-border flex flex-col gap-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} />
                    {sec.name}
                  </span>
                  {isActive && <ChevronRight size={12} />}
                </button>
              );
            })}
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-card-border/50 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-400">💡 권장 테스트 계정</p>
            <p>• 김기획 (개설자): requester@meetinghub.local</p>
            <p>• 이개발 (팀원): user1@meetinghub.local</p>
            <p>• 관리자 (Admin): admin@meetinghub.local</p>
            <p className="pt-1">비밀번호 공통: <code className="text-indigo-300">password123</code></p>
          </div>
        </div>

        {/* Right Side: Guide Rich Content Panel */}
        <div className="flex-1 space-y-6">
          
          {/* Section 1: Intro */}
          {activeSection === 'intro' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5 border-b border-card-border pb-3">
                <h3 className="text-lg font-bold text-white">1. 접속 및 대시보드 사용 가이드</h3>
                <p className="text-xs text-slate-400">시스템 진입 계정 정보와 첫 화면 활용 방법을 설명합니다.</p>
              </div>

              {/* Screenshot */}
              <div className="space-y-1.5">
                <div className="glass-panel rounded-2xl border border-card-border overflow-hidden p-1.5 bg-slate-950/50 shadow-2xl">
                  <img 
                    src="/images/manual/dashboard.png" 
                    alt="대시보드 화면 스크린샷" 
                    className="w-full rounded-xl border border-card-border/50 max-h-[400px] object-cover object-top"
                  />
                </div>
                <p className="text-[10px] text-center text-slate-500 italic">그림 1: 메인 대시보드 인터페이스</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">🔑 1-1. 시스템 접속 및 테스트 계정</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  로그인 화면에서 이메일과 비밀번호를 입력해 입장합니다. 
                  메인 화면 하단에 탑재된 <strong>"테스트 계정 빠른 선택"</strong> 도구를 클릭하면 
                  해당 권한별 계정 정보가 자동으로 완성되어 빠르고 안정적으로 다양한 역할을 오가며 테스트할 수 있습니다.
                </p>
                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 space-y-1 flex items-start gap-2">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">계정 권한 분리:</span> 일반 팀원은 후속 업무 피드백과 공동 메모에 참여하며, 회의 개설자(Requester)는 사전/사후 요약 보고서를 최종 확정하고 승인하는 핵심 액션 권한을 가집니다.
                  </div>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">📊 1-2. 대시보드 구성 요소 및 행동 유도 (CTA)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  로그인 성공 후 보게 되는 메인 화면으로, 시스템의 중요 이벤트를 한눈에 요약합니다.
                </p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>오늘 예정된 회의</strong>: 금일 진행해야 하는 일정을 시간순으로 나열합니다.</li>
                  <li><strong>최근 완료된 회의록</strong>: AI 요약이 확정된 아카이브 리스트입니다.</li>
                  <li><strong>검토 대기중인 회의</strong>: AI 사전/사후 분석이 수행되어 회의 개설자의 최종 확정 검토를 기다리는 실시간 목록입니다.</li>
                  <li><strong>내 할 일 목록 (Phase 1 가중치 정렬)</strong>: 나에게 할당된 작업이 <code>지연 ➔ 마감 임박 ➔ 기한 순</code>으로 가중치를 부여받아 동적으로 정렬 및 시각화됩니다.</li>
                </ul>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                  <Star size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">공통 EmptyState 연동:</span> 리스트 데이터가 비어 있을 때 오작동 상태로 인지하지 않도록, 공통 빈 화면 컴포넌트(EmptyState)를 탑재하고 신규 회의 개설 등의 핵심 행동(CTA) 버튼을 배치했습니다.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: New Meeting */}
          {activeSection === 'new_meeting' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5 border-b border-card-border pb-3">
                <h3 className="text-lg font-bold text-white">2. 새 회의 등록 및 안건 설정</h3>
                <p className="text-xs text-slate-400">편리한 정보 기입과 입력 분실을 방지하는 생성 양식 화면을 설명합니다.</p>
              </div>

              {/* Screenshot */}
              <div className="space-y-1.5">
                <div className="glass-panel rounded-2xl border border-card-border overflow-hidden p-1.5 bg-slate-950/50 shadow-2xl">
                  <img 
                    src="/images/manual/meetings.png" 
                    alt="회의 목록 및 생성 화면 스크린샷" 
                    className="w-full rounded-xl border border-card-border/50 max-h-[400px] object-cover object-top"
                  />
                </div>
                <p className="text-[10px] text-center text-slate-500 italic">그림 2: 회의 생성 폼 & 목록 인터페이스</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">🛡️ 2-1. 임시 저장 및 데이터 유실 주의 경고 (Phase 2)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  회의 주제, 목표, 일시, 안건 등을 기입하는 도중 데이터가 손실되는 리스크를 제거했습니다.
                </p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>실시간 초안 자동저장</strong>: 폼에 타이핑하는 도중 입력 데이터가 <code>localStorage</code>에 1초마다 자동 안전 백업됩니다.</li>
                  <li><strong>복원 배너 배정</strong>: 브라우저를 새로고침하거나 실수로 나간 후 재진입 시 상단에 복원 알림 배너가 출력되며, 클릭 시 작성 중이던 모든 세부 폼(안건 목록, 참석자 체크 상태 포함)을 원클릭으로 완벽히 복구합니다.</li>
                  <li><strong>이탈 방지 가드</strong>: 변경 사항이 있는 상태에서 취소 버튼을 누르거나 브라우저 탭을 닫으려 할 시 경고 팝업이 노출되어 실수를 사전에 차단합니다.</li>
                </ul>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">👥 2-2. 참석자 카드 및 전체 토글</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  참석자 지정 시 클릭 반응성을 강화했습니다. 각 참석자 카드를 클릭하여 다중 선택할 수 있으며, 
                  선택 시 <strong>밝은 색상의 border와 체크 아이콘</strong>이 실시간 표시됩니다. 
                  대단위 팀 세팅에서도 신속하게 처리할 수 있도록 우측 상단에 <strong>"전체 선택" 및 "전체 해제"</strong> 버튼이 결합되었습니다.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">🔄 2-3. HTML5 드래그앤드롭 안건 순서 제어</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  React 19 최신 버그나 렌더링 딜레이를 유발하지 않는 순수 HTML5 Native Drag & Drop API 기반 안건 카드 정렬을 제공합니다.
                  안건 카드 좌측의 Grip(점 6개) 손잡이를 잡고 마우스로 가볍게 위아래로 끌어다 놓아 순서를 변경할 수 있습니다. 
                  또한 안건 최소 규칙(최소 1개 보유)에 따라 안건이 하나일 때는 안건 삭제 아이콘이 자동 비활성 처리됩니다.
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Meeting Room */}
          {activeSection === 'meeting_room' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5 border-b border-card-border pb-3">
                <h3 className="text-lg font-bold text-white">3. 회의 진행 & AI 자동 분석</h3>
                <p className="text-xs text-slate-400">회의 진행 중 전사 데이터 생성 및 사전/사후 보고서 조율 과정을 알아봅니다.</p>
              </div>

              {/* Screenshot */}
              <div className="space-y-1.5">
                <div className="glass-panel rounded-2xl border border-card-border overflow-hidden p-1.5 bg-slate-950/50 shadow-2xl">
                  <img 
                    src="/images/manual/meeting_detail.png" 
                    alt="회의 상세 및 AI 분석 화면 스크린샷" 
                    className="w-full rounded-xl border border-card-border/50 max-h-[400px] object-cover object-top"
                  />
                </div>
                <p className="text-[10px] text-center text-slate-500 italic">그림 3: 회의 분석실 상세 인터페이스</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">⚙️ 3-1. 회의 라이프사이클의 유기적 흐름</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  회의실 내부에서는 다음과 같은 흐름으로 AI 요약 결과물이 가공됩니다:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-card-border space-y-2">
                    <span className="font-bold text-indigo-300">① AI 사전 준비 요약 검증</span>
                    <p className="text-slate-400 leading-relaxed">
                      회의 성격과 목표를 사전에 정의하면 AI가 준비사항을 도출합니다. 
                      개설자는 이 요약을 직접 수정한 후 최종 확정해 모든 참여자와 공유합니다.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-card-border space-y-2">
                    <span className="font-bold text-indigo-300">② 회의 중 실시간 메모 & 음성 파일</span>
                    <p className="text-slate-400 leading-relaxed">
                      회의 당일 참여자들의 메모와 녹취 파일 업로드를 결합합니다. 
                      업로드 시 시뮬레이션 STT 처리를 통해 화자 분리 텍스트를 생성합니다.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-card-border space-y-2 md:col-span-2">
                    <span className="font-bold text-indigo-300">③ AI 사후 결과 요약 및 휴먼 터치 매핑</span>
                    <p className="text-slate-400 leading-relaxed">
                      전사 텍스트가 확정되면 AI가 주요 결정 사항과 할 일 목록을 추출합니다. 
                      최종 확정 전에 담당자 및 마감일을 마우스 드롭다운으로 조율할 수 있습니다. 
                      승인 완료 시 자동으로 전체 시스템 업무 데이터베이스에 연동 처리됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Tasks */}
          {activeSection === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5 border-b border-card-border pb-3">
                <h3 className="text-lg font-bold text-white">4. 업무 관리함 & AI 경로 연동</h3>
                <p className="text-xs text-slate-400">자동 및 수동 배정된 일감을 확인하고 최종 피드백을 전달하는 방법을 확인합니다.</p>
              </div>

              {/* Screenshot */}
              <div className="space-y-1.5">
                <div className="glass-panel rounded-2xl border border-card-border overflow-hidden p-1.5 bg-slate-950/50 shadow-2xl">
                  <img 
                    src="/images/manual/tasks.png" 
                    alt="업무 관리함 화면 스크린샷" 
                    className="w-full rounded-xl border border-card-border/50 max-h-[400px] object-cover object-top"
                  />
                </div>
                <p className="text-[10px] text-center text-slate-500 italic">그림 4: 업무 관리함 인터페이스</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">📅 4-1. 마감 기한 시각화 및 가중치 정렬 (Phase 1)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  담당 일감의 지연 여부를 즉각 판별할 수 있습니다:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="font-bold text-rose-400">지연 업무 (Overdue)</span>
                    <p className="text-[11px] text-slate-400 mt-1">완료되지 않은 채 마감 기한이 경과한 업무는 <strong>"지연"</strong> 빨간색 배지가 붙으며 정렬 리스트의 최상위로 강제 조정됩니다.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="font-bold text-amber-400">마감 임박 (D-Day / D-1)</span>
                    <p className="text-[11px] text-slate-400 mt-1">마감 당일이거나 하루 전인 업무는 <strong>"오늘 마감" / "D-1"</strong> 주황색 뱃지가 생성되어 긴급성을 유도합니다.</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">🔗 4-2. 경로 클릭 추적 및 툴팁 팝업 (Phase 2)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  AI 요약 분석을 통해 파생 배정된 업무는 카드의 배지 문구가 **"경로: AI 요약 자동 추출 🔗"**로 출력됩니다.
                  이 뱃지를 클릭하면 **업무를 생성해 낸 최초 출처 회의록** 페이지로 원클릭 라우팅되어 앞뒤 콘텍스트를 즉각 파악할 수 있습니다. 
                  더불어 마우스 오버 시 **회의록 원본의 제목이 툴팁** 형태로 팝업됩니다.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">🔴 4-3. 헤더 알림 뱃지 (Pending Badge)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  본인이 수락해야 하는 "확인 필요" 상태의 태스크가 발생할 경우, 상단 헤더 메뉴바의 **할 일 목록 탭 옆에 빨간 원형 숫자 알림 뱃지**가 실시간 갱신되어, 사용자가 알림을 즉각 인지하고 후속 협업 액션을 취할 수 있도록 지원합니다.
                </p>
              </div>
            </div>
          )}

          {/* Section 5: Admin */}
          {activeSection === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5 border-b border-card-border pb-3">
                <h3 className="text-lg font-bold text-white">5. 사용자 관리 및 보안 설정 (Admin 전용)</h3>
                <p className="text-xs text-slate-400">팀원을 추가하고 상태 권한 및 비밀번호를 관리하는 화면을 설명합니다.</p>
              </div>

              {/* Screenshot */}
              <div className="space-y-1.5">
                <div className="glass-panel rounded-2xl border border-card-border overflow-hidden p-1.5 bg-slate-950/50 shadow-2xl">
                  <img 
                    src="/images/manual/settings.png" 
                    alt="설정 및 관리자 포털 화면 스크린샷" 
                    className="w-full rounded-xl border border-card-border/50 max-h-[400px] object-cover object-top"
                  />
                </div>
                <p className="text-[10px] text-center text-slate-500 italic">그림 5: 설정 및 사용자 권한 관리 인터페이스</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">📝 5-1. 신규 팀원 정보 등록 및 자동완성 차단</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  성명, 팀명, 직급, 시스템 역할 및 초기 로그인 비밀번호를 기입하여 사용자를 승인합니다. 
                  브라우저 내 관리자 비밀번호 오입력 자동 버그를 방지하기 위해 폼 자동완성 방지(Security Autocomplete Off) 가드가 내장되어 있습니다. 
                  비밀번호 필드 우측의 눈 모양 아이콘을 통해 입력한 문자를 손쉽게 시각적으로 확인할 수 있습니다.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">🛠️ 5-2. 수정 모달 및 패스워드 강제 리셋 (Phase 2)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  목록 우측의 <strong>수정</strong> 버튼을 누르면 사용자 상세 정보 수정 모달이 열립니다. 
                  성명, 부서, 직급, 시스템 권한을 수정할 수 있으며, 분실 멤버를 위해 비밀번호 변경 옵션을 제공해 언제든 새 패스워드로 초기화할 수 있습니다.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <h4 className="text-sm font-bold text-indigo-400">🚫 5-3. 계정 비활성화 토글 (Soft-Delete)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  퇴사자나 휴직자 계정을 관리할 수 있도록 비활성화 기능을 지원합니다. 
                  비활성화된 유저는 <strong>목록 테이블에서 삭선(Line-through) 및 흐리게 표시</strong>되며 로그인 권한이 중단됩니다. 
                  과거 회의록과 일감 등의 매핑된 히스토리는 파괴되지 않고 정상 보존되며, 관리자가 다시 <strong>활성화</strong> 버튼을 누르면 언제든지 로그인 권한이 즉시 회복됩니다.
                </p>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
