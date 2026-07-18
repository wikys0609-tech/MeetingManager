'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { Calendar, Plus, Trash2, ArrowLeft, ArrowRight, Loader2, Sparkles, AlertCircle, Check, GripVertical, Trash } from 'lucide-react';

export default function NewMeetingPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Draft Restore Banner
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

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

    // Check draft
    const savedDraft = localStorage.getItem('meeting_draft');
    if (savedDraft) {
      setShowRestoreBanner(true);
    }
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

  // Prevent Page Leaving Warnings
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isFormDirty = title || objective || scheduledAt || location || onlineUrl || selectedParticipants.length > 0 || agendas.some(a => a.title || a.description);
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, objective, scheduledAt, location, onlineUrl, selectedParticipants, agendas]);

  // LocalStorage AutoSave
  useEffect(() => {
    const isFormDirty = title || objective || scheduledAt || location || onlineUrl || selectedParticipants.length > 0 || agendas.some(a => a.title || a.description);
    if (!isFormDirty) return;

    const timer = setTimeout(() => {
      localStorage.setItem('meeting_draft', JSON.stringify({
        title,
        objective,
        scheduledAt,
        location,
        onlineUrl,
        selectedParticipants,
        agendas,
        parentMeetingId,
        selectedCarriedOverItems
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, objective, scheduledAt, location, onlineUrl, selectedParticipants, agendas, parentMeetingId, selectedCarriedOverItems]);

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem('meeting_draft');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      if (confirm('작성 중이던 임시 저장본으로 화면을 복원하시겠습니까? (기존에 작성 중이던 글은 덮어씌워집니다.)')) {
        setTitle(parsed.title || '');
        setObjective(parsed.objective || '');
        setScheduledAt(parsed.scheduledAt || '');
        setLocation(parsed.location || '');
        setOnlineUrl(parsed.onlineUrl || '');
        setSelectedParticipants(parsed.selectedParticipants || []);
        setAgendas(parsed.agendas || [{ title: '', description: '', decisionRequired: false }]);
        setParentMeetingId(parsed.parentMeetingId || '');
        setSelectedCarriedOverItems(parsed.selectedCarriedOverItems || []);
        setShowRestoreBanner(false);
      }
    }
  };

  const handleDeleteDraft = () => {
    if (confirm('임시 저장된 초안을 삭제하시겠습니까?')) {
      localStorage.removeItem('meeting_draft');
      setShowRestoreBanner(false);
    }
  };

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

  // Agenda Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const newAgendas = [...agendas];
    const draggedItem = newAgendas[draggedIdx];
    newAgendas.splice(draggedIdx, 1);
    newAgendas.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setAgendas(newAgendas);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleToggleParticipant = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const handleSelectAllParticipants = () => {
    setSelectedParticipants(users.map((u) => u.id));
  };

  const handleDeselectAllParticipants = () => {
    setSelectedParticipants([]);
  };

  const handleCancel = () => {
    const isFormDirty = title || objective || scheduledAt || location || onlineUrl || selectedParticipants.length > 0 || agendas.some(a => a.title || a.description);
    if (isFormDirty) {
      if (!confirm('작성 중인 내용이 있습니다. 정말 취소하고 돌아가시겠습니까?')) {
        return;
      }
    }
    router.back();
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

      // Clean draft
      localStorage.removeItem('meeting_draft');

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
        {/* Restore draft banner */}
        {showRestoreBanner && (
          <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 text-xs text-indigo-300 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-indigo-400" />
              <span>이전에 작성 중이던 회의록 초안이 존재합니다. 내용을 복원하시겠습니까?</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1.5 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer"
              >
                불러오기
              </button>
              <button
                type="button"
                onClick={handleDeleteDraft}
                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer border border-card-border"
              >
                삭제
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
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
            <div className="flex items-center justify-between border-b border-card-border/50 pb-2">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
                3. 참석자 선택
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllParticipants}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-card-border text-[10px] text-slate-300 transition-all cursor-pointer"
                >
                  전체 선택
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllParticipants}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-card-border text-[10px] text-slate-300 transition-all cursor-pointer"
                >
                  전체 해제
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {users.map((user) => {
                const isSelected = selectedParticipants.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleToggleParticipant(user.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between relative cursor-pointer group hover:bg-white/10 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-white/5 border-card-border text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-slate-200">{user.name}</span>
                      {isSelected && <Check size={12} className="text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">{user.department}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: 회의 안건 */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
              4. 회의 안건 설정
            </h3>

            <div className="space-y-4">
              {agendas.map((agenda, idx) => (
                <div
                  key={idx}
                  draggable={agendas.length > 1}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-xl border bg-white/3 border-card-border flex gap-3 items-start transition-all ${
                    draggedIdx === idx ? 'opacity-40 border-indigo-500 border-dashed bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Grip drag handle */}
                  {agendas.length > 1 && (
                    <div className="mt-2.5 text-slate-500 cursor-grab active:cursor-grabbing hover:text-white transition-colors">
                      <GripVertical size={16} />
                    </div>
                  )}

                  <div className="flex-1 space-y-3">
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
                </div>
              ))}

              {/* Add agenda wide button */}
              <button
                type="button"
                onClick={handleAddAgenda}
                className="w-full py-4 border-2 border-dashed border-card-border hover:border-indigo-500/40 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-indigo-400 transition-all bg-white/2 hover:bg-indigo-600/5 cursor-pointer font-semibold"
              >
                <Plus size={14} />
                안건 추가하기
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
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
