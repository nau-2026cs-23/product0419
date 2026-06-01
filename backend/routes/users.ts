import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'omnitflow-secret-key-2024';

interface User {
  id: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string; role: string };
    }
  }
}

const users: User[] = [
  {
    id: 'user-1',
    username: 'user',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'admin-1',
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'user-disabled',
    username: 'disabled_user',
    password: bcrypt.hashSync('disabled123', 10),
    role: 'user',
    isActive: false,
    createdAt: '2024-01-10T08:00:00.000Z',
    lastLoginAt: '2024-01-15T10:30:00.000Z',
  },
];

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
  const userList = users
    .filter(u => u.role !== 'admin')
    .map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }));
  return res.json({ success: true, data: userList });
});

router.put('/:id/toggle', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: '无法禁用管理员账户' });
  }

  user.isActive = !user.isActive;
  return res.json({ success: true, data: user });
});

router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  const user = users[userIndex];
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: '无法删除管理员账户' });
  }

  users.splice(userIndex, 1);
  return res.json({ success: true, message: '用户已删除' });
});

export default router;
