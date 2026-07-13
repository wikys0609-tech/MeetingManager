'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarRange, CheckSquare, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fetch session details
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        setSession(data.session);
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} />
                {item.name}
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
            <span className="font-semibold text-slate-200">{session.name}</span>
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
