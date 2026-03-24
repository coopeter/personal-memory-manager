"use strict";
// 认证路由 - JWT登录
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
exports.authenticateToken = authenticateToken;
exports.requireAdmin = requireAdmin;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const index_1 = require("./index");
exports.authRouter = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '7d';
/**
 * 登录接口
 * POST /api/auth/login
 * { username: string, password: string }
 */
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const user = await index_1.services.storage.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const payload = {
            userId: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET);
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
            },
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * 验证token中间件
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = payload;
        next();
    });
}
/**
 * 需要管理员权限的中间件
 */
function requireAdmin(req, res, next) {
    const user = req.user;
    if (!user.isAdmin) {
        return res.status(403).json({ error: 'Admin required' });
    }
    next();
}
/**
 * 修改密码
 * PUT /api/auth/password
 * { currentPassword: string, newPassword: string }
 */
exports.authRouter.put('/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userPayload = req.user;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }
        const user = await index_1.services.storage.getUser(userPayload.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verify current password
        const passwordMatch = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        // Update password
        const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
        await index_1.services.storage.updateUserPassword(user.id, passwordHash);
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
