import { useState, useMemo } from 'react';
import type { Task, SystemExam, FilterTab } from '../../types';
import { getDaysUntil, formatDate, formatDateTime, isExpired, SYSTEM_EXAMS, ARCHIVED_EXAMS } from '../../lib/data';

interface HomeViewProps {
  tasks: Task[];
  systemExams: SystemExam[];
  systemRemindersEnabled: boolean;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleSystemReminders: () => void;
  onOpenAddTask: () => void;
}

export default function HomeView({
  tasks,
  systemExams,
  systemRemindersEnabled,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onToggleSystemReminders,
  onOpenAddTask,
}: HomeViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showAllSystem, setShowAllSystem] = useState(false);
  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteArchiveId, setConfirmDeleteArchiveId] = useState<string | null>(null);
  const [archivedExams, setArchivedExams] = useState(ARCHIVED_EXAMS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    deadline: '',
    category: 'homework',
    tag: ''
  });
  const [selectedExam, setSelectedExam] = useState<SystemExam | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Next upcoming exam for countdown banner
  const nextExam = useMemo(() => {
    if (!systemRemindersEnabled) return null;
    return systemExams
      .filter((e) => !isExpired(e.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;
  }, [systemExams, systemRemindersEnabled]);

  // Stats
  const weekTasks = tasks.filter(
    (t) => t.status === 'pending' && !t.isArchived && isWithin7Days(t.deadline)
  );
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const systemCount = systemRemindersEnabled ? systemExams.filter((e) => !isExpired(e.date)).length : 0;

  function isWithin7Days(dateStr: string) {
    const diff = getDaysUntil(dateStr);
    return diff >= 0 && diff <= 7;
  }

  // Filtered tasks (computed inline to avoid memoization dependency issues)
  const nonArchived = tasks.filter((t) => !t.isArchived);
  let filteredTasks: Task[];
  switch (activeFilter) {
    case 'week':
      filteredTasks = nonArchived.filter((t) => isWithin7Days(t.deadline));
      break;
    case 'exam':
      filteredTasks = nonArchived.filter((t) => t.category === 'exam');
      break;
    case 'registration':
      filteredTasks = nonArchived.filter((t) => t.category === 'registration');
      break;
    case 'homework':
      filteredTasks = nonArchived.filter((t) => t.category === 'homework');
      break;
    case 'history':
      filteredTasks = nonArchived.filter((t) => t.status === 'completed');
      break;
    default:
      filteredTasks = nonArchived;
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  // 先过滤和排序，然后再截取前4个
  const filteredAndSortedSystemExams = systemExams
    .filter((e) => !isExpired(e.date))
    .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
  
  const visibleSystemExams = showAllSystem ? filteredAndSortedSystemExams : filteredAndSortedSystemExams.slice(0, 4);

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'week', label: '本周' },
    { key: 'exam', label: '考试' },
    { key: 'registration', label: '报名' },
    { key: 'homework', label: '作业' },
    { key: 'history', label: '历史' },
  ];

  function getDaysLabel(days: number): string {
    if (days < 0) return '已过期';
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    return `还有${days}天`;
  }

  function getUrgencyColor(days: number): string {
    if (days < 0) return 'text-gray-400';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-amber-500';
    return 'text-[#0a4313]';
  }

  function getCountdownBadgeStyle(days: number): string {
    if (days <= 7) return 'bg-amber-50 text-amber-600';
    if (days <= 30) return 'bg-blue-50 text-blue-600';
    return 'bg-blue-50 text-[#7da389]';
  }

  function handleSwipe(id: string) {
    setSwipedTaskId(swipedTaskId === id ? null : id);
  }

  function handleDeleteClick(id: string) {
    setConfirmDeleteId(id);
    setSwipedTaskId(null);
  }

  function confirmDelete() {
    if (confirmDeleteId) {
      onDeleteTask(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }

  function handleDeleteArchiveClick(id: string) {
    setConfirmDeleteArchiveId(id);
  }

  function confirmDeleteArchive() {
    if (confirmDeleteArchiveId) {
      setArchivedExams(archivedExams.filter(exam => exam.id !== confirmDeleteArchiveId));
      setConfirmDeleteArchiveId(null);
    }
  }

  function handleEditClick(task: Task) {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      deadline: task.deadline,
      category: task.category,
      tag: task.tag || ''
    });
    setIsEditModalOpen(true);
  }

  function handleEditCancel() {
    setIsEditModalOpen(false);
    setEditingTask(null);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleEditSubmit() {
    if (editingTask) {
      // 调用父组件传递的修改任务函数
      const updatedTask: Task = {
        ...editingTask,
        title: editForm.title,
        deadline: editForm.deadline,
        category: editForm.category as 'homework' | 'exam' | 'registration' | 'other',
        tag: editForm.category === 'homework' ? '作业' : editForm.category === 'exam' ? '考试' : editForm.category === 'registration' ? '报名' : undefined
      };
      onEditTask(updatedTask);
      setIsEditModalOpen(false);
      setEditingTask(null);
    }
  }

  const today7 = new Date();
  today7.setDate(today7.getDate() + 7);
  const dateRangeLabel = `${today.getMonth() + 1}月${today.getDate()}日 — ${today7.getMonth() + 1}月${today7.getDate()}日`;

  return (
    <div className="pb-28">
      {/* Hero Summary Strip */}
      <div className="bg-primary/80">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{weekTasks.length}</div>
              <div className="text-white/80 text-xs mt-0.5">本周待办</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-accent-foreground">{systemCount}</div>
              <div className="text-white/80 text-xs mt-0.5">系统提醒</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{completedCount}</div>
              <div className="text-white/80 text-xs mt-0.5">已完成</div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Banner */}
      {nextExam && (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-primary rounded-2xl p-4 flex items-center gap-4 shadow-lg overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-full opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="white">
                <circle cx="80" cy="20" r="40" />
              </svg>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/70 text-xs uppercase tracking-wide">距离下次考试</div>
              <div className="text-white font-bold text-base truncate">{nextExam.title}</div>
              <div className="text-secondary text-sm font-semibold">
                还有 <span className="text-xl font-bold text-white">{getDaysUntil(nextExam.date)}</span> 天 · {formatDate(nextExam.date)}
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full">{nextExam.tag}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-5">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                activeFilter === f.key
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-secondary text-foreground hover:bg-primary hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-5">
        {/* Section: Tasks */}
        {activeFilter !== 'history' && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-black font-bold text-base">
              {activeFilter === 'all' ? '近天事项' : activeFilter === 'week' ? '本周事项' : activeFilter === 'exam' ? '考试事项' : activeFilter === 'registration' ? '报名事项' : '作业事项'}
            </h2>
            {activeFilter === 'all' && (
              <span className="text-[#0a4313] text-xs">{dateRangeLabel}</span>
            )}
          </div>
        )}
        {activeFilter === 'history' && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-black font-bold text-base">已完成事项</h2>
          </div>
        )}

        {sortedTasks.length === 0 && (
          <div className="text-center py-10 text-[#0a4313] text-sm">
            <div className="text-4xl mb-3">🎉</div>
            <div>暂无事项，点击下方 + 添加新事项</div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {sortedTasks.map((task) => {
            const days = getDaysUntil(task.deadline);
            const isCompleted = task.status === 'completed';
            const isSwiped = swipedTaskId === task.id;

            return (
              <div key={task.id} className="relative overflow-hidden rounded-2xl">
                {/* Swipe delete button */}
                <div
                  className={`absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500 transition-all duration-200 ${
                    isSwiped ? 'w-20' : 'w-0'
                  }`}
                >
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-white text-xs font-bold px-2"
                  >
                    删除
                  </button>
                </div>

                <div
                  className={`bg-secondary rounded-2xl border border-white shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 group ${
                    isCompleted ? 'opacity-60' : ''
                  } ${isSwiped ? '-translate-x-20' : 'translate-x-0'} transition-transform duration-200`}
                >
                  <div className="flex items-stretch">
                    <div
                      className={`w-1 flex-shrink-0 rounded-l-2xl ${
                        isCompleted
                          ? 'bg-foreground'
                          : days <= 3 && days >= 0
                          ? 'bg-red-500'
                          : 'bg-primary'
                      }`}
                    />
                    <div className="flex items-center gap-3 p-4 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleTask(task.id)}
                        aria-label={isCompleted ? '取消完成' : '标记完成'}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
                          isCompleted
                            ? 'bg-foreground border-foreground'
                            : 'border-white hover:border-foreground'
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          task.source === 'system' ? 'bg-white/20' : 'bg-white/20'
                        }`}
                      >
                        {task.source === 'system' ? (
                          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                            <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm ${
                              isCompleted ? 'text-foreground line-through' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </span>
                          {!isCompleted && days <= 3 && days >= 0 && (
                            <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">紧急</span>
                          )}
                          {task.tag && (
                            <span className="bg-white/20 text-foreground text-xs font-medium px-2 py-0.5 rounded-full">{task.tag}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <svg className="w-3.5 h-3.5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {isCompleted ? (
                            <span className="text-foreground text-xs">{formatDateTime(task.deadline)} · 已完成</span>
                          ) : (
                            <>
                              <span className="text-foreground text-xs">{formatDateTime(task.deadline)}</span>
                              <span className={`text-xs font-semibold ${getUrgencyColor(days)}`}>
                                · {days < 0 ? '已过期' : days === 0 ? '今天截止' : `还有${days}天`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(task)}
                          aria-label="修改"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSwipe(task.id)}
                          aria-label="更多操作"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Exam Reminders Section */}
        {(activeFilter === 'all' || activeFilter === 'exam' || activeFilter === 'registration') && systemRemindersEnabled && (
          <>
            <div className="flex items-center justify-between mt-8 mb-3">
              <h2 className="text-foreground font-bold text-base">系统内置考试提醒</h2>
              <div className="flex items-center gap-2">
                <span className="text-foreground text-xs">已开启</span>
                <button
                  role="switch"
                  aria-checked={systemRemindersEnabled}
                  onClick={onToggleSystemReminders}
                  className="relative w-10 h-6 bg-foreground rounded-full transition-colors duration-200"
                >
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleSystemExams
                .filter((e) => {
                  if (activeFilter === 'exam') return e.type === 'exam';
                  if (activeFilter === 'registration') return e.type === 'registration';
                  return true;
                })
                .map((exam) => {
                  const days = getDaysUntil(exam.date);
                  return (
                    <div
                      key={exam.id}
                      className="bg-secondary rounded-2xl border border-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedExam(exam)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                              <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm">{exam.title}</div>
                            <div className="text-foreground text-xs mt-0.5">{exam.subtitle}</div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${getCountdownBadgeStyle(days)}`}>
                          {days}天
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/50 flex items-center justify-between">
                        <div className="text-foreground text-xs">📅 {formatDate(exam.date)}</div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-foreground" />
                          <span className="text-foreground text-xs font-medium">提醒已开启</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {filteredAndSortedSystemExams.length > 4 && (
              <button
                onClick={() => setShowAllSystem(!showAllSystem)}
                className="w-full mt-3 py-3 rounded-2xl border border-white text-foreground text-sm font-medium hover:bg-secondary hover:text-foreground transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>{showAllSystem ? '收起' : `查看全部${filteredAndSortedSystemExams.length}条系统提醒`}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showAllSystem ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </>
        )}

        {/* System reminders disabled state */}
        {(activeFilter === 'all' || activeFilter === 'exam' || activeFilter === 'registration') && !systemRemindersEnabled && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-foreground font-bold text-base">系统内置考试提醒</h2>
              <div className="flex items-center gap-2">
                <span className="text-foreground text-xs">已关闭</span>
                <button
                  role="switch"
                  aria-checked={false}
                  onClick={onToggleSystemReminders}
                  className="relative w-10 h-6 bg-gray-300 rounded-full transition-colors duration-200"
                >
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
                </button>
              </div>
            </div>
            <div className="bg-secondary rounded-2xl border border-white p-6 text-center">
              <div className="text-3xl mb-2">🔕</div>
              <div className="text-foreground text-sm">系统提醒已关闭，开启后可查看内置考试日程</div>
            </div>
          </div>
        )}

        {/* Historical Archive Section */}
        {(activeFilter === 'all' || activeFilter === 'history') && (
          <div className="mt-8">
            <button
              onClick={() => setArchiveExpanded(!archiveExpanded)}
              className="flex items-center justify-between w-full group"
            >
              <h2 className="text-foreground font-semibold text-sm uppercase tracking-wide">历史考试归档</h2>
              <div className="flex items-center gap-1 text-foreground text-xs">
                <span>{archivedExams.length}条记录</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${archiveExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {archiveExpanded && (
              <div className="mt-2 flex flex-col gap-2">
                {archivedExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-secondary rounded-xl border border-white p-3 flex items-center gap-3 opacity-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                        <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground text-sm font-medium line-through">{exam.title}</div>
                      <div className="text-foreground text-xs">{formatDate(exam.date)} · 已过期</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-xs bg-white/20 px-2 py-0.5 rounded-full">已归档</span>
                      <button
                        onClick={() => handleDeleteArchiveClick(exam.id)}
                        className="text-foreground hover:text-red-500 transition-colors"
                        aria-label="删除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-foreground text-lg mb-2">确认删除</h3>
            <p className="text-foreground text-sm mb-6">删除后无法恢复，确定要删除这条事项吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-primary text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Delete Confirmation Dialog */}
      {confirmDeleteArchiveId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-foreground text-lg mb-2">确认删除</h3>
            <p className="text-foreground text-sm mb-6">删除后无法恢复，确定要删除这条归档考试吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteArchiveId(null)}
                className="flex-1 py-2.5 rounded-xl border border-primary text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteArchive}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-foreground text-lg mb-4">修改事项</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-1">标题</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-xl border border-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="输入事项标题"
                    required
                  />
                </div>
                <div>
                  <label className="block text-foreground text-sm font-medium mb-1">截止日期</label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={editForm.deadline}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-xl border border-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-foreground text-sm font-medium mb-1">分类</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded-xl border border-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="homework">作业</option>
                    <option value="exam">考试</option>
                    <option value="registration">报名</option>
                    <option value="other">其他</option>
                  </select>
                </div>

              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="flex-1 py-2.5 rounded-xl border border-primary text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/80 transition-colors"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-lg">{selectedExam.title}</h3>
              <button
                onClick={() => setSelectedExam(null)}
                className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-colors"
              >
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-foreground text-sm mb-3">{selectedExam.subtitle}</div>
            <div className="text-foreground text-sm mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                  <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {formatDate(selectedExam.date)}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedExam.tag}
              </div>
            </div>
            <div className="text-foreground text-sm border-t border-white/50 pt-4">
              <h4 className="font-medium mb-2">考试简介</h4>
              <p className="mb-4">{selectedExam.description || '暂无简介'}</p>
              {selectedExam.registrationUrl && (
                <div>
                  <h4 className="font-medium mb-2">报名网址</h4>
                  <a 
                    href={selectedExam.registrationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-foreground/80 transition-colors"
                  >
                    {selectedExam.registrationUrl}
                  </a>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 bg-foreground text-white rounded-lg hover:bg-foreground/90 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
