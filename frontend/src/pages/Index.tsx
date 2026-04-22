import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import HomeView from '@/components/custom/HomeView';
import CalendarView from '@/components/custom/CalendarView';
import StatsView from '@/components/custom/StatsView';
import SettingsView from '@/components/custom/SettingsView';
import type { Task, SystemExam, NavTab, AppSettings } from '@/types';
import { SYSTEM_EXAMS, INITIAL_MANUAL_TASKS } from '@/lib/data';

const STORAGE_KEY_TASKS = 'jimemo_tasks';
const STORAGE_KEY_SETTINGS = 'jimemo_settings';
const STORAGE_KEY_EXAMS = 'jimemo_exams';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (raw) return JSON.parse(raw) as Task[];
  } catch {
    // ignore
  }
  return INITIAL_MANUAL_TASKS;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {
    // ignore
  }
  return { systemRemindersEnabled: true, pushNotificationsEnabled: true, theme: 'purple' };
}

function loadExams(): SystemExam[] {
  // Always use the latest SYSTEM_EXAMS data
  return SYSTEM_EXAMS;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [systemExams, setSystemExams] = useState<SystemExam[]>(loadExams);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('homework');
  const [addLoading, setAddLoading] = useState(false);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Persist exams
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(systemExams));
  }, [systemExams]);

  // Update theme class
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-teal', 'theme-gray');
    // Add the current theme class
    if (settings.theme === 'teal') {
      document.body.classList.add('theme-teal');
    } else if (settings.theme === 'gray') {
      document.body.classList.add('theme-gray');
    }
  }, [settings.theme]);

  function handleToggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  }

  function handleDeleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('事项已删除');
  }

  function handleToggleSystemReminders() {
    const next = !settings.systemRemindersEnabled;
    setSettings((prev) => ({ ...prev, systemRemindersEnabled: next }));
    toast.success(next ? '系统提醒已开启' : '系统提醒已关闭');
  }

  function handleUpdateSettings(partial: Partial<AppSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
    if (partial.systemRemindersEnabled !== undefined) {
      toast.success(partial.systemRemindersEnabled ? '系统提醒已开启' : '系统提醒已关闭');
    }
    if (partial.pushNotificationsEnabled !== undefined) {
      toast.success(partial.pushNotificationsEnabled ? '推送通知已开启' : '推送通知已关闭');
    }
    if (partial.theme !== undefined) {
      if (partial.theme === 'purple') {
        toast.success('已切换为粉紫色主题');
      } else if (partial.theme === 'teal') {
        toast.success('已切换为蓝绿色主题');
      } else if (partial.theme === 'gray') {
        toast.success('已切换为黑白灰主题');
      }
    }
  }

  function handleAddTask() {
    if (!newTaskTitle.trim()) {
      toast.error('请输入事项名称');
      return;
    }
    if (!newTaskDeadline) {
      toast.error('请选择截止时间');
      return;
    }
    setAddLoading(true);
    setTimeout(() => {
      const newTask: Task = {
        id: `manual-${Date.now()}`,
        title: newTaskTitle.trim(),
        deadline: newTaskDeadline,
        source: 'manual',
        category: newTaskCategory,
        status: 'pending',
        tag: newTaskCategory === 'homework' ? '作业' : newTaskCategory === 'exam' ? '考试' : newTaskCategory === 'registration' ? '报名' : undefined,
        isArchived: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      setNewTaskTitle('');
      setNewTaskDeadline('');
      setNewTaskCategory('homework');
      setShowAddModal(false);
      setAddLoading(false);
      toast.success('事项已添加', { description: newTask.title });
    }, 400);
  }

  function handleEditTask(updatedTask: Task) {
    setTasks((prev) => prev.map((task) => task.id === updatedTask.id ? updatedTask : task));
    toast.success('事项已修改', { description: updatedTask.title });
  }

  const pendingCount = tasks.filter((t) => t.status === 'pending' && !t.isArchived).length;

  return (
    <div className="min-h-screen bg-background font-[system-ui]">
      {/* Top Navigation Header */}
      <header className="bg-primary sticky top-0 z-50 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-base tracking-tight">计忆·日程</span>
                <span className="text-white/60 text-xs ml-1">学考提醒助手</span>
              </div>
            </div>


          </div>
        </div>
      </header>

      {/* Page Content */}
      <main>
        {activeTab === 'home' && (
          <HomeView
            tasks={tasks}
            systemExams={settings.systemRemindersEnabled ? systemExams : []}
            systemRemindersEnabled={settings.systemRemindersEnabled}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onToggleSystemReminders={handleToggleSystemReminders}
            onOpenAddTask={() => setShowAddModal(true)}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            systemExams={systemExams}
            systemRemindersEnabled={settings.systemRemindersEnabled}
          />
        )}
        {activeTab === 'stats' && (
          <StatsView
            tasks={tasks}
            systemExams={systemExams}
            systemRemindersEnabled={settings.systemRemindersEnabled}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Bottom Navigation + FAB */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-primary border-t border-white shadow-xl">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center justify-around h-16 relative">
              {/* Home */}
              <button
                aria-label="首页"
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                  activeTab === 'home' 
                    ? 'text-white bg-secondary/30'
                    : 'text-white hover:text-white hover:bg-secondary/20 hover:scale-115'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={activeTab === 'home' ? 0 : 2} viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span className={`text-xs text-white ${activeTab === 'home' ? 'font-semibold' : ''}`}>首页</span>
              </button>

              {/* Calendar */}
              <button
                aria-label="日历"
                onClick={() => setActiveTab('calendar')}
                className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                  activeTab === 'calendar' 
                    ? 'text-white bg-secondary/30'
                    : 'text-white hover:text-white hover:bg-secondary/20 hover:scale-115'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'calendar' ? 2.5 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-xs text-white ${activeTab === 'calendar' ? 'font-semibold' : ''}`}>日历</span>
              </button>

              {/* FAB - Add Task */}
              <div className="relative -top-5">
                <button
                  aria-label="添加事项"
                  onClick={() => setShowAddModal(true)}
                  className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center shadow-xl hover:bg-accent hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <button
                aria-label="统计"
                onClick={() => setActiveTab('stats')}
                className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                  activeTab === 'stats' 
                    ? 'text-white bg-secondary/30'
                    : 'text-white hover:text-white hover:bg-secondary/20 hover:scale-115'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'stats' ? 2.5 : 2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className={`text-xs text-white ${activeTab === 'stats' ? 'font-semibold' : ''}`}>统计</span>
              </button>

              {/* Settings */}
              <button
                aria-label="设置"
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                  activeTab === 'settings' 
                    ? 'text-white bg-secondary/30'
                    : 'text-white hover:text-white hover:bg-secondary/20 hover:scale-115'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'settings' ? 2.5 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'settings' ? 2.5 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-xs text-white ${activeTab === 'settings' ? 'font-semibold' : ''}`}>设置</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-[#ecffe9] rounded-t-3xl w-full max-w-lg p-6 pb-10 shadow-2xl">
            <div className="w-10 h-1 bg-[#94be91] rounded-full mx-auto mb-5" />
            <h3 className="text-black font-bold text-lg mb-4">添加新事项</h3>

            <div className="flex flex-col gap-4">
              {/* Task name */}
              <div>
                <label className="block text-black text-sm font-medium mb-1.5">
                  事项名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  maxLength={30}
                  placeholder="例如：提交操作系统实验报告"
                  autoComplete="off"
                  className="w-full bg-white border border-[#94be91] rounded-xl px-4 py-3 text-black text-sm placeholder:text-[#0a4313]/50 focus:outline-none focus:border-[#81a470] focus:ring-2 focus:ring-[#81a470]/20 transition-all duration-200"
                />
                <div className="text-right text-xs text-[#0a4313] mt-1">{newTaskTitle.length}/30</div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-black text-sm font-medium mb-1.5">事项类型</label>
                <div className="flex gap-2">
                  {([
                    { key: 'homework', label: '作业' },
                    { key: 'exam', label: '考试' },
                    { key: 'registration', label: '报名' },
                    { key: 'other', label: '其他' },
                  ] as { key: Task['category']; label: string }[]).map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setNewTaskCategory(cat.key)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                        newTaskCategory === cat.key
                          ? 'bg-[#81a470] text-white'
                          : 'bg-[#94be91] text-[#0a4313] hover:bg-[#81a470]/50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-black text-sm font-medium mb-1.5">
                  截止时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full bg-white border border-[#94be91] rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:border-[#81a470] focus:ring-2 focus:ring-[#81a470]/20 transition-all duration-200"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleAddTask}
                disabled={addLoading}
                className="w-full bg-[#81a470] text-white font-semibold py-3.5 rounded-xl hover:bg-[#25743a] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {addLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    保存中...
                  </>
                ) : (
                  '保存事项'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <OmniflowBadge />
      <Toaster />
    </div>
  );
}
