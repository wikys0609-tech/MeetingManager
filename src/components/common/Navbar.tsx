'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarRange, CheckSquare, LogOut, User, Settings } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [confirmNeededCount, setConfirmNeededCount] = useState<number>(0);

  useEffect(() => {
    // Fetch session details
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        setSession(data.session);
        if (data.session) {
          fetch('/api/tasks')
            .then((res) => res.json())
            .then((taskData) => {
              const pendingCount = (taskData.tasks || []).filter(
                (t: any) => t.confirmationStatus === 'pending' && t.assigneeId === data.session.id
              ).length;
              setConfirmNeededCount(pendingCount);
            })
            .catch((err) => console.error('Error fetching task count:', err));
        }
      })
      .catch(() => {
        // If not logged in, middleware handles redirect, but we can also route here
        router.push('/');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '회의 관리', href: '/meetings', icon: CalendarRange },
    { name: '할 일 목록', href: '/tasks', icon: CheckSquare },
    { name: '설정', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-card-border bg-slate-950/40 backdrop-blur-md">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Internal AI <span className="text-indigo-400 font-extrabold">Meeting Hub</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
                {item.name === '할 일 목록' && confirmNeededCount > 0 && (
                  <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white leading-none border border-slate-950">
                    {confirmNeededCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {session && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-card-border text-xs text-slate-300">
            <User size={12} className="text-indigo-400" />
            <span className="font-semibold text-slate-200">{session.name} {session.position}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{session.department}</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[10px] text-indigo-300 font-bold border border-indigo-500/10">
              {session.role === 'admin' ? '관리자' : session.role === 'requester' ? '회의개설자' : '팀원'}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </nav>
  );
}
