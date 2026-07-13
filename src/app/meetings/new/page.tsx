'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { Calendar, Plus, Trash2, ArrowLeft, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function NewMeetingPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [agendas, setAgendas] = useState<any[]>([{ title: '', description: '', decisionRequired: false }]);
  const [parentMeetingId, setParentMeetingId] = useState('');
  const [parentTasks, setParentTasks] = useState<any[]>([]);
  const [selectedCarriedOverItems, setSelectedCarriedOverItems] = useState<string[]>([]);

  useEffect(() => {
    // Fetch users
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error('Fetch users error:', err));

    // Fetch previous completed meetings
    fetch('/api/meetings')
      .then((res) => res.json())
      .then((data) => {
        const completed = (data.meetings || []).filter((m: any) => m.status === 'post_confirmed');
        setMeetings(completed);
      })
      .catch((err) => console.error('Fetch meetings error:', err));
  }, []);

  // Fetch parent meeting tasks when parentMeetingId changes
  useEffect(() => {
    if (!parentMeetingId) {
      setParentTasks([]);
      return;
    }
    setLoading(true);
    fetch(`/api/meetings/${parentMeetingId}`)
      .then((res) => res.json())
      .then((data) => {
        const meeting = data.meeting;
        if (meeting) {
          // Filter unfinished tasks
          const unfinished = (meeting.tasks || []).filter((t: any) => t.status !== 'completed');
          setParentTasks(unfinished);
        }
      })
      .catch((err) => console.error('Fetch parent tasks error:', err))
      .finally(() => setLoading(false));
  }, [parentMeetingId]);

  const handleAddAgenda = () => {
    setAgendas([...agendas, { title: '', description: '', decisionRequired: false }]);
  };

  const handleRemoveAgenda = (idx: number) => {
    if (agendas.length === 1) return;
    setAgendas(agendas.filter((_, i) => i !== idx));
  };

  const handleAgendaChange = (idx: number, field: string, value: any) => {
    const updated = agendas.map((agenda, i) => {
      if (i === idx) {
        return { ...agenda, [field]: value };
      }
      return agenda;
    });
    setAgendas(updated);
  };

  const handleToggleParticipant = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt) return;

    setLoading(true);

    try {
      // Map agendas incorporating carrying over items
      const finalAgendas = [...agendas];

      // Add parent tasks as carry over agendas if selected
      const selectedTasks = parentTasks.filter((t) => selectedCarriedOverItems.includes(t.id));
      if (selectedTasks.length > 0) {
        selectedTasks.forEach((t) => {
          finalAgendas.unshift({
            title: `[이월] ${t.title}`,
            description: `이전 회의 미완료 업무 이월 검토: ${t.description || ''}`,
            decisionRequired: false,
            sourceType: 'carry_over',
            sourceMeetingId: parentMeetingId
          });
        });
      }

      // 1. Create meeting
      const createRes = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          objective,
          scheduledAt,
          location,
          onlineUrl,
          parentMeetingId: parentMeetingId || null,
          agendas: finalAgendas,
          participants: selectedParticipants.map((id) => ({ userId: id, role: '참석자' }))
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || '회의 등록에 실패했습니다.');

      const newMeetingId = createData.meetingId;

      // 2. Automatically trigger AI pre-summary generation
      const summaryRes = await fetch(`/api/meetings/${newMeetingId}/pre-summary/generate`, {
        method: 'POST'
      });

      if (!summaryRes.ok) {
        console.warn('AI Pre-summary generation failed, continuing to meeting detail.');
      }

      router.push(`/meetings/${newMeetingId}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white/5 border border-card-border hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight text-white">새 회의 생성</h2>
            <p className="text-slate-400 text-xs">
              회의 정보와 안건을 입력하고, 필요한 경우 이전 회의의 미완료 업무를 이월합니다.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: 기본 정보 */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
              1. 기본 회의 정보
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">회의 주제 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 2분기 UI/UX 디자인 최종 검토 회의"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">회의 목표/목적</label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="예: 메인 테마 색상을 확정하고 개발팀 연동 일정을 배정한다."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">회의 일시 *</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">회의 장소 (혹은 온라인 링크)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 회의실 A 또는 Google Meet 링크"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 이전 회의 항목 이월 */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
              2. 이전 회의 항목 이월 (선택)
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">연결할 이전 회의 선택</label>
                <select
                  value={parentMeetingId}
                  onChange={(e) => setParentMeetingId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                >
                  <option value="">이전 회의 없음</option>
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({new Date(m.scheduledAt).toLocaleDateString('ko-KR')})
                    </option>
                  ))}
                </select>
              </div>

              {parentTasks.length > 0 && (
                <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-card-border">
                  <span className="text-xs font-bold text-slate-300">
                    💡 이월할 미완료 업무 선택
                  </span>
                  <div className="space-y-2 pt-2">
                    {parentTasks.map((t) => {
                      const isSelected = selectedCarriedOverItems.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className="flex items-start gap-2.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedCarriedOverItems(selectedCarriedOverItems.filter((id) => id !== t.id));
                              } else {
                                setSelectedCarriedOverItems([...selectedCarriedOverItems, t.id]);
                              }
                            }}
                            className="mt-0.5"
                          />
                          <div>
                            <span className="font-semibold text-white">{t.title}</span>
                            <span className="text-[10px] text-slate-500 pl-1">
                              (마감: {t.dueDate ? new Date(t.dueDate).toLocaleDateString('ko-KR') : '미지정'})
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: 참석자 구성 */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
              3. 참석자 선택
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {users.map((user) => {
                const isSelected = selectedParticipants.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleToggleParticipant(user.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-white/5 border-card-border text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span className="font-bold text-slate-200">{user.name}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{user.department}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: 회의 안건 */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
                4. 회의 안건 설정
              </h3>
              <button
                type="button"
                onClick={handleAddAgenda}
                className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                안건 추가
              </button>
            </div>

            <div className="space-y-4 divide-y divide-card-border/50">
              {agendas.map((agenda, idx) => (
                <div key={idx} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">안건 #{idx + 1}</span>
                    {agendas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAgenda(idx)}
                        className="p-1 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <input
                        type="text"
                        value={agenda.title}
                        onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)}
                        placeholder="안건 제목을 입력하세요."
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agenda.decisionRequired}
                          onChange={(e) => handleAgendaChange(idx, 'decisionRequired', e.target.checked)}
                        />
                        의사결정 필요 안건
                      </label>
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={agenda.description}
                        onChange={(e) => handleAgendaChange(idx, 'description', e.target.value)}
                        placeholder="안건 상세 설명 (논의할 배경 및 이슈)"
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-card-border text-white font-semibold text-sm transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  회의 생성 및 AI 분석 중...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  회의 개설 및 AI 사전요약 생성
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
