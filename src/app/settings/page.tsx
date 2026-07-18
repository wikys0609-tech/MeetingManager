'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { 
  User, Shield, Users, UserPlus, Mail, Lock, 
  Briefcase, Plus, Loader2, CheckCircle, AlertCircle, 
  Eye, EyeOff, X, Edit2
} from 'lucide-react';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('general');

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editRole, setEditRole] = useState('general');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Status message
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSessionAndUsers();
  }, []);

  const fetchSessionAndUsers = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      const userJson = await userRes.json();
      setCurrentUser(userJson.session);

      if (userJson.session?.role === 'admin') {
        const usersRes = await fetch('/api/users');
        const usersJson = await usersRes.json();
        setUsers(usersJson.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!email || !password || !name || !department || !position) {
      setErrorMsg('모든 필수 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, department, position, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '사용자 등록에 실패했습니다.');
      }

      setSuccessMsg(`사용자 '${name}'님이 성공적으로 등록되었습니다.`);
      setEmail('');
      setPassword('');
      setName('');
      setDepartment('');
      setPosition('');
      setRole('general');
      setShowPassword(false);

      // Refresh list
      const usersRes = await fetch('/api/users');
      const usersJson = await usersRes.json();
      setUsers(usersJson.users || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditDepartment(user.department);
    setEditPosition(user.position);
    setEditRole(user.role);
    setEditPassword('');
    setShowEditPassword(false);
    setShowEditModal(true);
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName,
          department: editDepartment,
          position: editPosition,
          role: editRole,
          password: editPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '사용자 정보 업데이트에 실패했습니다.');

      setShowEditModal(false);
      setEditingUser(null);
      
      // Refresh list
      const usersRes = await fetch('/api/users');
      const usersJson = await usersRes.json();
      setUsers(usersJson.users || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleActive = async (user: any) => {
    const actionText = user.isActive ? '비활성화' : '활성화';
    if (!confirm(`사용자 '${user.name}'님을 정말 ${actionText}하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isActive: !user.isActive
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '사용자 활성 상태 변경에 실패했습니다.');

      // Refresh list
      const usersRes = await fetch('/api/users');
      const usersJson = await usersRes.json();
      setUsers(usersJson.users || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">설정 페이지를 불러오는 중...</p>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Detail Card */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-3">
            <User className="text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">개인 정보 설정</h2>
          </div>

          {currentUser && (
            <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-xl font-extrabold text-indigo-300">
                  {currentUser.name[0]}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white">
                    {currentUser.name} {currentUser.position}
                  </h3>
                  <p className="text-xs text-slate-400">{currentUser.department}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-card-border/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">로그인 아이디</span>
                  <span className="text-slate-300 font-medium">{currentUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">시스템 권한</span>
                  <span className="text-indigo-400 font-semibold uppercase">
                    {currentUser.role === 'admin' ? '관리자 (Admin)' : currentUser.role === 'requester' ? '회의개설자 (Requester)' : '일반팀원 (General)'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Admin User Management Portal */}
        <div className="lg:col-span-2 space-y-8">
          {isAdmin ? (
            <>
              {/* User Creation Form */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <UserPlus className="text-indigo-400" />
                  신규 사용자 등록
                </h2>
                
                <div className="glass-panel p-6 rounded-2xl border border-card-border">
                  <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                    {successMsg && (
                      <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle size={14} />
                        {successMsg}
                      </div>
                    )}
                    {errorMsg && (
                      <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-300 font-semibold flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">성명 *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="예: 홍길동"
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                          required
                        />
                      </div>

                      {/* Login ID / Email */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">로그인 아이디 (이메일) *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 text-slate-500 w-3.5 h-3.5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username@meetinghub.local"
                            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white"
                            required
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">로그인 비밀번호 *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 text-slate-500 w-3.5 h-3.5" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 설정"
                            className="w-full pl-9 pr-10 py-2 rounded-xl glass-input text-xs text-white"
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Team Name / Department */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">팀명 (부서) *</label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="예: 개발팀, 기획팀, 인사팀"
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                          required
                        />
                      </div>

                      {/* Job Title / Position */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">직위 (직급) *</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-2.5 text-slate-500 w-3.5 h-3.5" />
                          <input
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="예: 과장, 책임연구원, 파트장"
                            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white"
                            required
                          />
                        </div>
                      </div>

                      {/* System Role */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">시스템 권한 *</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                          required
                        >
                          <option value="general">일반 팀원</option>
                          <option value="requester">회의 개설자</option>
                          <option value="admin">관리자</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3 animate-spin" />
                            사용자 등록 중...
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            사용자 신규 생성
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Members Directory */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Users className="text-indigo-400" />
                  팀원 목록 ({users.length})
                </h2>

                <div className="glass-panel rounded-2xl border border-card-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-card-border bg-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-5 py-3">이름/직위</th>
                          <th className="px-5 py-3">팀명</th>
                          <th className="px-5 py-3">로그인 아이디</th>
                          <th className="px-5 py-3">권한</th>
                          <th className="px-5 py-3 text-right">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-card-border/50 text-xs text-slate-300">
                        {users.map((user) => (
                          <tr 
                            key={user.id} 
                            className={`transition-all ${
                              !user.isActive 
                                ? 'opacity-40 bg-slate-950/40 text-slate-500' 
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="px-5 py-3 font-semibold text-slate-200">
                              <span className={!user.isActive ? 'text-slate-500 line-through' : ''}>
                                {user.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal pl-1">({user.position})</span>
                              {!user.isActive && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-400 border border-slate-700 ml-1.5 uppercase">
                                  비활성
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-slate-400">{user.department}</td>
                            <td className="px-5 py-3 text-slate-400">{user.email}</td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                user.role === 'admin' 
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' 
                                  : user.role === 'requester'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/10'
                              }`}>
                                {user.role === 'admin' ? '관리자' : user.role === 'requester' ? '개설자' : '팀원'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-card-border text-[10px] cursor-pointer transition-all"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleToggleActive(user)}
                                className={`px-2 py-1 rounded text-[10px] cursor-pointer transition-all border ${
                                  user.isActive
                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400'
                                    : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-400'
                                }`}
                              >
                                {user.isActive ? '비활성화' : '활성화'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-card-border text-center flex flex-col items-center justify-center">
              <Shield className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">관리자 기능입니다.</h3>
              <p className="text-slate-500 text-xs max-w-sm">
                사용자 관리 및 추가는 관리자 계정(`admin@meetinghub.local`)으로 로그인한 상태에서만 접근할 수 있습니다.
              </p>
            </div>
          )}
        </div>

      </main>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-card-border space-y-4 relative animate-scale-up">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-1.5 pb-2 border-b border-card-border">
              <Edit2 size={16} className="text-indigo-400" />
              사용자 정보 수정 ({editingUser.email})
            </h3>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">성명 *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">팀명 (부서) *</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">직위 (직급) *</label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">시스템 권한 *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                  required
                >
                  <option value="general">일반 팀원</option>
                  <option value="requester">회의 개설자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>

              {/* Password Reset Section */}
              <div className="pt-2 border-t border-card-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400">비밀번호 변경 (선택사항)</span>
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="text-[10px] text-slate-500 hover:text-white underline cursor-pointer"
                  >
                    {showEditPassword ? '취소' : '변경하기'}
                  </button>
                </div>

                {showEditPassword && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 text-slate-500 w-3.5 h-3.5" />
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="새 비밀번호 입력"
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs text-white"
                      autoComplete="new-password"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors cursor-pointer border border-card-border"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="w-3 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '정보 저장'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
