'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { 
  CheckSquare, Calendar, User, MessageSquare, 
  Plus, AlertCircle, CheckCircle, RefreshCw, Send, Loader2
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Task Filter Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'completed' | 'confirm_needed'>('all');

  // Manual Task Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [creatingTask, setCreatingTask] = useState(false);

  // Active Task Detail for Comments/Confirmation
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    initTasks();
  }, []);

  const initTasks = async () => {
    setLoading(true);
    try {
      // Get session
      const userRes = await fetch('/api/auth/me');
      const userJson = await userRes.json();
      setCurrentUser(userJson.session);

      // Get users list
      const usersRes = await fetch('/api/users');
      const usersJson = await usersRes.json();
      setUsers(usersJson.users || []);

      // Get all tasks
      const tasksRes = await fetch('/api/tasks');
      const tasksJson = await tasksRes.json();
      setTasks(tasksJson.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setCreatingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          assigneeId: assigneeId || null,
          dueDate: dueDate || null,
          priority
        })
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setAssigneeId('');
        setDueDate('');
        setPriority('medium');
        initTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        initTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmTask = async (taskId: string, confirmed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          confirmationStatus: confirmed ? 'confirmed' : 'change_requested' 
        })
      });

      if (res.ok) {
        initTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeTaskId) return;

    try {
      const res = await fetch(`/api/tasks/${activeTaskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, commentType: 'general' })
      });

      if (res.ok) {
        setNewComment('');
        initTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    // If active tab is confirm_needed, show tasks where confirmation is pending and user is the assignee
    if (activeTab === 'confirm_needed') {
      return t.confirmationStatus === 'pending' && t.assigneeId === currentUser?.id;
    }
    if (activeTab === 'todo') {
      return t.status === 'todo' || t.status === 'in_progress';
    }
    if (activeTab === 'completed') {
      return t.status === 'completed';
    }
    return true; // all
  });

  const selectedTaskDetails = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Tasks filter tabs and lists */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <CheckSquare className="text-indigo-400" />
              업무 관리함
            </h2>
            
            <button
              onClick={initTasks}
              className="p-2 rounded-lg bg-white/5 border border-card-border hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex border-b border-card-border gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 border-b-2 font-semibold transition-all cursor-pointer ${
                activeTab === 'all' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              전체 ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('todo')}
              className={`px-4 py-2 border-b-2 font-semibold transition-all cursor-pointer ${
                activeTab === 'todo' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              진행 중 ({tasks.filter((t) => t.status !== 'completed').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 border-b-2 font-semibold transition-all cursor-pointer ${
                activeTab === 'completed' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              완료 ({tasks.filter((t) => t.status === 'completed').length})
            </button>
            <button
              onClick={() => setActiveTab('confirm_needed')}
              className={`px-4 py-2 border-b-2 font-semibold transition-all cursor-pointer ${
                activeTab === 'confirm_needed' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              확인 필요 ({tasks.filter((t) => t.confirmationStatus === 'pending' && t.assigneeId === currentUser?.id).length})
            </button>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
              <span className="text-sm text-slate-400">업무 목록을 조회하는 중...</span>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const isSelected = task.id === activeTaskId;
                const isAssignee = task.assigneeId === currentUser?.id;
                const showConfirmBox = task.confirmationStatus === 'pending' && isAssignee;

                return (
                  <div
                    key={task.id}
                    className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected ? 'border-indigo-500 bg-indigo-950/10' : 'border-card-border hover:border-white/10'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => setActiveTaskId(task.id)}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-500'
                        }`}></span>
                        <h3 className="text-sm font-bold text-white leading-relaxed">
                          {task.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-1">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-card-border">
                          경로: {task.sourceType === 'ai_summary' ? 'AI 요약 자동 추출' : '직접 등록'}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            마감: {new Date(task.dueDate).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            담당: {task.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions and Status Selectors */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {showConfirmBox ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirmTask(task.id, true)}
                            className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/20 text-indigo-300 rounded text-xs font-semibold cursor-pointer"
                          >
                            담당 확인
                          </button>
                          <button
                            onClick={() => handleConfirmTask(task.id, false)}
                            className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/20 text-rose-300 rounded text-xs font-semibold cursor-pointer"
                          >
                            조정 요청
                          </button>
                        </div>
                      ) : (
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-900 border border-card-border text-xs text-slate-300"
                        >
                          <option value="todo">미착수</option>
                          <option value="in_progress">진행 중</option>
                          <option value="completed">완료</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-20 rounded-3xl border border-card-border text-center flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">해당하는 업무가 없습니다.</h3>
              <p className="text-slate-500 text-xs max-w-sm">
                할 일을 수동으로 추가하거나 회의록 AI 확정 처리를 해보세요.
              </p>
            </div>
          )}

        </div>

        {/* Right Side: Task details/Comments, Manual Task Creator */}
        <div className="space-y-6">
          
          {/* Task detail & Comments section */}
          {selectedTaskDetails ? (
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 space-y-4">
              <div className="flex justify-between items-center border-b border-card-border pb-3">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                  업무 상세 & 진행 코멘트
                </span>
                <button
                  onClick={() => setActiveTaskId(null)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  닫기
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white text-sm">{selectedTaskDetails.title}</h4>
                <p className="text-slate-400 leading-relaxed">{selectedTaskDetails.description}</p>
                
                {selectedTaskDetails.meeting && (
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/10 text-[10px] text-indigo-300">
                    출처 회의: {selectedTaskDetails.meeting.title}
                  </span>
                )}
              </div>

              {/* Comments list */}
              <div className="space-y-3 pt-3 border-t border-card-border">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  💬 업무 히스토리 / 코멘트
                </span>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedTaskDetails.comments?.length > 0 ? (
                    selectedTaskDetails.comments.map((comment: any) => (
                      <div key={comment.id} className="p-2 rounded bg-white/5 border border-card-border text-[11px]">
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                          <span className="font-bold text-slate-300">{comment.author.name}</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <p className="text-slate-400">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-600 text-[10px] block py-4 text-center">등록된 코멘트가 없습니다.</span>
                  )}
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="진행 현황 공유..."
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all cursor-pointer"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            /* Manual Task Creator */
            <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Plus size={16} className="text-indigo-400" />
                신규 업무 개별 등록
              </h3>

              <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[10px] uppercase">업무 제목 *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: API 라우트 규격 문서화"
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[10px] uppercase">상세 설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="업무 수행을 위한 세부 지침 및 요구사항 적기"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[10px] uppercase">담당자</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                  >
                    <option value="">담당자 선택</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold text-[10px] uppercase">마감일</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold text-[10px] uppercase">우선순위</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingTask}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  {creatingTask ? (
                    <>
                      <Loader2 className="w-3 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      할 일 등록
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
