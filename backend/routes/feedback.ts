import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'omnitflow-secret-key-2024';

interface Feedback {
  id: string;
  userId: string;
  username: string;
  type: 'suggestion' | 'error';
  content: string;
  contact?: string;
  status: 'pending' | 'processed';
  createdAt: string;
}

const feedbackStore: Feedback[] = [
  {
    id: 'fb-1',
    userId: 'user-1',
    username: 'user',
    type: 'suggestion',
    content: '希望增加一个导出功能，可以把事项导出到日历文件中。',
    contact: '',
    status: 'pending',
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: 'fb-2',
    userId: 'user-1',
    username: 'user',
    type: 'error',
    content: '计算机等级考试的报名时间显示错误，应该是3月份，不是4月份。',
    contact: 'user@example.com',
    status: 'pending',
    createdAt: '2024-01-12T15:30:00.000Z',
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

router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  return res.json({ success: true, data: feedbackStore });
});

router.put('/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: 'pending' | 'processed' };

  const feedback = feedbackStore.find(f => f.id === id);
  if (!feedback) {
    return res.status(404).json({ success: false, message: '反馈不存在' });
  }

  feedback.status = status;
  return res.json({ success: true, data: feedback });
});

router.post('/', (req, res) => {
  const { type, content, contact } = req.body as { type: string; content: string; contact?: string };

  if (!type || !content || content.trim().length === 0) {
    return res.status(400).json({ success: false, message: '请填写反馈内容' });
  }

  const entry = {
    id: `fb-${Date.now()}`,
    userId: 'anonymous',
    username: '匿名用户',
    type: type as 'suggestion' | 'error',
    content: content.trim(),
    contact: contact?.trim(),
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  feedbackStore.push(entry);
  console.log('[Feedback]', entry);

  return res.json({ success: true, data: { id: entry.id } });
});

export default router;
