import { useState, useMemo } from 'react';
import type { Task, SystemExam } from '../../types';
import { formatDate, getDaysUntil, isExpired } from '../../lib/data';

interface CalendarViewProps {
  tasks: Task[];
  systemExams: SystemExam[];
  systemRemindersEnabled: boolean;
  theme: 'purple' | 'teal' | 'gray';
}

export default function CalendarView({ tasks, systemExams, systemRemindersEnabled, theme }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Build event map: date string -> events
  const eventMap = useMemo(() => {
    const map: Record<string, Array<{ title: string; type: 'task' | 'system'; tag?: string }>> = {};

    tasks
      .filter((t) => t.status === 'pending' && !t.isArchived)
      .forEach((t) => {
        const d = new Date(t.deadline);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!map[key]) map[key] = [];
        map[key].push({ title: t.title, type: 'task', tag: t.tag });
      });

    if (systemRemindersEnabled) {
      systemExams
        .filter((e) => !isExpired(e.date))
        .forEach((e) => {
          const d = new Date(e.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (!map[key]) map[key] = [];
          map[key].push({ title: e.title, type: 'system', tag: e.tag });
        });
    }

    return map;
  }, [tasks, systemExams, systemRemindersEnabled]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  }

  function handleDayClick(day: number) {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(selectedDate === key ? null : key);
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const selectedEvents = selectedDate ? (eventMap[selectedDate] || []) : [];

  // Today's events timeline (next 24 hours)
  const todayEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events: Array<{ date: string; title: string; type: 'task' | 'system'; tag?: string; time: string }> = [];

    tasks
      .filter((t) => t.status === 'pending' && !t.isArchived)
      .forEach((t) => {
        const taskDate = new Date(t.deadline);
        if (taskDate >= today && taskDate < tomorrow) {
          const hours = taskDate.getHours().toString().padStart(2, '0');
          const minutes = taskDate.getMinutes().toString().padStart(2, '0');
          events.push({ date: t.deadline, title: t.title, type: 'task', tag: t.tag, time: `${hours}:${minutes}` });
        }
      });

    if (systemRemindersEnabled) {
      systemExams
        .filter((e) => !isExpired(e.date))
        .forEach((e) => {
          const examDate = new Date(e.date);
          if (examDate >= today && examDate < tomorrow) {
            const hours = examDate.getHours().toString().padStart(2, '0');
            const minutes = examDate.getMinutes().toString().padStart(2, '0');
            events.push({ date: e.date, title: e.title, type: 'system', tag: e.tag, time: `${hours}:${minutes}` });
          }
        });
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tasks, systemExams, systemRemindersEnabled]);

  return (
    <div className="pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4">
        {/* Calendar Header */}
        <div className={`rounded-2xl border shadow-sm p-4 mb-4 ${
          theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100' :
          theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-100' :
          'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                theme === 'purple' ? 'bg-purple-200 hover:bg-purple-300 text-purple-700' :
                theme === 'teal' ? 'bg-teal-200 hover:bg-teal-300 text-teal-700' :
                'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className={`font-bold text-lg ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>
              {viewYear}年 {monthNames[viewMonth]}
            </h2>
            <button
              onClick={nextMonth}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                theme === 'purple' ? 'bg-purple-200 hover:bg-purple-300 text-purple-700' :
                theme === 'teal' ? 'bg-teal-200 hover:bg-teal-300 text-teal-700' :
                'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d) => (
              <div key={d} className={`text-center text-xs font-semibold py-1 ${
                theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
              }`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEvents = !!eventMap[key];
              const isToday =
                day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              const isSelected = selectedDate === key;
              const eventCount = eventMap[key]?.length || 0;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? theme === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                        theme === 'teal' ? 'bg-gradient-to-br from-teal-500 to-green-500 text-white' :
                        'bg-gradient-to-br from-gray-600 to-slate-600 text-white'
                      : isToday
                      ? theme === 'purple' ? 'bg-purple-200 text-purple-700' :
                        theme === 'teal' ? 'bg-teal-200 text-teal-700' :
                        'bg-gray-200 text-gray-700'
                      : hasEvents
                      ? theme === 'purple' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' :
                        theme === 'teal' ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' :
                        'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      : theme === 'purple' ? 'text-purple-700 hover:bg-purple-50' :
                        theme === 'teal' ? 'text-teal-700 hover:bg-teal-50' :
                        'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {hasEvents && !isSelected && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(eventCount, 3) }).map((_, di) => (
                        <div
                          key={di}
                          className={`w-1 h-1 rounded-full ${
                            isToday
                              ? theme === 'purple' ? 'bg-purple-500' : theme === 'teal' ? 'bg-teal-500' : 'bg-gray-500'
                              : theme === 'purple' ? 'bg-pink-400' : theme === 'teal' ? 'bg-green-400' : 'bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date events */}
        {selectedDate && (
          <div className={`rounded-2xl border shadow-sm p-4 mb-4 ${
            theme === 'purple' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' :
            theme === 'teal' ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100' :
            'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
          }`}>
            <h3 className="font-bold text-gray-800 text-sm mb-3">
              {selectedDate.replace(/(\d{4})-(\d+)-(\d+)$/, (_, y, m, d) => `${y}年${parseInt(m)}月${parseInt(d)}日`)}的事项
            </h3>
            {selectedEvents.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">这天没有事项</div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/60 rounded-xl p-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        theme === 'purple' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                        theme === 'teal' ? 'bg-gradient-to-br from-cyan-500 to-blue-500' :
                        'bg-gradient-to-br from-slate-600 to-gray-600'
                      }`}
                    >
                      {ev.type === 'system' ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                          <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 text-sm font-medium truncate">{ev.title}</div>
                      {ev.tag && (
                        <span className="text-gray-500 text-xs">{ev.tag}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Today's events timeline */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-3">一天内事项</h3>
          {todayEvents.length === 0 ? (
            <div className={`rounded-2xl border p-6 text-center ${
              theme === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100' :
              theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-100' :
              'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
            }`}>
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-gray-500 text-sm">今天没有待办事项</div>
            </div>
          ) : (
            <div className={`rounded-2xl border p-4 ${
              theme === 'purple' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' :
              theme === 'teal' ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100' :
              'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
            }`}>
              <div className="space-y-4">
                {todayEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Timeline line */}
                    {idx < todayEvents.length - 1 && (
                      <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                        theme === 'purple' ? 'bg-purple-200' :
                        theme === 'teal' ? 'bg-teal-200' :
                        'bg-gray-300'
                      }`} />
                    )}
                    {/* Time dot */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      theme === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      theme === 'teal' ? 'bg-gradient-to-br from-teal-500 to-green-500' :
                      'bg-gradient-to-br from-gray-600 to-slate-600'
                    }`}>
                      <span className="text-white text-xs font-medium">{ev.time}</span>
                    </div>
                    {/* Event content */}
                    <div className="flex-1 bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-800 text-sm font-semibold">{ev.title}</div>
                        {ev.tag && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            theme === 'purple' ? 'bg-purple-100 text-purple-700' :
                            theme === 'teal' ? 'bg-teal-100 text-teal-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {ev.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                          <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {formatDate(ev.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
