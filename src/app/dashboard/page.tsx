'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import { Calendar, AlertCircle, CheckCircle, ArrowRight, UserPlus, FileText, PlayCircle } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { getTaskPriorityDetail } from '@/lib/taskStatus';

const getDDayInfo = (dueDateStr: string | null, isCompleted: boolean) => {
  if (!dueDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (!isCompleted && diffDays < 0) {
    return {
      label: '지연',
      colorClass: 'text-rose-400 bg-rose-500/10 border border-rose-500/20 font-bold px-1.5 py-0.5 rounded text-[9px]',
      isOverdue: true,
      isUrgent: false
    };
  }
  if (!isCompleted && diffDays === 0) {
    return {
      label: '오늘 마감',
      colorClass: 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-bold px-1.5 py-0.5 rounded text-[9px]',
      isOverdue: false,
      isUrgent: true
    };
  }
  if (!isCompleted && diffDays === 1) {
    return {
      label: 'D-1',
      colorClass: 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-bold px-1.5 py-0.5 rounded text-[9px]',
      isOverdue: false,
      isUrgent: true
    };
  }
  return {
    label: `D-${diffDays}`,
    colorClass: 'text-slate-500',
    isOverdue: false,
    isUrgent: false
  };
};

const getTaskSortWeight = (t: any) => {
  if (t.status === 'completed') return 9999;
  
  if (t.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return -2000 + diffDays;
    }
    if (diffDays === 0 || diffDays === 1) {
      return -1000 + diffDays;
    }
    return diffDays;
  }
  return 5000;
};

