import { useMemo } from 'react';
import type { Task, SystemExam } from '../../types';
import { getDaysUntil, formatDate, isExpired } from '../../lib/data';

interface StatsViewProps {
  tasks: Task[];
  systemExams: SystemExam[];
  systemRemindersEnabled: boolean;
  theme: 'purple' | 'teal' | 'gray';
}

export default function StatsView({ tasks, systemExams, systemRemindersEnabled, theme }: StatsViewProps) {
  const stats = useMemo(() => {
    const total = tasks.filter((t) => !t.isArchived).length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending' && !t.isArchived).length;
    const overdue = tasks.filter(
      (t) => t.status === 'pending' && !t.isArchived && new Date(t.deadline) < new Date()
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byCategory = {
      homework: tasks.filter((t) => t.category === 'homework').length,
      exam: tasks.filter((t) => t.category === 'exam').length,
      registration: tasks.filter((t) => t.category === 'registration').length,
      other: tasks.filter((t) => t.category === 'other').length,
    };

    return { total, completed, pending, overdue, completionRate, byCategory };
  }, [tasks]);

  const upcomingExams = useMemo(() => {
    if (!systemRemindersEnabled) return [];
    return systemExams
      .filter((e) => !isExpired(e.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [systemExams, systemRemindersEnabled]);

  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'pending' && !t.isArchived)
      .filter((t) => {
        const days = getDaysUntil(t.deadline);
        return days >= 0 && days <= 7;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks]);

  return (
    <div className="pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4">
        {/* Overview Cards */}
        <h2 className="font-bold text-gray-800 text-base mb-3">总览</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${
            theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100' :
            theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-100' :
            'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
          }`}>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-gray-500 text-sm mt-1">总事项数</div>
            <div className="mt-2 text-xs text-gray-400">包含手动添加的所有事项</div>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${
            theme === 'purple' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' :
            theme === 'teal' ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100' :
            'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
          }`}>
            <div className="text-3xl font-bold text-gray-800">{stats.completed}</div>
            <div className="text-gray-500 text-sm mt-1">已完成</div>
            <div className="mt-2 text-xs text-gray-400">完成率 {stats.completionRate}%</div>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${
            theme === 'purple' ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100' :
            theme === 'teal' ? 'bg-gradient-to-br from-lime-50 to-green-50 border-lime-100' :
            'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
          }`}>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-gray-500 text-sm mt-1">待完成</div>
            <div className="mt-2 text-xs text-gray-400">需要处理的事项</div>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${
            theme === 'purple' ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100' :
            theme === 'teal' ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100' :
            'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className="text-3xl font-bold text-red-500">{stats.overdue}</div>
            <div className="text-gray-500 text-sm mt-1">已过期</div>
            <div className="mt-2 text-xs text-gray-400">需要尽快处理</div>
          </div>
        </div>

        {/* Completion Progress */}
        <div className={`rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 mb-6 ${
          theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100' :
          theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-100' :
          'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">完成进度</h3>
            <span className={`font-bold text-sm ${
              theme === 'purple' ? 'text-purple-600' :
              theme === 'teal' ? 'text-teal-600' :
              'text-gray-600'
            }`}>{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500' :
                'bg-gradient-to-r from-gray-500 to-slate-500'
              }`}
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>已完成 {stats.completed} 项</span>
            <span>共 {stats.total} 项</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className={`rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 mb-6 ${
          theme === 'purple' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' :
          theme === 'teal' ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100' :
          'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
        }`}>
          <h3 className="font-bold text-gray-800 text-sm mb-3">事项分类</h3>
          <div className="flex flex-col gap-3">
            {
              [
                { label: '作业', count: stats.byCategory.homework, color: theme === 'purple' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : theme === 'teal' ? 'bg-gradient-to-r from-lime-400 to-green-400' : 'bg-gradient-to-r from-yellow-400 to-amber-400', textColor: 'text-gray-600' },
                { label: '考试', count: stats.byCategory.exam, color: theme === 'purple' ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : theme === 'teal' ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : 'bg-gradient-to-r from-slate-400 to-gray-400', textColor: 'text-gray-600' },
                { label: '报名', count: stats.byCategory.registration, color: theme === 'purple' ? 'bg-gradient-to-r from-purple-400 to-pink-400' : theme === 'teal' ? 'bg-gradient-to-r from-teal-400 to-green-400' : 'bg-gradient-to-r from-gray-500 to-slate-500', textColor: 'text-gray-600' },
                { label: '其他', count: stats.byCategory.other, color: theme === 'purple' ? 'bg-gradient-to-r from-gray-400 to-slate-400' : theme === 'teal' ? 'bg-gradient-to-r from-gray-400 to-slate-400' : 'bg-gradient-to-r from-gray-400 to-slate-400', textColor: 'text-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-16 text-gray-600 text-xs font-medium">{item.label}</div>
                  <div className="flex-1 bg-white/50 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: stats.total > 0 ? `${(item.count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className={`w-6 text-xs font-bold ${item.textColor}`}>{item.count}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 text-base mb-3">紧急事项（7天内）</h3>
            <div className="flex flex-col gap-2">
              {urgentTasks.map((task) => {
                const days = getDaysUntil(task.deadline);
                return (
                  <div key={task.id} className={`rounded-xl border p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${
                    theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100' :
                    theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-100' :
                    'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                  }`}>
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                        days <= 1 ? 'bg-gradient-to-br from-red-500 to-rose-500' : days <= 3 ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-gradient-to-br from-amber-500 to-yellow-500'
                      }`}
                    >
                      <span className="text-base font-bold leading-none text-white">
                        {days}
                      </span>
                      <span className="text-white/80 text-xs">天</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 text-sm font-semibold truncate">{task.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{formatDate(task.deadline)}</div>
                    </div>
                    {days <= 3 && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">紧急</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming System Exams */}
        {upcomingExams.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-3">即将到来的考试</h3>
            <div className="flex flex-col gap-2">
              {upcomingExams.map((exam) => {
                const days = getDaysUntil(exam.date);
                return (
                  <div key={exam.id} className={`rounded-xl border p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${
                    theme === 'purple' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' :
                    theme === 'teal' ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100' :
                    'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
                  }`}>
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
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 text-sm font-semibold truncate">{exam.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{formatDate(exam.date)}</div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`font-bold text-sm ${
                        theme === 'purple' ? 'text-indigo-600' :
                        theme === 'teal' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>{days}天</span>
                      <span className="text-gray-500 text-xs">{exam.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.total === 0 && upcomingExams.length === 0 && (
          <div className={`text-center py-16 rounded-2xl border ${
            theme === 'purple' ? 'text-purple-600 border-purple-100 bg-purple-50' :
            theme === 'teal' ? 'text-teal-600 border-teal-100 bg-teal-50' :
            'text-gray-600 border-gray-200 bg-gray-50'
          }`}>
            <div className="text-5xl mb-4">📊</div>
            <div className="text-sm">添加事项后将在这里显示统计数据</div>
          </div>
        )}
      </div>
    </div>
  );
}
