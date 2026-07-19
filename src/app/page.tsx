'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autofillUser = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('password123');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {/* Background Decorative Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 animate-bounce">
            <Sparkles className="text-indigo-400 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Internal AI <span className="text-gradient font-black">Meeting Hub</span>
          </h1>
          <p className="text-slate-400 text-sm">
            소규모 조직을 위한 AI 기반 회의 요약 및 경량 협업 관리 플랫폼
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-card-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 tracking-wide uppercase">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@meetinghub.local"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 tracking-wide uppercase">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '시스템 시작하기'
              )}
            </button>
          </form>

          {/* Quick Seeding Accounts helper */}
          <div className="mt-8 pt-6 border-t border-card-border">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 text-center">
              💡 테스트 계정 빠른 선택
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => autofillUser('requester@meetinghub.local')}
                className="p-2 text-left rounded-lg bg-white/5 border border-card-border hover:border-indigo-500/30 text-slate-300 transition-all cursor-pointer"
              >
                <div className="font-semibold text-indigo-300">김기획 (개설자)</div>
                <div className="text-[10px] text-slate-500">requester@meetinghub.local</div>
              </button>
              <button
                type="button"
                onClick={() => autofillUser('user1@meetinghub.local')}
                className="p-2 text-left rounded-lg bg-white/5 border border-card-border hover:border-indigo-500/30 text-slate-300 transition-all cursor-pointer"
              >
                <div className="font-semibold text-indigo-300">이개발 (개발자)</div>
                <div className="text-[10px] text-slate-500">user1@meetinghub.local</div>
              </button>
              <button
                type="button"
                onClick={() => autofillUser('user2@meetinghub.local')}
                className="p-2 text-left rounded-lg bg-white/5 border border-card-border hover:border-indigo-500/30 text-slate-300 transition-all cursor-pointer"
              >
                <div className="font-semibold text-indigo-300">박디자인 (디자이너)</div>
                <div className="text-[10px] text-slate-500">user2@meetinghub.local</div>
              </button>
              <button
                type="button"
                onClick={() => autofillUser('admin@meetinghub.local')}
                className="p-2 text-left rounded-lg bg-white/5 border border-card-border hover:border-indigo-500/30 text-slate-300 transition-all cursor-pointer"
              >
                <div className="font-semibold text-indigo-300">관리자</div>
                <div className="text-[10px] text-slate-500">admin@meetinghub.local</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
