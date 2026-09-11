import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'historicalplaces_dbms_secret_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { fullName, email, password, phone, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const db = await getDb();

    // Check if email already exists
    const existingUser = await db.get('SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userRole = role === 'admin' ? 'admin' : 'traveler';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.trim())}&background=4f46e5&color=fff&bold=true`;

    const result = await db.run(
      `INSERT INTO users (full_name, email, password_hash, phone, role, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName.trim(), email.trim().toLowerCase(), passwordHash, phone || null, userRole, avatar]
    );

    const newUserId = result.lastID;
    const userRecord = await db.get(
      'SELECT user_id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE user_id = ?',
      [newUserId]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: userRecord.user_id,
        email: userRecord.email,
        role: userRecord.role,
        fullName: userRecord.full_name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        userId: userRecord.user_id,
        fullName: userRecord.full_name,
        email: userRecord.email,
        phone: userRecord.phone,
        role: userRecord.role,
        avatarUrl: userRecord.avatar_url,
        createdAt: userRecord.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: error.message
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has a password_hash
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    } else {
      // For legacy seed users without password hash, allow password matching 'password123' or any password for demo
      if (password !== 'password123' && password !== 'admin123') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. (For demo seed users, password is password123)'
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        fullName: user.full_name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getProfile(req, res) {
  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT user_id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
}

/**
 * Update current user profile
 * PUT /api/auth/me
 */
export async function updateProfile(req, res) {
  try {
    const { fullName, phone, avatarUrl } = req.body;
    const db = await getDb();

    await db.run(
      `UPDATE users
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           avatar_url = COALESCE(?, avatar_url)
       WHERE user_id = ?`,
      [fullName, phone, avatarUrl, req.user.userId]
    );

    const updatedUser = await db.get(
      'SELECT user_id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        userId: updatedUser.user_id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatar_url,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
}
