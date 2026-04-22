import { useState, useMemo } from 'react';
import type { Task, SystemExam } from '../../types';
import { formatDate, getDaysUntil, isExpired } from '../../lib/data';

interface CalendarViewProps {
  tasks: Task[];
  systemExams: SystemExam[];
  systemRemindersEnabled: boolean;
}

export default function CalendarView({ tasks, systemExams, systemRemindersEnabled }: CalendarViewProps) {
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

  // Upcoming events list (next 30 days)
  const upcomingEvents = useMemo(() => {
    const events: Array<{ date: string; title: string; type: 'task' | 'system'; tag?: string; days: number }> = [];

    tasks
      .filter((t) => t.status === 'pending' && !t.isArchived)
      .forEach((t) => {
        const days = getDaysUntil(t.deadline);
        if (days >= 0 && days <= 30) {
          events.push({ date: t.deadline, title: t.title, type: 'task', tag: t.tag, days });
        }
      });

    if (systemRemindersEnabled) {
      systemExams
        .filter((e) => !isExpired(e.date))
        .forEach((e) => {
          const days = getDaysUntil(e.date);
          if (days >= 0 && days <= 30) {
            events.push({ date: e.date, title: e.title, type: 'system', tag: e.tag, days });
          }
        });
    }

    return events.sort((a, b) => a.days - b.days);
  }, [tasks, systemExams, systemRemindersEnabled]);

  return (
    <div className="pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4">
        {/* Calendar Header */}
        <div className="bg-secondary rounded-2xl border border-white shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-colors"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-bold text-foreground text-lg">
              {viewYear}年 {monthNames[viewMonth]}
            </h2>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-colors"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-foreground text-xs font-semibold py-1">
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
                      ? 'bg-foreground text-white'
                      : isToday
                      ? 'bg-primary text-white'
                      : hasEvents
                      ? 'bg-white/40 text-foreground hover:bg-white/60'
                      : 'text-foreground hover:bg-white/30'
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {hasEvents && !isSelected && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(eventCount, 3) }).map((_, di) => (
                        <div
                          key={di}
                          className={`w-1 h-1 rounded-full ${
                            isToday ? 'bg-white' : 'bg-foreground'
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
          <div className="bg-secondary rounded-2xl border border-white shadow-sm p-4 mb-4">
            <h3 className="font-bold text-foreground text-sm mb-3">
              {selectedDate.replace(/(\d{4})-(\d+)-(\d+)$/, (_, y, m, d) => `${y}年${parseInt(m)}月${parseInt(d)}日`)}的事项
            </h3>
            {selectedEvents.length === 0 ? (
              <div className="text-foreground text-sm text-center py-4">这天没有事项</div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/30 rounded-xl p-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        ev.type === 'system' ? 'bg-blue-50' : 'bg-amber-50'
                      }`}
                    >
                      {ev.type === 'system' ? (
                        <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                          <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground text-sm font-medium truncate">{ev.title}</div>
                      {ev.tag && (
                        <span className="text-foreground text-xs">{ev.tag}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming 30 days */}
        <div>
          <h3 className="font-bold text-foreground text-base mb-3">未来30天事项</h3>
          {upcomingEvents.length === 0 ? (
            <div className="bg-secondary rounded-2xl border border-white p-6 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-foreground text-sm">未来30天没有待办事项</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((ev, idx) => (
                <div key={idx} className="bg-secondary rounded-xl border border-white p-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      ev.days <= 3 ? 'bg-red-100' : ev.days <= 7 ? 'bg-amber-100' : 'bg-blue-50'
                    }`}
                  >
                    <span
                      className={`text-lg font-bold leading-none ${
                        ev.days <= 3 ? 'text-red-500' : ev.days <= 7 ? 'text-amber-500' : 'text-foreground'
                      }`}
                    >
                      {ev.days}
                    </span>
                    <span className="text-foreground text-xs">天</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground text-sm font-semibold truncate">{ev.title}</div>
                    <div className="text-foreground text-xs mt-0.5">{formatDate(ev.date)}</div>
                  </div>
                  {ev.tag && (
                    <span className="bg-white/50 text-foreground text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      {ev.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
