import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, generateToken } from '../index';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName, role = 'staff' } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    await db.execute(
      `INSERT INTO users (id, username, email, password, display_name, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, username, email, hashedPassword, displayName || username, role]
    );

    // Generate token
    const token = generateToken(userId);

    // Return user data (without password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          username,
          email,
          displayName: displayName || username,
          role,
          emailVerified: false,
          createdAt: new Date(),
          lastLoginAt: new Date()
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const [users] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login time
    await db.execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // Check user's stores
    const [storeAccess] = await db.execute<RowDataPacket[]>(
      `SELECT s.id, s.name, su.role 
       FROM store_users su 
       JOIN stores s ON su.store_id = s.id 
       WHERE su.user_id = ? AND su.is_active = TRUE 
       ORDER BY su.role ASC
       LIMIT 1`,
      [user.id]
    );

    const storeId = storeAccess.length > 0 ? storeAccess[0].id : null;
    const token = generateToken(user.id, storeId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          lastLoginAt: new Date()
        },
        token,
        store: storeAccess.length > 0 ? {
          id: storeAccess[0].id,
          name: storeAccess[0].name,
          role: storeAccess[0].role
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await db.execute<RowDataPacket[]>(
      'SELECT id, username, email, display_name, role, email_verified, created_at, last_login_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Logout (client-side token removal, but we can blacklist tokens later)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;