export default function Dashboard() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parallel fetch session, meetings, tasks
    const initDashboard = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        const userJson = await userRes.json();
        setCurrentUser(userJson.session);

        const meetingsRes = await fetch('/api/meetings');
        const meetingsJson = await meetingsRes.json();
        setMeetings(meetingsJson.meetings || []);

        // Fetch my tasks (assigneeId should match current user ID)
        if (userJson.session) {
          const tasksRes = await fetch(`/api/tasks?assigneeId=${userJson.session.id}`);
          const tasksJson = await tasksRes.json();
          setTasks(tasksJson.tasks || []);
        }
      } catch (err) {
        console.error('Failed to initialize dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">대시보드를 로딩하는 중입니다...</p>
      </div>
    );
  }

  // Filter meetings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayMeetings = meetings.filter((m) => {
    const meetingDate = new Date(m.scheduledAt);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate.getTime() === today.getTime();
  });

  const reviewMeetings = meetings.filter((m) => 
    m.status === 'pre_review' || m.status === 'post_review' || m.status === 'meeting_completed'
  );

  const recentMeetings = meetings.filter((m) => m.status === 'post_confirmed' || m.status === 'closed');
  const todoTasks = tasks
    .filter((t) => t.status === 'todo' || t.status === 'in_progress')
    .sort((a, b) => getTaskSortWeight(a) - getTaskSortWeight(b));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome and Left Main Panels */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Banner */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-indigo-500/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative space-y-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                환영합니다
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                안녕하세요, <span className="text-indigo-400">{currentUser?.name || '사용자'}</span> 님!
              </h2>
              <p className="text-slate-400 text-sm max-w-md">
                오늘 예정된 회의를 확인하고, 요약된 회의록의 AI 피드백을 확인하여 프로젝트 실행 속도를 가속화하세요.
              </p>
              <div className="pt-2 flex gap-4">
                <Link
                  href="/meetings/new"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={16} />
                  새 회의 등록
                </Link>
                <Link
                  href="/tasks"
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all border border-card-border flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={16} className="text-indigo-400" />
                  내 할 일 관리
                </Link>
              </div>
            </div>
          </div>

          {/* 오늘의 회의 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-4 rounded bg-indigo-500"></span>
              오늘 예정된 회의 ({todayMeetings.length})
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {todayMeetings.length > 0 ? (
                todayMeetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="glass-panel p-5 rounded-2xl border border-card-border glass-panel-hover flex justify-between items-center group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                          {new Date(meeting.scheduledAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-slate-400">{meeting.location || '온라인'}</span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {meeting.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                      <span className="text-xs">상세 보기</span>
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  title="오늘 예정된 회의가 없습니다"
                  description="새로운 기획 회의나 스프린트 미팅을 등록해 보세요."
                  icon={Calendar}
                  ctaText="+ 새 회의 등록"
                  ctaLink="/meetings/new"
                />
              )}
            </div>
          </div>

          {/* 최근 완료된 회의 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-4 rounded bg-indigo-500"></span>
              최근 완료된 회의록
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {recentMeetings.length > 0 ? (
                recentMeetings.slice(0, 3).map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="glass-panel p-5 rounded-2xl border border-card-border glass-panel-hover flex justify-between items-center group"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">
                        {new Date(meeting.scheduledAt).toLocaleDateString('ko-KR')}
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {meeting.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/15 border border-emerald-500/10 text-emerald-300 text-xs font-semibold">
                      <CheckCircle size={12} />
                      요약 확정됨
                    </div>
                  </Link>
                ))
              ) : (
                <div className="glass-panel p-8 rounded-2xl border border-card-border text-center text-slate-500 text-sm">
                  완료된 회의록이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns (Pending Reviews & Tasks) */}
        <div className="space-y-8">
          {/* 검토 대기 회의 (AI Summaries) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-4 rounded bg-amber-500"></span>
              검토 대기중인 회의 ({reviewMeetings.length})
            </h3>

            <div className="space-y-3">
              {reviewMeetings.length > 0 ? (
                reviewMeetings.map((meeting) => {
                  const isPre = meeting.status === 'pre_review';
                  const isCompleted = meeting.status === 'meeting_completed';
                  const isPost = meeting.status === 'post_review';
                  return (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="glass-panel p-4 rounded-2xl border border-card-border glass-panel-hover flex items-start gap-3 group"
                    >
                      <div className={`mt-0.5 p-2 rounded-lg ${
                        isPre ? 'bg-indigo-500/15 text-indigo-300' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {isPre ? <Calendar size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {meeting.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            isPre 
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                              : isCompleted 
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            {isPre ? '사전 준비 검토' : isCompleted ? '사후 요약 필요' : '사후 결과 검토'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(meeting.scheduledAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <EmptyState
                  title="검토 대기중인 회의가 없습니다"
                  description="AI 요약본 검토가 완료되었거나 새로 개설된 회의가 없습니다."
                  icon={FileText}
                  ctaText="회의 목록 보기"
                  ctaLink="/meetings"
                />
              )}
            </div>
          </div>

          {/* 내 할 일 목록 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-4 rounded bg-emerald-500"></span>
              내 할 일 ({todoTasks.length})
            </h3>

            <div className="space-y-3">
              {todoTasks.length > 0 ? (
                todoTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="glass-panel p-4 rounded-2xl border border-card-border flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const prio = getTaskPriorityDetail(task.priority);
                          return (
                            <span className={`px-1 py-0.2 rounded text-[8px] font-bold border ${prio.bgClass}`}>
                              {prio.label}
                            </span>
                          );
                        })()}
                        <h4 className="text-xs font-semibold text-slate-300 line-clamp-1">
                          {task.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        {task.dueDate ? (() => {
                          const dday = getDDayInfo(task.dueDate, task.status === 'completed');
                          return (
                            <>
                              <span className={dday?.isOverdue ? 'text-rose-400 font-semibold' : dday?.isUrgent ? 'text-amber-400 font-semibold' : ''}>
                                마감일: {new Date(task.dueDate).toLocaleDateString('ko-KR')}
                              </span>
                              {dday && (dday.isOverdue || dday.isUrgent) && (
                                <span className={dday.colorClass}>{dday.label}</span>
                              )}
                            </>
                          );
                        })() : (
                          <span>마감일: 미지정</span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/tasks"
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 self-center"
                    >
                      관리
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="진행 중인 할 일이 없습니다"
                  description="나에게 할당된 진행 중인 작업이 모두 완료되었습니다."
                  icon={CheckCircle}
                  ctaText="할 일 목록 보기"
                  ctaLink="/tasks"
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
