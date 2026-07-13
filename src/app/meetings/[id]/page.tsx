'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { 
  Calendar, Clock, MapPin, Video, User, Users, 
  Sparkles, CheckCircle, Upload, Plus, Edit2, 
  Trash2, MessageSquare, Play, PlayCircle, AlertTriangle, ArrowRight, Loader2
} from 'lucide-react';

export default function MeetingDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  // Sub-system States
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [confirmingSummary, setConfirmingSummary] = useState(false);

  // Editable summary structures (Pre/Post reviews)
  const [editablePreSummary, setEditablePreSummary] = useState<any>(null);
  const [editablePostSummary, setEditablePostSummary] = useState<any>(null);

  useEffect(() => {
    fetchMeetingDetails();
    // Fetch users for task assignee mapping
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, [id]);

  const fetchMeetingDetails = () => {
    setLoading(true);
    fetch(`/api/meetings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Meeting not found');
        return res.json();
      })
      .then((data) => {
        const m = data.meeting;
        setMeeting(m);

        // Extract Pre-meeting summary if reviewing
        if (m.status === 'pre_review') {
          const preSum = m.summaries.find((s: any) => s.summaryType === 'pre_meeting' && s.status === 'generated');
          if (preSum) {
            setEditablePreSummary(JSON.parse(preSum.resultJson));
          }
        }

        // Extract Post-meeting summary if reviewing
        if (m.status === 'post_review') {
          const postSum = m.summaries.find((s: any) => s.summaryType === 'post_meeting' && s.status === 'generated');
          if (postSum) {
            setEditablePostSummary(JSON.parse(postSum.resultJson));
          }
        }
      })
      .catch((err) => {
        console.error(err);
        router.push('/dashboard');
      })
      .finally(() => setLoading(false));
  };

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`/api/meetings/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote,
          noteType,
          isImportant: noteType === 'decision_candidate'
        })
      });

      if (res.ok) {
        setNewNote('');
        fetchMeetingDetails();
      }
    } catch (error) {
      console.error('Failed to post note:', error);
    }
  };

  const handleAudioUpload = async () => {
    setUploading(true);
    try {
      const res = await fetch(`/api/meetings/${id}/recordings`, {
        method: 'POST'
      });

      if (res.ok) {
        fetchMeetingDetails();
      }
    } catch (error) {
      console.error('Audio upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPreSummary = async () => {
    setConfirmingSummary(true);
    try {
      const preSum = meeting.summaries.find((s: any) => s.summaryType === 'pre_meeting' && s.status === 'generated');
      const res = await fetch(`/api/meetings/${id}/pre-summary/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryId: preSum.id,
          resultJson: editablePreSummary
        })
      });

      if (res.ok) {
        fetchMeetingDetails();
      }
    } catch (error) {
      console.error('Failed to confirm pre-summary:', error);
    } finally {
      setConfirmingSummary(false);
    }
  };

  const handleGeneratePostSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await fetch(`/api/meetings/${id}/post-summary/generate`, {
        method: 'POST'
      });

      if (res.ok) {
        fetchMeetingDetails();
      }
    } catch (error) {
      console.error('Failed to generate post-summary:', error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleConfirmPostSummary = async () => {
    setConfirmingSummary(true);
    try {
      const postSum = meeting.summaries.find((s: any) => s.summaryType === 'post_meeting' && s.status === 'generated');
      const res = await fetch(`/api/meetings/${id}/post-summary/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryId: postSum.id,
          resultJson: editablePostSummary
        })
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to confirm post-summary:', error);
    } finally {
      setConfirmingSummary(false);
    }
  };

  // Inline edit pre-summary purpose
  const updatePreSummaryPurpose = (val: string) => {
    setEditablePreSummary({ ...editablePreSummary, meeting_purpose: val });
  };

  // Inline edit post-summary text
  const updatePostSummaryOverview = (val: string) => {
    setEditablePostSummary({ ...editablePostSummary, meeting_summary: val });
  };

  const updatePostSummaryTask = (idx: number, field: string, val: any) => {
    const updatedItems = [...editablePostSummary.action_items];
    updatedItems[idx] = { ...updatedItems[idx], [field]: val };
    setEditablePostSummary({ ...editablePostSummary, action_items: updatedItems });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">회의 상세 정보를 로딩 중입니다...</p>
      </div>
    );
  }

  // Active summaries
  const confirmedPreSummary = meeting.confirmedPreSummaryId
    ? JSON.parse(meeting.summaries.find((s: any) => s.id === meeting.confirmedPreSummaryId)?.resultJson || '{}')
    : null;

  const confirmedPostSummary = meeting.confirmedPostSummaryId
    ? JSON.parse(meeting.summaries.find((s: any) => s.id === meeting.confirmedPostSummaryId)?.resultJson || '{}')
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Meeting Details, Memos, Audio Transcription */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                진행상태: {meeting.status}
              </span>
              <span className="text-xs text-slate-400">
                개설자: {meeting.creator.name} ({meeting.creator.department})
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white">{meeting.title}</h2>
            <p className="text-slate-400 text-sm">{meeting.objective}</p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-card-border/50">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-400" />
                {new Date(meeting.scheduledAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-400" />
                {new Date(meeting.scheduledAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-1.5">
                {meeting.location ? (
                  <>
                    <MapPin size={14} className="text-indigo-400" />
                    {meeting.location}
                  </>
                ) : (
                  <>
                    <Video size={14} className="text-cyan-400" />
                    온라인 회의
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 1단계: 사전요약 승인 및 확정 흐름 */}
          {meeting.status === 'pre_review' && editablePreSummary && (
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-6">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-indigo-400 animate-pulse" />
                  AI 사전 요약 검증 및 승인
                </h3>
                <button
                  onClick={handleConfirmPreSummary}
                  disabled={confirmingSummary}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {confirmingSummary ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  사전 요약 최종 확정
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-400">회의 목적 요약 (수정 가능)</label>
                  <textarea
                    value={editablePreSummary.meeting_purpose}
                    onChange={(e) => updatePreSummaryPurpose(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-card-border space-y-2">
                    <span className="font-bold text-indigo-300">핵심 안건 및 확인 질문</span>
                    <ul className="space-y-2 pt-1">
                      {editablePreSummary.key_agendas?.map((a: any, i: number) => (
                        <li key={i} className="list-disc list-inside">
                          <span className="font-semibold text-white">{a.title}</span> - {a.summary}
                          {a.questions?.map((q: string, qi: number) => (
                            <div key={qi} className="text-[10px] text-slate-500 pl-4">Q. {q}</div>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-card-border space-y-2">
                    <span className="font-bold text-indigo-300">참석자 사전 준비물</span>
                    <ul className="space-y-2 pt-1">
                      {editablePreSummary.participant_preparation?.map((p: any, i: number) => (
                        <li key={i} className="list-disc list-inside">
                          <span className="font-semibold text-white">{p.participant_name}</span>:
                          <div className="pl-4 text-[10px] text-slate-400">
                            {p.items?.join(', ')}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2단계: 회의 기록 (메모 및 녹음 업로드) */}
          {(meeting.status === 'pre_confirmed' || meeting.status === 'meeting_completed' || meeting.status === 'post_review' || meeting.status === 'post_confirmed') && (
            <div className="space-y-6">
              
              {/* Confirmed Pre-Summary view for participants */}
              {confirmedPreSummary && (
                <div className="p-5 rounded-2xl bg-indigo-950/15 border border-indigo-500/10 space-y-3">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} />
                    확정된 사전 요약 보고
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {confirmedPreSummary.meeting_purpose}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400 pt-2">
                    <div>
                      <span className="font-bold text-slate-300 block mb-1">핵심 안건</span>
                      {confirmedPreSummary.key_agendas?.map((a: any, i: number) => (
                        <div key={i} className="line-clamp-1">
                          #{i+1}. {a.title}
                        </div>
                      ))}
                    </div>
                    <div>
                      <span className="font-bold text-slate-300 block mb-1">참석자 준비사항</span>
                      {confirmedPreSummary.participant_preparation?.map((p: any, i: number) => (
                        <div key={i} className="line-clamp-1">
                          {p.participant_name}: {p.items?.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 회의록 메모 피드 & 음성 전사 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 실시간 회의 메모 */}
                <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-indigo-400" />
                    공동 회의 메모 ({meeting.notes?.length || 0})
                  </h3>

                  {meeting.status === 'pre_confirmed' && (
                    <form onSubmit={handlePostNote} className="space-y-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="회의 중 중요한 의견, 결정 후보, 할 일을 적으세요..."
                        rows={2}
                        className="w-full p-2.5 rounded-lg glass-input text-xs text-white"
                      />
                      <div className="flex justify-between items-center">
                        <select
                          value={noteType}
                          onChange={(e) => setNoteType(e.target.value)}
                          className="px-2 py-1 rounded bg-white/5 border border-card-border text-[10px] text-slate-300"
                        >
                          <option value="general">일반 메모</option>
                          <option value="decision_candidate">결정 사항 후보</option>
                          <option value="task_candidate">할 일 후보</option>
                        </select>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          메모 추가
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {meeting.notes?.length > 0 ? (
                      meeting.notes.map((note: any) => (
                        <div key={note.id} className="p-2.5 rounded-lg bg-white/5 border border-card-border text-xs">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span className="font-bold text-indigo-300">{note.author.name}</span>
                            <span>{new Date(note.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-300">{note.content}</p>
                          {note.noteType !== 'general' && (
                            <span className={`inline-block mt-1 text-[9px] px-1 rounded ${
                              note.noteType === 'decision_candidate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                            }`}>
                              {note.noteType === 'decision_candidate' ? '결정 후보' : '할 일 후보'}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-600 text-xs py-8">
                        기록된 회의 메모가 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 음성 녹음 및 전사 결과 (STT) */}
                <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <PlayCircle size={16} className="text-indigo-400" />
                    회의 녹취 및 전사
                  </h3>

                  {meeting.recordings?.length > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                        <span>🎙️ 전사 분석 완료 ({meeting.recordings[0].filename})</span>
                        <span className="font-semibold">{meeting.recordings[0].durationSeconds}초</span>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {meeting.recordings[0].segments?.map((seg: any) => (
                          <div key={seg.id} className="text-xs space-y-0.5 p-1 hover:bg-white/5 rounded transition-all">
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="font-bold text-slate-200">{seg.speakerLabel}</span>
                              <span className="text-slate-500">[{Math.floor(seg.startSeconds)}초]</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">{seg.content}</p>
                          </div>
                        ))}
                      </div>

                      {meeting.status === 'meeting_completed' && (
                        <button
                          onClick={handleGeneratePostSummary}
                          disabled={generatingSummary}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {generatingSummary ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              AI 사후 회의록 분석 중...
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              AI 사후 요약 생성
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-card-border text-center space-y-4">
                      <Upload className="w-8 h-8 text-slate-600 mx-auto" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-300 block">음성 녹음 업로드</span>
                        <span className="text-[10px] text-slate-500 block">mp3, wav, m4a 등 최대 500MB</span>
                      </div>
                      <button
                        onClick={handleAudioUpload}
                        disabled={uploading}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-card-border text-xs text-white rounded-lg transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-3 animate-spin" />
                            업로드 및 전사 중...
                          </>
                        ) : (
                          <>
                            <Upload size={12} />
                            파일 선택 시뮬레이션
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* 3단계: AI 사후요약 승인 및 확정 흐름 */}
          {meeting.status === 'post_review' && editablePostSummary && (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 space-y-6">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-amber-400 animate-pulse" />
                  AI 사후 회의 결과 검증
                </h3>
                <button
                  onClick={handleConfirmPostSummary}
                  disabled={confirmingSummary}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {confirmingSummary ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  최종 결과 승인 및 업무 배정
                </button>
              </div>

              <div className="space-y-5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-400">회의 결과 전체 요약 (수정 가능)</label>
                  <textarea
                    value={editablePostSummary.meeting_summary}
                    onChange={(e) => updatePostSummaryOverview(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>

                {/* Decisions Review */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-300 block">💡 결정 사항 목록</span>
                  <div className="space-y-2">
                    {editablePostSummary.agenda_results?.map((res: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-card-border space-y-1">
                        <span className="font-semibold text-indigo-300 text-[10px]">결정 사항</span>
                        <p className="text-slate-300">{res.decision || '결정 사항 없음 (논의 보류)'}</p>
                        <span className="text-[9px] text-slate-500 block">근거: {res.evidence}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks Assignee Mapping Review */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-300 block">📋 배정될 후속 할 일(Task) 검토</span>
                  <div className="space-y-2">
                    {editablePostSummary.action_items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-card-border grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                        <div className="md:col-span-2 space-y-1">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updatePostSummaryTask(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-card-border text-xs text-white"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updatePostSummaryTask(idx, 'description', e.target.value)}
                            className="w-full px-2.5 py-1 rounded bg-slate-900/60 border border-transparent text-[10px] text-slate-400"
                          />
                        </div>
                        
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">담당자 배정</label>
                          <select
                            value={item.assignee_name}
                            onChange={(e) => updatePostSummaryTask(idx, 'assignee_name', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-card-border text-xs text-white"
                          >
                            <option value="">미지정</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.name}>
                                {u.name} ({u.department})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">마감 기한</label>
                          <input
                            type="date"
                            value={item.due_date}
                            onChange={(e) => updatePostSummaryTask(idx, 'due_date', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-card-border text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4단계: 요약 완료 상태의 최종 요약 화면 */}
          {meeting.status === 'post_confirmed' && confirmedPostSummary && (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 space-y-6">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="text-emerald-400" />
                  회의 결과 보고서 (최종 승인됨)
                </h3>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-white/5 border border-card-border space-y-2">
                  <span className="font-bold text-slate-400">회의 결과 전체 요약</span>
                  <p>{confirmedPostSummary.meeting_summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-card-border space-y-2">
                    <span className="font-bold text-emerald-400">💡 최종 결정 사항</span>
                    <ul className="space-y-2 pt-1 list-disc list-inside">
                      {meeting.decisions?.map((dec: any) => (
                        <li key={dec.id} className="text-slate-300">
                          {dec.content}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-card-border space-y-2">
                    <span className="font-bold text-indigo-400">📋 생성된 후속 업무</span>
                    <ul className="space-y-2 pt-1">
                      {meeting.tasks?.map((task: any) => (
                        <li key={task.id} className="flex justify-between items-center p-2 rounded bg-white/5 text-[11px]">
                          <span>{task.title}</span>
                          <span className="font-semibold text-slate-400">{task.assignee?.name || '미지정'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side Columns: Participants list & Agenda check lists */}
        <div className="space-y-6">
          
          {/* Participants */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Users size={16} className="text-indigo-400" />
              참석 대상자 ({meeting.participants?.length || 0})
            </h3>
            
            <div className="space-y-2">
              {meeting.participants?.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-card-border flex items-center justify-center font-bold text-indigo-300">
                      {p.user.name[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{p.user.name}</span>
                      <span className="text-[10px] text-slate-500">{p.user.department}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    p.attendanceStatus === 'attending' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {p.attendanceStatus === 'attending' ? '참석' : '초대됨'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Checklist */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-4 rounded bg-indigo-500"></span>
              회의 안건 목록
            </h3>

            <div className="space-y-3">
              {meeting.agendas?.map((agenda: any, idx: number) => (
                <div key={agenda.id} className="p-3 rounded-xl bg-white/5 border border-card-border space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-indigo-400">안건 #{idx + 1}</span>
                    {agenda.decisionRequired && (
                      <span className="px-1.5 rounded bg-amber-500/15 text-amber-400 font-semibold">의사결정 필요</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-relaxed">{agenda.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{agenda.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
