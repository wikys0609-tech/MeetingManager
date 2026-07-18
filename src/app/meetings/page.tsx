'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { Calendar, Plus, ChevronRight, Clock, MapPin, Video, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meetings')
      .then((res) => res.json())
      .then((data) => {
        setMeetings(data.meetings || []);
      })
      .catch((err) => console.error('Error fetching meetings:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatMeetingDate = (scheduledAtStr: string) => {
    const date = new Date(scheduledAtStr);
    const currentYear = new Date().getFullYear();
    const meetingYear = date.getFullYear();
    
    if (meetingYear !== currentYear) {
      return `${meetingYear}. ${date.getMonth() + 1}. ${date.getDate()}.`;
    }
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/10 text-xs">임시 저장</span>;
      case 'pre_review':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 text-xs font-semibold animate-pulse">사전요약 검토</span>;
      case 'pre_confirmed':
        return <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/10 text-xs">회의 대기</span>;
      case 'meeting_completed':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/10 text-xs">회의 완료 (요약필요)</span>;
      case 'post_review':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/10 text-xs font-semibold animate-pulse">사후요약 검토</span>;
      case 'post_confirmed':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/10 text-xs">요약 확정</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-500 border border-slate-500/10 text-xs">종료됨</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/10 text-xs">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="text-indigo-400" />
              회의 관리
            </h2>
            <p className="text-slate-400 text-sm">
              진행 중이거나 예정된 회의를 모니터링하고 사전/사후 요약 보고서를 관리합니다.
            </p>
          </div>

          <Link
            href="/meetings/new"
            className="self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            새 회의 생성
          </Link>
        </div>

        {/* Meetings List */}
        {loading ? (
          <div className="glass-panel p-20 rounded-3xl border border-card-border text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
            <span className="text-sm text-slate-400">회의 정보를 조회하고 있습니다...</span>
          </div>
        ) : meetings.length > 0 ? (
          <div className="glass-panel rounded-3xl border border-card-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-card-border bg-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">일시</th>
                    <th className="px-6 py-4">회의 주제</th>
                    <th className="px-6 py-4">진행 상태</th>
                    <th className="px-6 py-4">장소/온라인</th>
                    <th className="px-6 py-4">참석자</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-sm text-slate-300">
                  {meetings.map((meeting) => (
                    <tr
                      key={meeting.id}
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                      className="hover:bg-white/5 transition-all group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="font-semibold text-slate-200">
                          {formatMeetingDate(meeting.scheduledAt)}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {new Date(meeting.scheduledAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {meeting.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {meeting.objective || '목적 미지정'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(meeting.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {meeting.location ? (
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin size={12} className="text-indigo-400" />
                            {meeting.location}
                          </div>
                        ) : meeting.onlineUrl ? (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Video size={12} className="text-cyan-400" />
                            온라인 링크
                          </div>
                        ) : (
                          <span className="text-slate-600">미지정</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {meeting.participants.slice(0, 3).map((p: any) => (
                            <span
                              key={p.id}
                              className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-300 font-bold"
                              title={`${p.user.name} (${p.user.department})`}
                            >
                              {p.user.name[0]}
                            </span>
                          ))}
                          {meeting.participants.length > 3 && (
                            <span className="text-xs text-slate-500 font-semibold pl-1">
                              +{meeting.participants.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                          보기
                          <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-20 rounded-3xl border border-card-border text-center flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">개설된 회의가 없습니다.</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              첫 번째 회의를 등록하고 AI 사전 요약 성능을 점검해보세요.
            </p>
            <Link
              href="/meetings/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} />
              새 회의 등록
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
