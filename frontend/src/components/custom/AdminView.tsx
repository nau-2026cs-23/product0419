import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { SystemUser, Feedback, Announcement } from '@/types';

type AdminTab = 'users' | 'feedback' | 'announcements';

interface AdminViewProps {
  initialTab?: AdminTab;
}

export default function AdminView({ initialTab = 'users' }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    isPinned: false,
    isActive: true,
    startTime: '',
    endTime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'users') {
        const res = await fetch('/api/users', { headers });
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } else if (activeTab === 'feedback') {
        const res = await fetch('/api/feedback', { headers });
        const data = await res.json();
        if (data.success) setFeedbacks(data.data);
      } else if (activeTab === 'announcements') {
        const res = await fetch('/api/announcements/all', { headers });
        const data = await res.json();
        if (data.success) setAnnouncements(data.data);
      }
    } catch {
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleUser(user: SystemUser) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${user.id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        toast.success(user.isActive ? '用户已禁用' : '用户已启用');
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('确定要删除这个用户吗？')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('用户已删除');
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  }

  async function handleUpdateFeedbackStatus(feedback: Feedback) {
    const newStatus = feedback.status === 'pending' ? 'processed' : 'pending';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/feedback/${feedback.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(prev => prev.map(f => f.id === feedback.id ? { ...f, status: newStatus } : f));
        toast.success(newStatus === 'processed' ? '已标记为已处理' : '已标记为待处理');
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    }
  }

  function openAnnModal(ann?: Announcement) {
    if (ann) {
      setEditingAnn(ann);
      setAnnForm({
        title: ann.title,
        content: ann.content,
        isPinned: ann.isPinned,
        isActive: ann.isActive,
        startTime: ann.startTime || '',
        endTime: ann.endTime || '',
      });
    } else {
      setEditingAnn(null);
      setAnnForm({ title: '', content: '', isPinned: false, isActive: true, startTime: '', endTime: '' });
    }
    setShowAnnModal(true);
  }

  async function handleSubmitAnn(e: React.FormEvent) {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingAnn ? `/api/announcements/${editingAnn.id}` : '/api/announcements';
      const method = editingAnn ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(annForm),
      });
      const data = await res.json();
      if (data.success) {
        if (editingAnn) {
          setAnnouncements(prev => prev.map(a => a.id === editingAnn.id ? data.data : a));
          toast.success('公告已更新');
        } else {
          setAnnouncements(prev => [data.data, ...prev]);
          toast.success('公告已发布');
        }
        setShowAnnModal(false);
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAnn(id: string) {
    if (!confirm('确定要删除这个公告吗？')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        toast.success('公告已删除');
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  // 当initialTab变化时，更新activeTab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="pb-28">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-secondary rounded-2xl border border-white shadow-sm overflow-hidden mb-4">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="w-8 h-8 animate-spin text-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              <>
                {activeTab === 'users' && (
                  <div className="space-y-3">
                    {users.length === 0 ? (
                      <div className="text-center py-8 text-foreground/60">暂无用户数据</div>
                    ) : (
                      users.map(user => (
                        <div key={user.id} className="bg-white/20 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{user.username}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {user.role === 'admin' ? '管理员' : '用户'}
                              </span>
                            </div>
                            <div className="text-xs text-foreground/60 mt-1">
                              注册时间：{formatDate(user.createdAt)}
                              {user.lastLoginAt && <span className="ml-2">最后登录：{formatDate(user.lastLoginAt)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {user.isActive ? '正常' : '已禁用'}
                            </span>
                            {user.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => handleToggleUser(user)}
                                  className="px-3 py-1 text-xs bg-white/50 text-foreground rounded-lg hover:bg-white/70 transition-colors"
                                >
                                  {user.isActive ? '禁用' : '启用'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  删除
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'feedback' && (
                  <div className="space-y-3">
                    {feedbacks.length === 0 ? (
                      <div className="text-center py-8 text-foreground/60">暂无反馈数据</div>
                    ) : (
                      feedbacks.map(fb => (
                        <div key={fb.id} className="bg-white/20 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${fb.type === 'suggestion' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                {fb.type === 'suggestion' ? '建议' : '错误报告'}
                              </span>
                              <span className="text-xs text-foreground/60">{fb.username}</span>
                              <span className="text-xs text-foreground/60">{formatDate(fb.createdAt)}</span>
                            </div>
                            <button
                              onClick={() => handleUpdateFeedbackStatus(fb)}
                              className={`text-xs px-2 py-0.5 rounded-full ${fb.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                            >
                              {fb.status === 'pending' ? '待处理' : '已处理'}
                            </button>
                          </div>
                          <p className="text-foreground text-sm">{fb.content}</p>
                          {fb.contact && <p className="text-foreground/60 text-xs mt-1">联系方式：{fb.contact}</p>}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'announcements' && (
                  <div>
                    <div className="flex justify-end mb-3">
                      <button
                        onClick={() => openAnnModal()}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/80 transition-colors"
                      >
                        发布公告
                      </button>
                    </div>
                    <div className="space-y-3">
                      {announcements.length === 0 ? (
                        <div className="text-center py-8 text-foreground/60">暂无公告</div>
                      ) : (
                        announcements.map(ann => (
                          <div key={ann.id} className="bg-white/20 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {ann.isPinned && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">置顶</span>}
                                <span className="font-medium text-foreground">{ann.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openAnnModal(ann)}
                                  className="px-3 py-1 text-xs bg-white/50 text-foreground rounded-lg hover:bg-white/70 transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleDeleteAnn(ann.id)}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                            <p className="text-foreground text-sm">{ann.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-foreground/60">
                              <span>创建时间：{formatDate(ann.createdAt)}</span>
                              {ann.startTime && <span>生效时间：{formatDate(ann.startTime)}</span>}
                              {ann.endTime && <span>失效时间：{formatDate(ann.endTime)}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAnnModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAnnModal(false); }}
        >
          <div className="bg-background rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-background px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {editingAnn ? '编辑公告' : '发布公告'}
              </h3>
              <button
                onClick={() => setShowAnnModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitAnn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="请输入公告标题"
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  placeholder="请输入公告内容"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annForm.isPinned}
                    onChange={(e) => setAnnForm({ ...annForm, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">置顶显示</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annForm.isActive}
                    onChange={(e) => setAnnForm({ ...annForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">立即生效</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">生效时间</label>
                  <input
                    type="datetime-local"
                    value={annForm.startTime}
                    onChange={(e) => setAnnForm({ ...annForm, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">失效时间</label>
                  <input
                    type="datetime-local"
                    value={annForm.endTime}
                    onChange={(e) => setAnnForm({ ...annForm, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="flex-1 py-2.5 bg-secondary text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      保存中...
                    </>
                  ) : (
                    editingAnn ? '保存修改' : '发布公告'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
