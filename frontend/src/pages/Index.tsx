import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import HomeView from '@/components/custom/HomeView';
import CalendarView from '@/components/custom/CalendarView';
import StatsView from '@/components/custom/StatsView';
import SettingsView from '@/components/custom/SettingsView';
import AdminView from '@/components/custom/AdminView';
import type { Task, SystemExam, NavTab, AppSettings } from '@/types';
import { SYSTEM_EXAMS, INITIAL_MANUAL_TASKS } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

// 生成基于用户ID的存储键
const getStorageKey = (key: string, userId: string) => `jimemo_${key}_${userId}`;

function loadTasks(userId: string): Task[] {
  try {
    const raw = localStorage.getItem(getStorageKey('tasks', userId));
    if (raw) return JSON.parse(raw) as Task[];
  } catch {
    // ignore
  }
  return INITIAL_MANUAL_TASKS;
}

function loadSettings(userId: string): AppSettings {
  try {
    const raw = localStorage.getItem(getStorageKey('settings', userId));
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
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'admin';
  const [activeTab, setActiveTab] = useState<NavTab>(isAdmin ? 'admin' : 'home');
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'feedback' | 'announcements'>('users');
  const [tasks, setTasks] = useState<Task[]>(() => user ? loadTasks(user.id) : []);
  const [settings, setSettings] = useState<AppSettings>(() => user ? loadSettings(user.id) : { systemRemindersEnabled: true, pushNotificationsEnabled: true, theme: 'purple' });
  const [systemExams, setSystemExams] = useState<SystemExam[]>(loadExams);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('homework');
  const [addLoading, setAddLoading] = useState(false);

  // 当用户变化时重新加载数据
  useEffect(() => {
    if (user) {
      setTasks(loadTasks(user.id));
      setSettings(loadSettings(user.id));
    }
  }, [user]);

  // 当管理员首次登录时自动切换到管理员界面
  useEffect(() => {
    if (isAdmin && activeTab !== 'admin') {
      setActiveTab('admin');
      setAdminSubTab('users');
    }
  }, [isAdmin]);

  // 保存任务数据
  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey('tasks', user.id), JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // 保存设置数据
  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey('settings', user.id), JSON.stringify(settings));
    }
  }, [settings, user]);

  // 保存考试数据
  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey('exams', user.id), JSON.stringify(systemExams));
    }
  }, [systemExams, user]);

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
        toast.success('已切换为草绿色主题');
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
        tag: newTaskCategory === 'homework' ? '作业' : newTaskCategory === 'exam' ? '考试' : newTaskCategory === 'registration' ? '报名' : newTaskCategory === 'competition' ? '竞赛' : undefined,
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
      <header className={`sticky top-0 z-50 shadow-lg ${settings.theme === 'purple' ? 'bg-gradient-to-r from-purple-600 to-pink-500' : settings.theme === 'teal' ? 'bg-gradient-to-r from-teal-600 to-green-500' : 'bg-gradient-to-r from-gray-700 to-slate-600'}`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-base tracking-tight">计忆·日程</span>
                <span className="text-white/60 text-xs ml-1">学考提醒助手</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${settings.theme === 'purple' ? 'bg-purple-300/20 text-purple-200' : settings.theme === 'teal' ? 'bg-teal-300/20 text-teal-200' : 'bg-gray-300/20 text-gray-200'}`}>
                  {isAdmin ? '管理员' : '用户'}
                </span>
                <span className="text-white/80 text-sm">{user?.username}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  toast.success('已退出登录');
                }}
                className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                退出
              </button>
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
            theme={settings.theme}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            systemExams={systemExams}
            systemRemindersEnabled={settings.systemRemindersEnabled}
            theme={settings.theme}
          />
        )}
        {activeTab === 'stats' && (
          <StatsView
            tasks={tasks}
            systemExams={systemExams}
            systemRemindersEnabled={settings.systemRemindersEnabled}
            theme={settings.theme}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            systemExams={systemExams}
            onUpdateSystemExams={setSystemExams}
            theme={settings.theme}
          />
        )}
        {activeTab === 'admin' && <AdminView initialTab={adminSubTab} theme={settings.theme} />}
      </main>

      {/* Bottom Navigation + FAB */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className={`border-t border-white/20 shadow-xl ${settings.theme === 'purple' ? 'bg-gradient-to-r from-purple-600 to-pink-500' : settings.theme === 'teal' ? 'bg-gradient-to-r from-teal-600 to-green-500' : 'bg-gradient-to-r from-gray-700 to-slate-600'}`}>
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center justify-around h-16 relative">
              {isAdmin ? (
                // Admin navigation items
                <>
                  {/* User Management */}
                  <button
                    aria-label="用户管理"
                    onClick={() => {
                      setActiveTab('admin');
                      setAdminSubTab('users');
                    }}
                    className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                      activeTab === 'admin' && adminSubTab === 'users'
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-115'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className={`text-xs ${activeTab === 'admin' && adminSubTab === 'users' ? 'font-semibold text-white' : 'text-white/80'}`}>用户管理</span>
                  </button>

                  {/* Feedback Management */}
                  <button
                    aria-label="反馈管理"
                    onClick={() => {
                      setActiveTab('admin');
                      setAdminSubTab('feedback');
                    }}
                    className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                      activeTab === 'admin' && adminSubTab === 'feedback'
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-115'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className={`text-xs ${activeTab === 'admin' && adminSubTab === 'feedback' ? 'font-semibold text-white' : 'text-white/80'}`}>反馈管理</span>
                  </button>
                </>
              ) : (
                // Regular user navigation items
                <>
                  {/* Home */}
                  <button
                    aria-label="首页"
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                      activeTab === 'home'
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-115'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={activeTab === 'home' ? 0 : 2} viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    <span className={`text-xs ${activeTab === 'home' ? 'font-semibold text-white' : 'text-white/80'}`}>首页</span>
                  </button>

                  {/* Calendar */}
                  <button
                    aria-label="日历"
                    onClick={() => setActiveTab('calendar')}
                    className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                      activeTab === 'calendar'
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-115'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'calendar' ? 2.5 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-xs ${activeTab === 'calendar' ? 'font-semibold text-white' : 'text-white/80'}`}>日历</span>
                  </button>
                </>
              )}

              {/* FAB - Add Task */}
              <div className="relative -top-5">
                <button
                  aria-label="添加事项"
                  onClick={() => setShowAddModal(true)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-200 ${settings.theme === 'purple' ? 'bg-gradient-to-br from-purple-400 to-pink-400' : settings.theme === 'teal' ? 'bg-gradient-to-br from-teal-400 to-green-400' : 'bg-gradient-to-br from-gray-500 to-slate-500'}`}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {isAdmin ? (
                // Admin navigation items (continued)
                <>
                  {/* Announcement Management */}
                  <button
                    aria-label="公告管理"
                    onClick={() => {
                      setActiveTab('admin');
                      setAdminSubTab('announcements');
                    }}
                    className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                      activeTab === 'admin' && adminSubTab === 'announcements'
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-115'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className={`text-xs ${activeTab === 'admin' && adminSubTab === 'announcements' ? 'font-semibold text-white' : 'text-white/80'}`}>公告管理</span>
                  </button>
                </>
              ) : (
                // Regular user navigation items (continued)
                <>
                  {/* Stats */}
                  <button
                    aria-label="统计"
                    onClick={() => setActiveTab('stats')}
                    className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                      activeTab === 'stats'
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-115'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'stats' ? 2.5 : 2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className={`text-xs ${activeTab === 'stats' ? 'font-semibold text-white' : 'text-white/80'}`}>统计</span>
                  </button>
                </>
              )}

              {/* Settings */}
              <button
                aria-label="设置"
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 rounded-full ${
                  activeTab === 'settings'
                    ? 'text-white bg-white/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-115'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'settings' ? 2.5 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'settings' ? 2.5 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-xs ${activeTab === 'settings' ? 'font-semibold text-white' : 'text-white/80'}`}>设置</span>
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
                    { key: 'competition', label: '竞赛' },
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
    </div>
  );
}
