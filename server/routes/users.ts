import express from 'express';
import { db } from '../index';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all users for current store
router.get('/', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'No store associated with user' });
    }

    const [users] = await db.execute<RowDataPacket[]>(
      `SELECT 
        u.id, u.username, u.email, u.display_name, u.role as global_role,
        u.is_active, u.created_at, u.last_login_at,
        su.role as store_role, su.joined_at
       FROM store_users su
       JOIN users u ON su.user_id = u.id
       WHERE su.store_id = ? AND su.is_active = TRUE
       ORDER BY u.created_at DESC`,
      [storeId]
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      globalRole: user.global_role,
      storeRole: user.store_role,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      joinedAt: user.joined_at
    }));

    res.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get single user
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;

    const [users] = await db.execute<RowDataPacket[]>(
      `SELECT 
        u.id, u.username, u.email, u.display_name, u.role as global_role,
        u.is_active, u.created_at, u.last_login_at,
        su.role as store_role, su.joined_at
       FROM store_users su
       JOIN users u ON su.user_id = u.id
       WHERE u.id = ? AND su.store_id = ?`,
      [id, storeId]
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
        globalRole: user.global_role,
        storeRole: user.store_role,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
        joinedAt: user.joined_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user store role
router.put('/:id/role', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const storeId = req.user.storeId;
    const currentUserId = req.user.userId;

    // Check if current user has permission (owner or admin)
    const [currentUserAccess] = await db.execute<RowDataPacket[]>(
      'SELECT role FROM store_users WHERE user_id = ? AND store_id = ?',
      [currentUserId, storeId]
    );

    if (currentUserAccess.length === 0 || !['owner', 'admin'].includes(currentUserAccess[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validRoles = ['owner', 'admin', 'manager', 'staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Update user store role
    const [result] = await db.execute(
      'UPDATE store_users SET role = ? WHERE user_id = ? AND store_id = ?',
      [role, id, storeId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'User not found in store' });
    }

    res.json({
      success: true,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Remove user from store
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;
    const currentUserId = req.user.userId;

    // Check if current user has permission (owner or admin)
    const [currentUserAccess] = await db.execute<RowDataPacket[]>(
      'SELECT role FROM store_users WHERE user_id = ? AND store_id = ?',
      [currentUserId, storeId]
    );

    if (currentUserAccess.length === 0 || !['owner', 'admin'].includes(currentUserAccess[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Can't remove yourself
    if (id === currentUserId) {
      return res.status(400).json({ error: 'Cannot remove yourself from store' });
    }

    // Deactivate user access to store
    const [result] = await db.execute(
      'UPDATE store_users SET is_active = FALSE WHERE user_id = ? AND store_id = ?',
      [id, storeId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'User not found in store' });
    }

    res.json({
      success: true,
      message: 'User removed from store successfully'
    });

  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({ error: 'Failed to remove user from store' });
  }
});

export default router;