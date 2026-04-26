import { useState } from 'react';
import type { AppSettings } from '../../types';
import { API_BASE_URL } from '../../config/constants';
import { toast } from 'sonner';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export default function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'error'>('suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4">
        {/* Settings Card */}
        <div className="bg-secondary rounded-2xl border border-white shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-white/50">
            <h3 className="font-bold text-foreground text-base">提醒设置</h3>
          </div>
          <div className="divide-y divide-white/30">
            {/* System Reminders Toggle */}
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground text-sm">系统考试提醒</div>
                <div className="text-foreground text-xs mt-0.5">开启后显示所有内置考试事项</div>
              </div>
              <button
                role="switch"
                aria-checked={settings.systemRemindersEnabled}
                onClick={() => onUpdateSettings({ systemRemindersEnabled: !settings.systemRemindersEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  settings.systemRemindersEnabled ? 'bg-foreground' : 'bg-gray-300'
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
                <div className="font-medium text-foreground text-sm">推送通知</div>
                <div className="text-foreground text-xs mt-0.5">考试前3天及当天推送提醒</div>
              </div>
              <button
                role="switch"
                aria-checked={settings.pushNotificationsEnabled}
                onClick={() => onUpdateSettings({ pushNotificationsEnabled: !settings.pushNotificationsEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  settings.pushNotificationsEnabled ? 'bg-foreground' : 'bg-gray-300'
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
        <div className="bg-secondary rounded-2xl border border-white shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-white/50">
            <h3 className="font-bold text-foreground text-base">界面颜色</h3>
          </div>
          <div className="p-4">
            <div className="font-medium text-foreground text-sm mb-3">选择主题颜色</div>
            <div className="flex gap-3">
              <button
                onClick={() => onUpdateSettings({ theme: 'purple' })}
                className={`flex-1 py-3 rounded-xl transition-all duration-200 ${settings.theme === 'purple' ? 'ring-2 ring-foreground' : 'hover:bg-white/20'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className="text-foreground text-xs font-medium">粉紫色</span>
                </div>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'teal' })}
                className={`flex-1 py-3 rounded-xl transition-all duration-200 ${settings.theme === 'teal' ? 'ring-2 ring-foreground' : 'hover:bg-white/20'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className="text-foreground text-xs font-medium">草绿色</span>
                </div>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'gray' })}
                className={`flex-1 py-3 rounded-xl transition-all duration-200 ${settings.theme === 'gray' ? 'ring-2 ring-foreground' : 'hover:bg-white/20'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className="text-foreground text-xs font-medium">黑白灰</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-secondary rounded-2xl border border-white shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-white/50">
            <h3 className="font-bold text-foreground text-base">关于应用</h3>
          </div>
          <div className="divide-y divide-white/30">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground text-sm">应用名称</div>
                <div className="text-foreground text-xs mt-0.5">计忆·日程 — 学考提醒助手</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground text-sm">版本</div>
                <div className="text-foreground text-xs mt-0.5">V1.0.0</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground text-sm">适用群体</div>
                <div className="text-foreground text-xs mt-0.5">计算机相关专业在校大学生</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground text-sm">内置考试数据</div>
                <div className="text-foreground text-xs mt-0.5">四六级、计算机等级、软考等 12 项</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Entry */}
        <div className="bg-secondary rounded-2xl border border-white shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-white/50">
            <h3 className="font-bold text-foreground text-base">帮助与反馈</h3>
          </div>
          <div className="divide-y divide-white/30">
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center justify-between p-4 w-full hover:bg-white/20 transition-colors"
            >
              <div>
                <div className="font-medium text-foreground text-sm">意见反馈</div>
                <div className="text-foreground text-xs mt-0.5">报告错误时间或提交建议</div>
              </div>
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Future Roadmap */}
        <div className="bg-secondary rounded-2xl border border-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-white/50">
            <h3 className="font-bold text-foreground text-base">未来规划</h3>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {
              [
                { version: 'V1.1', desc: '事项分类标签 + 本地数据备份与恢复' },
                { version: 'V1.2', desc: '按考试类别单独订阅 + 桐面倒计时小组件' },
                { version: 'V2.0', desc: '账号体系 + 多端数据同步 + 备考资料推荐' },
              ].map((item) => (
                <div key={item.version} className="flex items-start gap-3">
                  <span className="bg-foreground text-white text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 mt-0.5">
                    {item.version}
                  </span>
                  <span className="text-foreground text-sm">{item.desc}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

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
