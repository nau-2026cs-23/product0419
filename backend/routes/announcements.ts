import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'omnitflow-secret-key-2024';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

const announcementStore: Announcement[] = [
  {
    id: 'ann-1',
    title: '系统维护通知',
    content: '系统将于本周六凌晨2:00-6:00进行维护，届时可能无法访问，请谅解。',
    isPinned: true,
    isActive: true,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'ann-2',
    title: '英语四六级考试时间确认',
    content: '2024年6月英语四六级考试时间已确定，请同学们做好准备。',
    isPinned: false,
    isActive: true,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-06-30T23:59:59.000Z',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z',
  },
];

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string; role: string };
    }
  }
}

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: '无效的令牌' });
  }
}

function adminMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
}

router.get('/', (req, res) => {
  const now = new Date();
  const activeAnnouncements = announcementStore.filter(a => {
    if (!a.isActive) return false;
    if (a.startTime && new Date(a.startTime) > now) return false;
    if (a.endTime && new Date(a.endTime) < now) return false;
    return true;
  });
  activeAnnouncements.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return res.json({ success: true, data: activeAnnouncements });
});

router.get('/all', authMiddleware, adminMiddleware, (req, res) => {
  const allAnnouncements = [...announcementStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({ success: true, data: allAnnouncements });
});

router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { title, content, isPinned, isActive, startTime, endTime } = req.body as {
    title: string;
    content: string;
    isPinned?: boolean;
    isActive?: boolean;
    startTime?: string;
    endTime?: string;
  };

  if (!title || !content) {
    return res.status(400).json({ success: false, message: '请填写标题和内容' });
  }

  const announcement: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    isPinned: isPinned || false,
    isActive: isActive !== false,
    startTime,
    endTime,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  announcementStore.push(announcement);
  return res.json({ success: true, data: announcement });
});

router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, content, isPinned, isActive, startTime, endTime } = req.body as {
    title?: string;
    content?: string;
    isPinned?: boolean;
    isActive?: boolean;
    startTime?: string;
    endTime?: string;
  };

  const announcement = announcementStore.find(a => a.id === id);
  if (!announcement) {
    return res.status(404).json({ success: false, message: '公告不存在' });
  }

  if (title !== undefined) announcement.title = title;
  if (content !== undefined) announcement.content = content;
  if (isPinned !== undefined) announcement.isPinned = isPinned;
  if (isActive !== undefined) announcement.isActive = isActive;
  if (startTime !== undefined) announcement.startTime = startTime;
  if (endTime !== undefined) announcement.endTime = endTime;
  announcement.updatedAt = new Date().toISOString();

  return res.json({ success: true, data: announcement });
});

router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const index = announcementStore.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '公告不存在' });
  }

  announcementStore.splice(index, 1);
  return res.json({ success: true, message: '公告已删除' });
});

export default router;
