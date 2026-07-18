export interface StatusDetail {
  label: string;
  bgClass: string;
  dotClass: string;
}

export const TASK_STATUS_MAP: Record<string, StatusDetail> = {
  todo: {
    label: '미착수',
    bgClass: 'bg-slate-500/10 border-slate-500/25 text-slate-400',
    dotClass: 'bg-slate-400',
  },
  in_progress: {
    label: '진행 중',
    bgClass: 'bg-indigo-500/15 border-indigo-500/25 text-indigo-300',
    dotClass: 'bg-indigo-400',
  },
  completed: {
    label: '완료',
    bgClass: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
  confirm_needed: {
    label: '확인 필요',
    bgClass: 'bg-amber-500/15 border-amber-500/25 text-amber-300',
    dotClass: 'bg-amber-400',
  },
};

export const getTaskStatusDetail = (status: string, isConfirmNeeded = false): StatusDetail => {
  if (isConfirmNeeded) {
    return TASK_STATUS_MAP.confirm_needed;
  }
  return TASK_STATUS_MAP[status] || TASK_STATUS_MAP.todo;
};

export interface PriorityDetail {
  label: string;
  bgClass: string;
}

export const TASK_PRIORITY_MAP: Record<string, PriorityDetail> = {
  high: {
    label: '높음',
    bgClass: 'bg-rose-500/15 border-rose-500/20 text-rose-300',
  },
  medium: {
    label: '보통',
    bgClass: 'bg-amber-500/15 border-amber-500/20 text-amber-300',
  },
  low: {
    label: '낮음',
    bgClass: 'bg-slate-500/15 border-slate-500/20 text-slate-400',
  },
};

export const getTaskPriorityDetail = (priority: string): PriorityDetail => {
  return TASK_PRIORITY_MAP[priority] || TASK_PRIORITY_MAP.medium;
};
