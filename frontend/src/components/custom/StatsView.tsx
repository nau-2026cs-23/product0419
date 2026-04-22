import { useMemo } from 'react';
import type { Task, SystemExam } from '../../types';
import { getDaysUntil, formatDate, isExpired } from '../../lib/data';

interface StatsViewProps {
  tasks: Task[];
  systemExams: SystemExam[];
  systemRemindersEnabled: boolean;
}

export default function StatsView({ tasks, systemExams, systemRemindersEnabled }: StatsViewProps) {
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
        <h2 className="font-bold text-foreground text-base mb-3">总览</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-secondary rounded-2xl border border-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <div className="text-foreground text-sm mt-1">总事项数</div>
            <div className="mt-2 text-xs text-foreground">包含手动添加的所有事项</div>
          </div>
          <div className="bg-secondary rounded-2xl border border-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="text-3xl font-bold text-foreground">{stats.completed}</div>
            <div className="text-foreground text-sm mt-1">已完成</div>
            <div className="mt-2 text-xs text-foreground">完成率 {stats.completionRate}%</div>
          </div>
          <div className="bg-secondary rounded-2xl border border-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
            <div className="text-foreground text-sm mt-1">待完成</div>
            <div className="mt-2 text-xs text-foreground">需要处理的事项</div>
          </div>
          <div className="bg-secondary rounded-2xl border border-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="text-3xl font-bold text-red-500">{stats.overdue}</div>
            <div className="text-foreground text-sm mt-1">已过期</div>
            <div className="mt-2 text-xs text-foreground">需要尽快处理</div>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="bg-secondary rounded-2xl border border-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground text-sm">完成进度</h3>
            <span className="text-foreground font-bold text-sm">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-white/40 rounded-full h-3">
            <div
              className="bg-foreground h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-foreground">
            <span>已完成 {stats.completed} 项</span>
            <span>共 {stats.total} 项</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-secondary rounded-2xl border border-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 mb-6">
          <h3 className="font-bold text-foreground text-sm mb-3">事项分类</h3>
          <div className="flex flex-col gap-3">
            {
              [
                { label: '作业', count: stats.byCategory.homework, color: 'bg-amber-400', textColor: 'text-amber-600' },
                { label: '考试', count: stats.byCategory.exam, color: 'bg-blue-400', textColor: 'text-blue-600' },
                { label: '报名', count: stats.byCategory.registration, color: 'bg-foreground', textColor: 'text-foreground' },
                { label: '其他', count: stats.byCategory.other, color: 'bg-gray-400', textColor: 'text-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-16 text-foreground text-xs font-medium">{item.label}</div>
                  <div className="flex-1 bg-white/40 rounded-full h-2">
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
            <h3 className="font-bold text-foreground text-base mb-3">紧急事项（7天内）</h3>
            <div className="flex flex-col gap-2">
              {urgentTasks.map((task) => {
                const days = getDaysUntil(task.deadline);
                return (
                  <div key={task.id} className="bg-secondary rounded-xl border border-white p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                        days <= 1 ? 'bg-red-100' : days <= 3 ? 'bg-orange-100' : 'bg-amber-100'
                      }`}
                    >
                      <span
                        className={`text-base font-bold leading-none ${
                          days <= 1 ? 'text-red-500' : days <= 3 ? 'text-orange-500' : 'text-amber-500'
                        }`}
                      >
                        {days}
                      </span>
                      <span className="text-foreground text-xs">天</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground text-sm font-semibold truncate">{task.title}</div>
                      <div className="text-foreground text-xs mt-0.5">{formatDate(task.deadline)}</div>
                    </div>
                    {days <= 3 && (
                      <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">紧急</span>
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
            <h3 className="font-bold text-foreground text-base mb-3">即将到来的考试</h3>
            <div className="flex flex-col gap-2">
              {upcomingExams.map((exam) => {
                const days = getDaysUntil(exam.date);
                return (
                  <div key={exam.id} className="bg-secondary rounded-xl border border-white p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                        <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground text-sm font-semibold truncate">{exam.title}</div>
                      <div className="text-foreground text-xs mt-0.5">{formatDate(exam.date)}</div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-foreground font-bold text-sm">{days}天</span>
                      <span className="text-foreground text-xs">{exam.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.total === 0 && upcomingExams.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <div className="text-foreground text-sm">添加事项后将在这里显示统计数据</div>
          </div>
        )}
      </div>
    </div>
  );
}
