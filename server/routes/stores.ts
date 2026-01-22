import express from 'express';
import { db } from '../index';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get store information
router.get('/', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'No store associated with user' });
    }

    const [stores] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM stores WHERE id = ?',
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = stores[0];

    res.json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        description: store.description,
        logoUrl: store.logo_url,
        address: store.address,
        phone: store.phone,
        email: store.email,
        settings: {
          theme: store.theme_settings ? JSON.parse(store.theme_settings) : {},
          features: store.features ? JSON.parse(store.features) : {},
          currency: store.currency,
          taxRate: parseFloat(store.tax_rate),
          customFields: store.custom_fields ? JSON.parse(store.custom_fields) : []
        },
        createdAt: store.created_at,
        updatedAt: store.updated_at
      }
    });

  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to get store information' });
  }
});

// Update store settings
router.put('/settings', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    const userId = req.user.userId;
    
    // Check if user has permission (owner or admin)
    const [userAccess] = await db.execute<RowDataPacket[]>(
      'SELECT role FROM store_users WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (userAccess.length === 0 || !['owner', 'admin'].includes(userAccess[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const {
      name, description, address, phone, email, logoUrl,
      theme, features, currency, taxRate, customFields
    } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (logoUrl !== undefined) {
      updates.push('logo_url = ?');
      values.push(logoUrl);
    }

    if (theme !== undefined) {
      updates.push('theme_settings = ?');
      values.push(JSON.stringify(theme));
    }

    if (features !== undefined) {
      updates.push('features = ?');
      values.push(JSON.stringify(features));
    }

    if (currency !== undefined) {
      updates.push('currency = ?');
      values.push(currency);
    }

    if (taxRate !== undefined) {
      updates.push('tax_rate = ?');
      values.push(taxRate);
    }

    if (customFields !== undefined) {
      updates.push('custom_fields = ?');
      values.push(JSON.stringify(customFields));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = NOW()');
    values.push(storeId);

    await db.execute(
      `UPDATE stores SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Store settings updated successfully'
    });

  } catch (error) {
    console.error('Update store settings error:', error);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

// Get store analytics/dashboard data
router.get('/analytics', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'No store associated with user' });
    }

    // Get today's sales
    const [todaySales] = await db.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as transaction_count,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_transaction_value
       FROM transactions 
       WHERE store_id = ? AND DATE(created_at) = CURDATE() AND status = 'completed'`,
      [storeId]
    );

    // Get this month's sales
    const [monthSales] = await db.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as transaction_count,
        COALESCE(SUM(total), 0) as total_revenue
       FROM transactions 
       WHERE store_id = ? AND MONTH(created_at) = MONTH(CURDATE()) 
       AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'completed'`,
      [storeId]
    );

    // Get total products
    const [productsCount] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total_products FROM products WHERE store_id = ? AND is_active = TRUE',
      [storeId]
    );

    // Get low stock products
    const [lowStockCount] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as low_stock_count FROM products WHERE store_id = ? AND is_active = TRUE AND stock <= min_stock',
      [storeId]
    );

    // Get top selling products
    const [topProducts] = await db.execute<RowDataPacket[]>(
      `SELECT 
        p.name,
        SUM(ti.quantity) as total_sold,
        SUM(ti.total) as total_revenue
       FROM transaction_items ti
       JOIN transactions t ON ti.transaction_id = t.id
       JOIN products p ON ti.product_id = p.id
       WHERE t.store_id = ? AND t.status = 'completed' 
       AND MONTH(t.created_at) = MONTH(CURDATE()) 
       AND YEAR(t.created_at) = YEAR(CURDATE())
       GROUP BY p.id, p.name
       ORDER BY total_sold DESC
       LIMIT 5`,
      [storeId]
    );

    // Get recent transactions
    const [recentTransactions] = await db.execute<RowDataPacket[]>(
      `SELECT 
        id, transaction_number, total, status, payment_method, created_at
       FROM transactions 
       WHERE store_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [storeId]
    );

    res.json({
      success: true,
      data: {
        todayStats: {
          transactionCount: todaySales[0].transaction_count,
          totalRevenue: parseFloat(todaySales[0].total_revenue),
          avgTransactionValue: parseFloat(todaySales[0].avg_transaction_value)
        },
        monthStats: {
          transactionCount: monthSales[0].transaction_count,
          totalRevenue: parseFloat(monthSales[0].total_revenue)
        },
        inventory: {
          totalProducts: productsCount[0].total_products,
          lowStockCount: lowStockCount[0].low_stock_count
        },
        topProducts: topProducts.map(product => ({
          name: product.name,
          totalSold: product.total_sold,
          totalRevenue: parseFloat(product.total_revenue)
        })),
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction.id,
          transactionNumber: transaction.transaction_number,
          total: parseFloat(transaction.total),
          status: transaction.status,
          paymentMethod: transaction.payment_method,
          createdAt: transaction.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Get store analytics error:', error);
    res.status(500).json({ error: 'Failed to get store analytics' });
  }
});

export default router;