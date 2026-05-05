import { useState } from 'react';
import type { AppSettings, SystemExam } from '../../types';
import { API_BASE_URL } from '../../config/constants';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  systemExams: SystemExam[];
  onUpdateSystemExams: (exams: SystemExam[]) => void;
  theme?: 'purple' | 'teal' | 'gray';
}

export default function SettingsView({ settings, onUpdateSettings, systemExams, onUpdateSystemExams, theme = 'purple' }: SettingsViewProps) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'error'>('suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // 管理员编辑系统考试相关状态
  const [showExamEditor, setShowExamEditor] = useState(false);
  const [editingExam, setEditingExam] = useState<SystemExam | null>(null);
  const [examForm, setExamForm] = useState({
    title: '',
    subtitle: '',
    tag: '',
    date: '',
    type: 'exam' as 'exam' | 'registration' | 'competition',
    category: 'skill' as 'language' | 'skill' | 'competition',
    description: '',
    registrationUrl: ''
  });
  const [examFilter, setExamFilter] = useState<'all' | 'exam' | 'competition'>('all');

  async function handleSubmitFeedback() {
    if (!feedbackContent.trim()) {
      toast.error('请填写反馈内容');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          content: feedbackContent,
          contact: feedbackContact,
        }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      if (data.success) {
        toast.success('反馈已提交', { description: '感谢您的建议，我们会尽快处理！' });
        setFeedbackContent('');
        setFeedbackContact('');
        setShowFeedback(false);
      } else {
        toast.error('提交失败', { description: data.message || '请稍后重试' });
      }
    } catch {
      toast.error('网络错误', { description: '请检查网络连接' });
    } finally {
      setSubmitting(false);
    }
  }

  // 管理员编辑考试函数
  function handleEditExam(exam: SystemExam) {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      subtitle: exam.subtitle,
      tag: exam.tag,
      date: exam.date,
      type: exam.type,
      category: exam.category,
      description: exam.description || '',
      registrationUrl: exam.registrationUrl || ''
    });
    setShowExamEditor(true);
  }

  function handleSaveExam() {
    if (!examForm.title.trim()) {
      toast.error('请填写考试名称');
      return;
    }
    if (!examForm.date) {
      toast.error('请选择日期');
      return;
    }

    if (editingExam) {
      // 更新现有考试
      const updatedExams = systemExams.map(e => 
        e.id === editingExam.id 
          ? { ...e, ...examForm, isEnabled: e.isEnabled } 
          : e
      );
      onUpdateSystemExams(updatedExams);
      toast.success('考试信息已更新');
    } else {
      // 创建新考试
      const newExam: SystemExam = {
        id: `sys-${Date.now()}`,
        ...examForm,
        isEnabled: true
      };
      onUpdateSystemExams([...systemExams, newExam]);
      toast.success('考试已添加');
    }
    setShowExamEditor(false);
    setEditingExam(null);
    setExamForm({
      title: '',
      subtitle: '',
      tag: '',
      date: '',
      type: 'exam',
      category: 'skill',
      description: '',
      registrationUrl: ''
    });
  }

  function handleDeleteExam(examId: string) {
    if (confirm('确定要删除这个考试吗？')) {
      onUpdateSystemExams(systemExams.filter(e => e.id !== examId));
      toast.success('考试已删除');
    }
  }

  function handleToggleExamEnabled(exam: SystemExam) {
    const updatedExams = systemExams.map(e => 
      e.id === exam.id 
        ? { ...e, isEnabled: !e.isEnabled } 
        : e
    );
    onUpdateSystemExams(updatedExams);
    toast.success(exam.isEnabled ? '考试已禁用' : '考试已启用');
  }

  function handleAddExam() {
    setEditingExam(null);
    setExamForm({
      title: '',
      subtitle: '',
      tag: '',
      date: '',
      type: 'exam',
      category: 'skill',
      description: '',
      registrationUrl: ''
    });
    setShowExamEditor(true);
  }

  // 过滤后的考试列表
  const filteredExams = systemExams.filter(exam => {
    if (examFilter === 'exam') return exam.category !== 'competition';
    if (examFilter === 'competition') return exam.category === 'competition';
    return true;
  });

  return (
    <div className="pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4">
        {/* Settings Card */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden mb-4 ${
          theme === 'purple' ? 'bg-purple-50 border-purple-100' :
          theme === 'teal' ? 'bg-teal-50 border-teal-100' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className={`p-4 border-b ${
            theme === 'purple' ? 'border-purple-100' :
            theme === 'teal' ? 'border-teal-100' :
            'border-gray-200'
          }`}>
            <h3 className={`font-bold text-base ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>提醒设置</h3>
          </div>
          <div className={`divide-y ${
            theme === 'purple' ? 'divide-purple-100' :
            theme === 'teal' ? 'divide-teal-100' :
            'divide-gray-200'
          }`}>
            {/* System Reminders Toggle */}
            <div className="flex items-center justify-between p-4">
              <div>
                <div className={`font-medium text-sm ${
                  theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                }`}>系统考试提醒</div>
                <div className={`text-xs mt-0.5 ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>开启后显示所有内置考试事项</div>
              </div>
              <button
                role="switch"
                aria-checked={settings.systemRemindersEnabled}
                onClick={() => onUpdateSettings({ systemRemindersEnabled: !settings.systemRemindersEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  settings.systemRemindersEnabled
                    ? theme === 'purple' ? 'bg-purple-500' : theme === 'teal' ? 'bg-teal-500' : 'bg-gray-700'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                    settings.systemRemindersEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between p-4">
              <div>
                <div className={`font-medium text-sm ${
                  theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                }`}>推送通知</div>
                <div className={`text-xs mt-0.5 ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>考试前3天及当天推送提醒</div>
              </div>
              <button
                role="switch"
                aria-checked={settings.pushNotificationsEnabled}
                onClick={() => onUpdateSettings({ pushNotificationsEnabled: !settings.pushNotificationsEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  settings.pushNotificationsEnabled
                    ? theme === 'purple' ? 'bg-purple-500' : theme === 'teal' ? 'bg-teal-500' : 'bg-gray-700'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                    settings.pushNotificationsEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden mb-4 ${
          theme === 'purple' ? 'bg-purple-50 border-purple-100' :
          theme === 'teal' ? 'bg-teal-50 border-teal-100' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className={`p-4 border-b ${
            theme === 'purple' ? 'border-purple-100' :
            theme === 'teal' ? 'border-teal-100' :
            'border-gray-200'
          }`}>
            <h3 className={`font-bold text-base ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>界面颜色</h3>
          </div>
          <div className="p-4">
            <div className={`font-medium text-sm mb-3 ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>选择主题颜色</div>
            <div className="flex gap-3">
              <button
                onClick={() => onUpdateSettings({ theme: 'purple' })}
                className={`flex-1 py-3 rounded-xl transition-all duration-200 ${
                  settings.theme === 'purple'
                    ? theme === 'purple' ? 'ring-2 ring-purple-500' : ''
                    : theme === 'purple' ? 'hover:bg-purple-100' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium ${
                    theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                  }`}>粉紫色</span>
                </div>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'teal' })}
                className={`flex-1 py-3 rounded-xl transition-all duration-200 ${
                  settings.theme === 'teal'
                    ? theme === 'teal' ? 'ring-2 ring-teal-500' : ''
                    : theme === 'teal' ? 'hover:bg-teal-100' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium ${
                    theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                  }`}>草绿色</span>
                </div>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'gray' })}
                className={`flex-1 py-3 rounded-xl transition-all duration-200 ${
                  settings.theme === 'gray'
                    ? 'ring-2 ring-gray-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-slate-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium ${
                    theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                  }`}>黑白灰</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Admin: System Exam Management */}
        {isAdmin && (
          <div className={`rounded-2xl border shadow-sm overflow-hidden mb-4 ${
            theme === 'purple' ? 'bg-purple-50 border-purple-100' :
            theme === 'teal' ? 'bg-teal-50 border-teal-100' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              theme === 'purple' ? 'border-purple-100' :
              theme === 'teal' ? 'border-teal-100' :
              'border-gray-200'
            }`}>
              <h3 className={`font-bold text-base ${
                theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
              }`}>系统内置考试管理</h3>
              <button
                onClick={handleAddExam}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90' :
                  theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white hover:opacity-90' :
                  'bg-gradient-to-r from-gray-600 to-slate-600 text-white hover:opacity-90'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加
              </button>
            </div>
            {/* Filter Tabs */}
            <div className={`flex gap-2 p-4 border-b ${
              theme === 'purple' ? 'border-purple-100' :
              theme === 'teal' ? 'border-teal-100' :
              'border-gray-200'
            }`}>
              <button
                onClick={() => setExamFilter('all')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  examFilter === 'all'
                    ? theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white' :
                      'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
                    : theme === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      theme === 'teal' ? 'bg-teal-100 text-teal-700 hover:bg-teal-200' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部 ({systemExams.length})
              </button>
              <button
                onClick={() => setExamFilter('exam')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  examFilter === 'exam'
                    ? theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white' :
                      'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
                    : theme === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      theme === 'teal' ? 'bg-teal-100 text-teal-700 hover:bg-teal-200' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                考试 ({systemExams.filter(e => e.category !== 'competition').length})
              </button>
              <button
                onClick={() => setExamFilter('competition')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  examFilter === 'competition'
                    ? theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white' :
                      'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
                    : theme === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      theme === 'teal' ? 'bg-teal-100 text-teal-700 hover:bg-teal-200' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                竞赛 ({systemExams.filter(e => e.category === 'competition').length})
              </button>
            </div>
            {/* Exam List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredExams.length === 0 ? (
                <div className={`p-8 text-center text-sm ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>暂无数据</div>
              ) : (
                <div className={`divide-y ${
                  theme === 'purple' ? 'divide-purple-100' :
                  theme === 'teal' ? 'divide-teal-100' :
                  'divide-gray-200'
                }`}>
                  {filteredExams.map((exam) => (
                    <div key={exam.id} className={`p-4 transition-colors ${
                      theme === 'purple' ? 'hover:bg-purple-100' :
                      theme === 'teal' ? 'hover:bg-teal-100' :
                      'hover:bg-gray-100'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              exam.category === 'competition' 
                                ? theme === 'purple' ? 'bg-purple-200 text-purple-700' :
                                  theme === 'teal' ? 'bg-teal-200 text-teal-700' :
                                  'bg-gray-200 text-gray-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {exam.category === 'competition' ? '竞赛' : '考试'}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              exam.type === 'exam' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {exam.type === 'exam' ? '考试' : '报名'}
                            </span>
                            <span className={`text-xs ${
                              theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                            }`}>{exam.tag}</span>
                          </div>
                          <div className={`font-medium text-sm mt-1 ${
                            theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                          }`}>{exam.title}</div>
                          <div className={`text-xs mt-0.5 ${
                            theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                          }`}>{exam.subtitle}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs ${
                              theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                            }`}>📅 {exam.date}</span>
                            <span className={`text-xs ${exam.isEnabled ? 'text-green-500' : 'text-gray-400'}`}>
                              {exam.isEnabled ? '已启用' : '已禁用'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleToggleExamEnabled(exam)}
                            className={`p-2 rounded-lg transition-colors ${
                              exam.isEnabled ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={exam.isEnabled ? '禁用' : '启用'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {exam.isEnabled ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditExam(exam)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'purple' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' :
                              theme === 'teal' ? 'bg-teal-100 text-teal-600 hover:bg-teal-200' :
                              'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            title="编辑"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="删除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Card */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden mb-4 ${
          theme === 'purple' ? 'bg-purple-50 border-purple-100' :
          theme === 'teal' ? 'bg-teal-50 border-teal-100' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className={`p-4 border-b ${
            theme === 'purple' ? 'border-purple-100' :
            theme === 'teal' ? 'border-teal-100' :
            'border-gray-200'
          }`}>
            <h3 className={`font-bold text-base ${
              theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
            }`}>关于应用</h3>
          </div>
          <div className={`divide-y ${
            theme === 'purple' ? 'divide-purple-100' :
            theme === 'teal' ? 'divide-teal-100' :
            'divide-gray-200'
          }`}>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className={`font-medium text-sm ${
                  theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                }`}>应用名称</div>
                <div className={`text-xs mt-0.5 ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>计忆·日程 — 学考提醒助手</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className={`font-medium text-sm ${
                  theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                }`}>版本</div>
                <div className={`text-xs mt-0.5 ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>V1.0.0</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className={`font-medium text-sm ${
                  theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                }`}>适用群体</div>
                <div className={`text-xs mt-0.5 ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>计算机相关专业在校大学生</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className={`font-medium text-sm ${
                  theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                }`}>内置考试数据</div>
                <div className={`text-xs mt-0.5 ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`}>四六级、计算机等级、软考等 12 项</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Entry - Only for non-admin users */}
        {!isAdmin && (
          <div className={`rounded-2xl border shadow-sm overflow-hidden mb-4 ${
            theme === 'purple' ? 'bg-purple-50 border-purple-100' :
            theme === 'teal' ? 'bg-teal-50 border-teal-100' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className={`p-4 border-b ${
              theme === 'purple' ? 'border-purple-100' :
              theme === 'teal' ? 'border-teal-100' :
              'border-gray-200'
            }`}>
              <h3 className={`font-bold text-base ${
                theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
              }`}>帮助与反馈</h3>
            </div>
            <div className={`divide-y ${
              theme === 'purple' ? 'divide-purple-100' :
              theme === 'teal' ? 'divide-teal-100' :
              'divide-gray-200'
            }`}>
              <button
                onClick={() => setShowFeedback(true)}
                className={`flex items-center justify-between p-4 w-full transition-colors ${
                  theme === 'purple' ? 'hover:bg-purple-100' :
                  theme === 'teal' ? 'hover:bg-teal-100' :
                  'hover:bg-gray-100'
                }`}
              >
                <div>
                  <div className={`font-medium text-sm ${
                    theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
                  }`}>意见反馈</div>
                  <div className={`text-xs mt-0.5 ${
                    theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                  }`}>报告错误时间或提交建议</div>
                </div>
                <svg className={`w-5 h-5 ${
                  theme === 'purple' ? 'text-purple-600' : theme === 'teal' ? 'text-teal-600' : 'text-gray-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Future Roadmap - Only for non-admin users */}
        {!isAdmin && (
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${
            theme === 'purple' ? 'bg-purple-50 border-purple-100' :
            theme === 'teal' ? 'bg-teal-50 border-teal-100' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className={`p-4 border-b ${
              theme === 'purple' ? 'border-purple-100' :
              theme === 'teal' ? 'border-teal-100' :
              'border-gray-200'
            }`}>
              <h3 className={`font-bold text-base ${
                theme === 'purple' ? 'text-purple-800' : theme === 'teal' ? 'text-teal-800' : 'text-gray-800'
              }`}>未来规划</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {
                [
                  { version: 'V1.1', desc: '事项分类标签 + 本地数据备份与恢复' },
                  { version: 'V1.2', desc: '按考试类别单独订阅 + 桐面倒计时小组件' },
                  { version: 'V2.0', desc: '账号体系 + 多端数据同步 + 备考资料推荐' },
                ].map((item) => (
                  <div key={item.version} className="flex items-start gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 mt-0.5 ${
                      theme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      theme === 'teal' ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white' :
                      'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
                    }`}>
                      {item.version}
                    </span>
                    <span className={`text-sm ${
                      theme === 'purple' ? 'text-purple-700' : theme === 'teal' ? 'text-teal-700' : 'text-gray-700'
                    }`}>{item.desc}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Exam Editor Modal */}
      {showExamEditor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-background rounded-t-3xl w-full max-w-lg p-6 pb-10 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-foreground rounded-full mx-auto mb-5" />
            <h3 className="text-foreground font-bold text-lg mb-4">{editingExam ? '编辑考试/竞赛' : '添加考试/竞赛'}</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">
                  名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="请输入考试/竞赛名称"
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">副标题</label>
                <input
                  type="text"
                  value={examForm.subtitle}
                  onChange={(e) => setExamForm({ ...examForm, subtitle: e.target.value })}
                  placeholder="请输入副标题（如：主办单位 · 类别）"
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">标签</label>
                <input
                  type="text"
                  value={examForm.tag}
                  onChange={(e) => setExamForm({ ...examForm, tag: e.target.value })}
                  placeholder="如：CET-4、CSP"
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">
                  日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-1.5">类型</label>
                  <select
                    value={examForm.type}
                    onChange={(e) => setExamForm({ ...examForm, type: e.target.value as 'exam' | 'registration' | 'competition' })}
                    className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                  >
                    <option value="exam">考试</option>
                    <option value="registration">报名</option>
                    <option value="competition">竞赛</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground text-sm font-medium mb-1.5">分类</label>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value as 'language' | 'skill' | 'competition' })}
                    className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                  >
                    <option value="language">语言类</option>
                    <option value="skill">技能类</option>
                    <option value="competition">竞赛类</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">描述</label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="请输入考试/竞赛描述（可选）"
                  rows={3}
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">报名链接（可选）</label>
                <input
                  type="url"
                  value={examForm.registrationUrl}
                  onChange={(e) => setExamForm({ ...examForm, registrationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowExamEditor(false);
                    setEditingExam(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-primary text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveExam}
                  className="flex-1 py-3 rounded-xl bg-foreground text-white text-sm font-semibold hover:bg-primary transition-colors"
                >
                  {editingExam ? '保存修改' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-background rounded-t-3xl w-full max-w-lg p-6 pb-10 shadow-2xl">
            <div className="w-10 h-1 bg-foreground rounded-full mx-auto mb-5" />
            <h3 className="text-foreground font-bold text-lg mb-4">意见反馈</h3>

            {/* Type selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFeedbackType('suggestion')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  feedbackType === 'suggestion'
                    ? 'bg-foreground text-white'
                    : 'bg-secondary text-foreground'
                }`}
              >
                功能建议
              </button>
              <button
                onClick={() => setFeedbackType('error')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  feedbackType === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-secondary text-foreground'
                }`}
              >
                错误报告
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">
                  {feedbackType === 'suggestion' ? '建议内容' : '错误描述'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder={feedbackType === 'suggestion' ? '请描述您的建议或想法...' : '请描述错误的考试名称和正确时间...'}
                  rows={4}
                  maxLength={500}
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200 resize-none"
                />
                <div className="text-right text-xs text-foreground mt-1">{feedbackContent.length}/500</div>
              </div>
              <div>
                <label className="block text-foreground text-sm font-medium mb-1.5">联系方式（可选）</label>
                <input
                  type="text"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                  placeholder="邮筱或微信号"
                  className="w-full bg-white border border-primary rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all duration-200"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 py-3 rounded-xl border border-primary text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-foreground text-white text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-60"
                >
                  {submitting ? '提交中...' : '提交反馈'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
