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
    content: '系统将于本周六凌晨2:00-6:00进行维护升级，届时可能无法访问，请提前做好事项备份。',
    isPinned: true,
    isActive: true,
    createdAt: '2026-01-08T08:00:00.000Z',
    updatedAt: '2026-01-08T08:00:00.000Z',
  },
  {
    id: 'ann-2',
    title: '英语四六级考试时间确认',
    content: '2026年6月英语四六级考试时间已确定为6月13日，请同学们提前做好备考准备。报名截止时间为3月25日。',
    isPinned: true,
    isActive: true,
    startTime: '2026-01-01T00:00:00.000Z',
    endTime: '2026-06-30T23:59:59.000Z',
    createdAt: '2026-01-12T10:30:00.000Z',
    updatedAt: '2026-01-12T10:30:00.000Z',
  },
  {
    id: 'ann-3',
    title: '蓝桥杯大赛报名提醒',
    content: '第十六届蓝桥杯全国软件和信息技术专业人才大赛报名已开启，报名截止时间为3月20日，省赛时间为5月25日。请有意参赛的同学抓紧时间报名！',
    isPinned: false,
    isActive: true,
    startTime: '2026-02-01T00:00:00.000Z',
    endTime: '2026-03-20T23:59:59.000Z',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
  },
  {
    id: 'ann-4',
    title: '计算机等级考试报名指南',
    content: '2026年上半年全国计算机等级考试报名已开始，考试时间为5月9日。本次考试新增Python语言科目，欢迎同学们报考。',
    isPinned: false,
    isActive: true,
    startTime: '2026-02-20T00:00:00.000Z',
    endTime: '2026-05-10T23:59:59.000Z',
    createdAt: '2026-02-28T14:00:00.000Z',
    updatedAt: '2026-02-28T14:00:00.000Z',
  },
  {
    id: 'ann-5',
    title: '系统新增功能上线',
    content: '本次更新新增了以下功能：1. 系统内置竞赛提醒模块；2. 用户管理功能；3. 公告通知系统；4. 反馈提交入口。欢迎体验并提出宝贵意见！',
    isPinned: false,
    isActive: true,
    createdAt: '2026-03-05T11:00:00.000Z',
    updatedAt: '2026-03-05T11:00:00.000Z',
  },
  {
    id: 'ann-6',
    title: 'ACM程序设计竞赛校赛通知',
    content: '我校将于5月16日举办ACM程序设计竞赛校内选拔赛，选拔优秀选手参加浙江省大学生程序设计竞赛。报名截止时间：4月25日。',
    isPinned: false,
    isActive: true,
    startTime: '2026-03-15T00:00:00.000Z',
    endTime: '2026-05-16T23:59:59.000Z',
    createdAt: '2026-03-20T16:00:00.000Z',
    updatedAt: '2026-03-20T16:00:00.000Z',
  },
  {
    id: 'ann-7',
    title: '软考报名时间提醒',
    content: '2026年上半年软考（计算机技术与软件专业技术资格考试）报名时间为4月11日截止，考试时间为5月23日。中级和高级均可报考。',
    isPinned: false,
    isActive: true,
    startTime: '2026-03-25T00:00:00.000Z',
    endTime: '2026-05-23T23:59:59.000Z',
    createdAt: '2026-04-01T09:30:00.000Z',
    updatedAt: '2026-04-01T09:30:00.000Z',
  },
  {
    id: 'ann-8',
    title: '数学建模竞赛培训通知',
    content: '为备战2026年全国大学生数学建模竞赛，学校将于6月举办系列培训讲座。有意参赛的同学请关注后续通知，三人组队参赛。',
    isPinned: false,
    isActive: true,
    startTime: '2026-04-10T00:00:00.000Z',
    endTime: '2026-09-15T23:59:59.000Z',
    createdAt: '2026-04-15T13:00:00.000Z',
    updatedAt: '2026-04-15T13:00:00.000Z',
  },
  {
    id: 'ann-9',
    title: 'CCF CSP认证考试通知',
    content: 'CCF CSP计算机软件能力认证考试将于5月17日举行，报名截止时间为4月10日。该认证对求职和考研都有重要参考价值。',
    isPinned: false,
    isActive: true,
    startTime: '2026-04-01T00:00:00.000Z',
    endTime: '2026-05-17T23:59:59.000Z',
    createdAt: '2026-04-08T10:00:00.000Z',
    updatedAt: '2026-04-08T10:00:00.000Z',
  },
  {
    id: 'ann-10',
    title: '期末考试安排预告',
    content: '2026年春季学期期末考试预计安排在6月中旬，具体时间以教务处通知为准。请同学们合理安排复习时间，做好备考准备。',
    isPinned: false,
    isActive: true,
    startTime: '2026-05-01T00:00:00.000Z',
    endTime: '2026-07-01T23:59:59.000Z',
    createdAt: '2026-05-05T08:00:00.000Z',
    updatedAt: '2026-05-05T08:00:00.000Z',
  },
  {
    id: 'ann-11',
    title: '系统使用小贴士',
    content: '温馨提示：您可以在设置页面开启或关闭系统提醒功能，也可以切换不同的主题配色。如有任何问题，请通过反馈入口联系我们。',
    isPinned: false,
    isActive: true,
    createdAt: '2026-05-12T15:00:00.000Z',
    updatedAt: '2026-05-12T15:00:00.000Z',
  },
  {
    id: 'ann-12',
    title: '端午节放假安排',
    content: '端午节放假时间为6月10日-12日，共3天。放假期间系统正常运行，但考试安排可能有所调整，请关注教务处通知。',
    isPinned: false,
    isActive: true,
    startTime: '2026-05-20T00:00:00.000Z',
    endTime: '2026-06-15T23:59:59.000Z',
    createdAt: '2026-05-25T11:30:00.000Z',
    updatedAt: '2026-05-25T11:30:00.000Z',
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