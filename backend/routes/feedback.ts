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
    content: '希望增加一个导出功能，可以把事项导出到日历文件中，方便同步到手机日历。',
    contact: '',
    status: 'processed',
    createdAt: '2026-01-15T09:30:00.000Z',
  },
  {
    id: 'fb-2',
    userId: 'user-1',
    username: 'user',
    type: 'error',
    content: '计算机等级考试的报名时间显示错误，应该是3月份，不是4月份。',
    contact: 'user@example.com',
    status: 'processed',
    createdAt: '2026-02-08T14:20:00.000Z',
  },
  {
    id: 'fb-3',
    userId: 'user-1',
    username: 'user',
    type: 'suggestion',
    content: '建议增加考试倒计时推送通知功能，在考试前3天、1天自动提醒用户。',
    contact: '',
    status: 'pending',
    createdAt: '2026-03-12T11:45:00.000Z',
  },
  {
    id: 'fb-4',
    userId: 'user-1',
    username: 'user',
    type: 'error',
    content: '日历视图在手机端显示不完整，部分日期被截断了，影响查看。',
    contact: 'student@university.edu.cn',
    status: 'pending',
    createdAt: '2026-04-05T16:30:00.000Z',
  },
  {
    id: 'fb-5',
    userId: 'user-1',
    username: 'user',
    type: 'suggestion',
    content: '希望增加一个"已完成事项"的归档功能，方便回顾和统计自己的备考进度。',
    contact: '',
    status: 'processed',
    createdAt: '2026-04-18T10:00:00.000Z',
  },
  {
    id: 'fb-6',
    userId: 'user-1',
    username: 'user',
    type: 'error',
    content: '登录页面在输入错误密码后，错误提示信息显示时间太短，来不及看清。',
    contact: '',
    status: 'pending',
    createdAt: '2026-05-02T08:15:00.000Z',
  },
  {
    id: 'fb-7',
    userId: 'user-1',
    username: 'user',
    type: 'suggestion',
    content: '建议增加深色模式，晚上使用时屏幕太亮对眼睛不太好。',
    contact: 'health@student.cn',
    status: 'pending',
    createdAt: '2026-05-10T20:30:00.000Z',
  },
  {
    id: 'fb-8',
    userId: 'user-1',
    username: 'user',
    type: 'suggestion',
    content: '希望可以自定义系统提醒的考试类型，比如我只关注计算机类考试，不想看语言类考试。',
    contact: '',
    status: 'processed',
    createdAt: '2026-05-18T13:00:00.000Z',
  },
  {
    id: 'fb-9',
    userId: 'user-1',
    username: 'user',
    type: 'error',
    content: '竞赛提醒的日期和实际官网日期不一致，蓝桥杯应该是5月25日，系统显示的是5月20日。',
    contact: 'coder@dev.cn',
    status: 'pending',
    createdAt: '2026-05-22T09:45:00.000Z',
  },
  {
    id: 'fb-10',
    userId: 'user-1',
    username: 'user',
    type: 'suggestion',
    content: '建议增加备考资料分享板块，用户可以上传和分享备考笔记、真题等资源。',
    contact: 'share@study.cn',
    status: 'pending',
    createdAt: '2026-05-28T15:20:00.000Z',
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