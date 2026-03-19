// 认证路由 - JWT登录

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { services } from './index';
import type { JWTPayload } from '../core/types';

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * 登录接口
 * POST /api/auth/login
 * { username: string, password: string }
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await services.storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 验证token中间件
 */
export function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    (req as any).user = payload as JWTPayload;
    next();
  });
}

/**
 * 需要管理员权限的中间件
 */
export function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
}
