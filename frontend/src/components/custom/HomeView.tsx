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
  theme: 'purple' | 'teal' | 'gray';
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
  theme,
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
    case 'competition':
      filteredTasks = nonArchived.filter((t) => t.category === 'competition');
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
    { key: 'competition', label: '竞赛' },
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
      <div className={`${theme === 'purple' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : theme === 'teal' ? 'bg-gradient-to-r from-teal-600 to-green-600' : 'bg-gradient-to-r from-gray-700 to-slate-700'}`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{weekTasks.length}</div>
              <div className="text-white/80 text-xs mt-0.5">本周待办</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{systemCount}</div>
              <div className="text-white/80 text-xs mt-0.5">系统提醒</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{completedCount}</div>
              <div className="text-white/80 text-xs mt-0.5">已完成</div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Banner */}
      {nextExam && (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-4">
          <div className={`rounded-2xl p-4 flex items-center gap-4 shadow-lg overflow-hidden relative ${
            theme === 'purple' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
            theme === 'teal' ? 'bg-gradient-to-r from-cyan-500 to-teal-500' :
            'bg-gradient-to-r from-slate-600 to-gray-600'
          }`}>
            <div className="absolute right-0 top-0 w-32 h-full opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="white">
                <circle cx="80" cy="20" r="40" />
              </svg>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              theme === 'purple' ? 'bg-white/30' :
              theme === 'teal' ? 'bg-white/30' :
              'bg-white/30'
            }`}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/70 text-xs uppercase tracking-wide">距离下次考试</div>
              <div className="text-white font-bold text-base truncate">{nextExam.title}</div>
              <div className="text-white/90 text-sm font-semibold">
                还有 <span className="text-xl font-bold text-white">{getDaysUntil(nextExam.date)}</span> 天 · {formatDate(nextExam.date)}
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                theme === 'purple' ? 'bg-pink-200 text-pink-800' :
                theme === 'teal' ? 'bg-teal-200 text-teal-800' :
                'bg-gray-200 text-gray-800'
              }`}>{nextExam.tag}</span>
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
                  ? `${theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white' : 'bg-gradient-to-r from-gray-600 to-slate-600 text-white'} font-semibold shadow-md`
                  : `${theme === 'purple' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : theme === 'teal' ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
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
              {activeFilter === 'all' ? '近天事项' : activeFilter === 'week' ? '本周事项' : activeFilter === 'exam' ? '考试事项' : activeFilter === 'registration' ? '报名事项' : activeFilter === 'competition' ? '竞赛事项' : '作业事项'}
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
                  className={`rounded-2xl border shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 group ${
                    theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100' :
                    theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-100' :
                    'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                  } ${isCompleted ? 'opacity-60' : ''} ${isSwiped ? '-translate-x-20' : 'translate-x-0'} transition-transform duration-200`}
                >
                  <div className="flex items-stretch">
                    <div
                      className={`w-1 flex-shrink-0 rounded-l-2xl ${
                        isCompleted
                          ? theme === 'purple' ? 'bg-purple-400' : theme === 'teal' ? 'bg-teal-400' : 'bg-gray-400'
                          : days <= 3 && days >= 0
                          ? 'bg-red-500'
                          : theme === 'purple' ? 'bg-gradient-to-b from-purple-500 to-pink-500' : theme === 'teal' ? 'bg-gradient-to-b from-teal-500 to-green-500' : 'bg-gradient-to-b from-gray-600 to-slate-600'
                      }`}
                    />
                    <div className="flex items-center gap-3 p-4 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleTask(task.id)}
                        aria-label={isCompleted ? '取消完成' : '标记完成'}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
                          isCompleted
                            ? `${theme === 'purple' ? 'bg-purple-500 border-purple-500' : theme === 'teal' ? 'bg-teal-500 border-teal-500' : 'bg-gray-600 border-gray-600'} border-transparent`
                            : `${theme === 'purple' ? 'border-purple-400 hover:border-purple-600' : theme === 'teal' ? 'border-teal-400 hover:border-teal-600' : 'border-gray-400 hover:border-gray-600'} bg-white/50`
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
                          theme === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                          theme === 'teal' ? 'bg-gradient-to-br from-teal-500 to-green-500' :
                          'bg-gradient-to-br from-gray-600 to-slate-600'
                        }`}
                      >
                        {task.source === 'system' ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                            <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm ${
                              isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
                            }`}
                          >
                            {task.title}
                          </span>
                          {!isCompleted && days <= 3 && days >= 0 && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">紧急</span>
                          )}
                          {task.tag && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              theme === 'purple' ? 'bg-purple-100 text-purple-700' :
                              theme === 'teal' ? 'bg-teal-100 text-teal-700' :
                              'bg-gray-200 text-gray-700'
                            }`}>{task.tag}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <svg className={`w-3.5 h-3.5 ${theme === 'purple' ? 'text-purple-500' : theme === 'teal' ? 'text-teal-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {isCompleted ? (
                            <span className="text-gray-400 text-xs">{formatDateTime(task.deadline)} · 已完成</span>
                          ) : (
                            <>
                              <span className="text-gray-500 text-xs">{formatDateTime(task.deadline)}</span>
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors duration-200 ${
                            theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSwipe(task.id)}
                          aria-label="更多操作"
                          className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors duration-200 ${
                            theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                          }`}
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
              <h2 className={`font-bold text-base ${
                theme === 'purple' ? 'text-indigo-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
              }`}>系统内置考试提醒</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${
                  theme === 'purple' ? 'text-indigo-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>已开启</span>
                <button
                  role="switch"
                  aria-checked={systemRemindersEnabled}
                  onClick={onToggleSystemReminders}
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                    theme === 'purple' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                    theme === 'teal' ? 'bg-gradient-to-r from-cyan-500 to-teal-500' :
                    'bg-gradient-to-r from-gray-500 to-slate-500'
                  }`}
                >
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleSystemExams
                .filter((e) => {
                  if (activeFilter === 'exam') return e.type === 'exam' && e.category !== 'competition';
                  if (activeFilter === 'registration') return e.type === 'registration' && e.category !== 'competition';
                  return e.category !== 'competition';
                })
                .map((exam) => {
                  const days = getDaysUntil(exam.date);
                  return (
                    <div
                      key={exam.id}
                      className={`rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer ${
                        theme === 'purple' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100' :
                        theme === 'teal' ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100' :
                        'bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200'
                      }`}
                      onClick={() => setSelectedExam(exam)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            theme === 'purple' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                            theme === 'teal' ? 'bg-gradient-to-br from-cyan-500 to-blue-500' :
                            'bg-gradient-to-br from-slate-600 to-gray-600'
                          }`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                              <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{exam.title}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{exam.subtitle}</div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${getCountdownBadgeStyle(days)}`}>
                          {days}天
                        </span>
                      </div>
                      <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                        theme === 'purple' ? 'border-blue-100' :
                        theme === 'teal' ? 'border-cyan-100' :
                        'border-slate-200'
                      }`}>
                        <div className="text-gray-500 text-xs">📅 {formatDate(exam.date)}</div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            theme === 'purple' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                            theme === 'teal' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                            'bg-gradient-to-r from-slate-500 to-gray-500'
                          }`} />
                          <span className="text-gray-600 text-xs font-medium">提醒已开启</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* System Competition Reminders Section */}
        {(activeFilter === 'all' || activeFilter === 'competition') && systemRemindersEnabled && (
          <>
            <div className="flex items-center justify-between mt-8 mb-3">
              <h2 className={`font-bold text-base ${
                theme === 'purple' ? 'text-pink-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
              }`}>系统内置竞赛提醒</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${
                  theme === 'purple' ? 'text-pink-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>已开启</span>
                <button
                  role="switch"
                  aria-checked={systemRemindersEnabled}
                  onClick={onToggleSystemReminders}
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                    theme === 'purple' ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
                    theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500' :
                    'bg-gradient-to-r from-gray-500 to-slate-500'
                  }`}
                >
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleSystemExams
                .filter((e) => {
                  if (activeFilter === 'competition') return e.type === 'competition' || e.category === 'competition';
                  return e.category === 'competition';
                })
                .map((exam) => {
                  const days = getDaysUntil(exam.date);
                  return (
                    <div
                        key={exam.id}
                        className={`rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer ${
                          theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100' :
                          theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100' :
                          'bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200'
                        }`}
                        onClick={() => setSelectedExam(exam)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              theme === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                              theme === 'teal' ? 'bg-gradient-to-br from-teal-500 to-green-500' :
                              'bg-gradient-to-br from-gray-600 to-slate-600'
                            }`}>
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">{exam.title}</div>
                              <div className="text-gray-500 text-xs mt-0.5">{exam.subtitle}</div>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${getCountdownBadgeStyle(days)}`}>
                            {days}天
                          </span>
                        </div>
                        <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                          theme === 'purple' ? 'border-purple-100' :
                          theme === 'teal' ? 'border-teal-100' :
                          'border-gray-200'
                        }`}>
                          <div className="text-gray-500 text-xs">📅 {formatDate(exam.date)}</div>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500' :
                              'bg-gradient-to-r from-gray-500 to-slate-500'
                            }`} />
                            <span className="text-gray-600 text-xs font-medium">提醒已开启</span>
                          </div>
                        </div>
                      </div>
                  );
                })}
            </div>
          </>
        )}

        {/* System reminders disabled state */}
        {(activeFilter === 'all' || activeFilter === 'exam' || activeFilter === 'registration' || activeFilter === 'competition') && !systemRemindersEnabled && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`font-bold text-base ${
                theme === 'purple' ? 'text-indigo-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
              }`}>系统内置提醒</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${
                  theme === 'purple' ? 'text-indigo-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>已关闭</span>
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
            <div className={`rounded-2xl border p-6 text-center ${
              theme === 'purple' ? 'bg-purple-50 border-purple-100' :
              theme === 'teal' ? 'bg-teal-50 border-teal-100' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-3xl mb-2">🔕</div>
              <div className={`text-sm ${
                theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
              }`}>系统提醒已关闭，开启后可查看内置考试和竞赛日程</div>
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
              <h2 className={`font-semibold text-sm uppercase tracking-wide ${
                theme === 'purple' ? 'text-indigo-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
              }`}>历史考试归档</h2>
              <div className={`flex items-center gap-1 text-xs ${
                theme === 'purple' ? 'text-indigo-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
              }`}>
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
                    className={`rounded-xl border p-3 flex items-center gap-3 opacity-50 ${
                      theme === 'purple' ? 'bg-purple-50 border-purple-100' :
                      theme === 'teal' ? 'bg-teal-50 border-teal-100' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'purple' ? 'bg-gradient-to-br from-purple-400 to-pink-400' :
                      theme === 'teal' ? 'bg-gradient-to-br from-teal-400 to-green-400' :
                      'bg-gradient-to-br from-gray-400 to-slate-400'
                    }`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                        <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-500 text-sm font-medium line-through">{exam.title}</div>
                      <div className="text-gray-400 text-xs">{formatDate(exam.date)} · 已过期</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        theme === 'purple' ? 'bg-purple-100 text-purple-600' :
                        theme === 'teal' ? 'bg-teal-100 text-teal-600' :
                        'bg-gray-200 text-gray-600'
                      }`}>已归档</span>
                      <button
                        onClick={() => handleDeleteArchiveClick(exam.id)}
                        className={`hover:text-red-500 transition-colors ${
                          theme === 'purple' ? 'text-purple-400' : theme === 'teal' ? 'text-teal-400' : 'text-gray-400'
                        }`}
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
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl ${
            theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
            theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50' :
            'bg-gradient-to-br from-gray-50 to-slate-50'
          }`}>
            <h3 className={`font-bold text-lg mb-2 ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>确认删除</h3>
            <p className={`text-sm mb-6 ${
              theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
            }`}>删除后无法恢复，确定要删除这条事项吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  theme === 'purple' ? 'border-purple-300 text-purple-700 hover:bg-purple-100' :
                  theme === 'teal' ? 'border-teal-300 text-teal-700 hover:bg-teal-100' :
                  'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
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
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl ${
            theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
            theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50' :
            'bg-gradient-to-br from-gray-50 to-slate-50'
          }`}>
            <h3 className={`font-bold text-lg mb-2 ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>确认删除</h3>
            <p className={`text-sm mb-6 ${
              theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
            }`}>删除后无法恢复，确定要删除这条归档考试吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteArchiveId(null)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  theme === 'purple' ? 'border-purple-300 text-purple-700 hover:bg-purple-100' :
                  theme === 'teal' ? 'border-teal-300 text-teal-700 hover:bg-teal-100' :
                  'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
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
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl ${
            theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
            theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50' :
            'bg-gradient-to-br from-gray-50 to-slate-50'
          }`}>
            <h3 className={`font-bold text-lg mb-4 ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>修改事项</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                  }`}>标题</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                      theme === 'purple' ? 'border-purple-200 focus:ring-purple-400 bg-white/80' :
                      theme === 'teal' ? 'border-teal-200 focus:ring-teal-400 bg-white/80' :
                      'border-gray-200 focus:ring-gray-400 bg-white/80'
                    }`}
                    placeholder="输入事项标题"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                  }`}>截止日期</label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={editForm.deadline}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                      theme === 'purple' ? 'border-purple-200 focus:ring-purple-400 bg-white/80' :
                      theme === 'teal' ? 'border-teal-200 focus:ring-teal-400 bg-white/80' :
                      'border-gray-200 focus:ring-gray-400 bg-white/80'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                  }`}>分类</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                      theme === 'purple' ? 'border-purple-200 focus:ring-purple-400 bg-white/80' :
                      theme === 'teal' ? 'border-teal-200 focus:ring-teal-400 bg-white/80' :
                      'border-gray-200 focus:ring-gray-400 bg-white/80'
                    }`}
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
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    theme === 'purple' ? 'border-purple-300 text-purple-700 hover:bg-purple-100' :
                    theme === 'teal' ? 'border-teal-300 text-teal-700 hover:bg-teal-100' :
                    'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                    theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90' :
                    theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500 hover:opacity-90' :
                    'bg-gradient-to-r from-gray-600 to-slate-600 hover:opacity-90'
                  }`}
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
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
            theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50' :
            'bg-gradient-to-br from-gray-50 to-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-lg ${
                theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
              }`}>{selectedExam.title}</h3>
              <button
                onClick={() => setSelectedExam(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'purple' ? 'bg-purple-200 hover:bg-purple-300' :
                  theme === 'teal' ? 'bg-teal-200 hover:bg-teal-300' :
                  'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <svg className={`w-4 h-4 ${
                  theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={`text-sm mb-3 ${
              theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
            }`}>{selectedExam.subtitle}</div>
            <div className={`text-sm mb-4 ${
              theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className={`w-4 h-4 ${
                  theme === 'purple' ? 'text-purple-500' : theme === 'teal' ? 'text-teal-500' : 'text-gray-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                  <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {formatDate(selectedExam.date)}
              </div>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${
                  theme === 'purple' ? 'text-purple-500' : theme === 'teal' ? 'text-teal-500' : 'text-gray-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedExam.tag}
              </div>
            </div>
            <div className={`text-sm border-t pt-4 ${
              theme === 'purple' ? 'border-purple-200 text-purple-700' :
              theme === 'teal' ? 'border-teal-200 text-teal-700' :
              'border-gray-200 text-gray-700'
            }`}>
              <h4 className="font-medium mb-2">考试简介</h4>
              <p className="mb-4">{selectedExam.description || '暂无简介'}</p>
              {selectedExam.registrationUrl && (
                <div>
                  <h4 className="font-medium mb-2">报名网址</h4>
                  <a
                    href={selectedExam.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline hover:opacity-80 transition-colors ${
                      theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                    }`}
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
