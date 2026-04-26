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

const users: User[] = [
  {
    id: 'user-1',
    username: 'user',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
];

router.post('/login', (req, res) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  // Update last login time
  user.lastLoginAt = new Date().toISOString();

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    },
  });
});

router.post('/register', (req, res) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  if (username.length < 3) {
    return res.status(400).json({ success: false, message: '用户名至少3个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: '密码至少6个字符' });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    password: bcrypt.hashSync(password, 10),
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    },
  });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ success: false });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
    return res.json({
      success: true,
      data: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      },
    });
  } catch {
    return res.json({ success: false });
  }
});

export default router;
