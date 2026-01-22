import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../index';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all transactions
router.get('/', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'No store associated with user' });
    }

    const [transactions] = await db.execute<RowDataPacket[]>(
      `SELECT 
        t.*,
        c.name as customer_name,
        u.display_name as created_by_name
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.store_id = ? 
       ORDER BY t.created_at DESC
       LIMIT 100`,
      [storeId]
    );

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      storeId: transaction.store_id,
      transactionNumber: transaction.transaction_number,
      type: transaction.type,
      status: transaction.status,
      subtotal: parseFloat(transaction.subtotal),
      tax: parseFloat(transaction.tax),
      discount: parseFloat(transaction.discount),
      total: parseFloat(transaction.total),
      paymentMethod: transaction.payment_method,
      paymentStatus: transaction.payment_status,
      customerName: transaction.customer_name,
      createdAt: transaction.created_at,
      createdBy: transaction.created_by_name
    }));

    res.json({
      success: true,
      data: formattedTransactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get transaction details with items
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;

    // Get transaction
    const [transactions] = await db.execute<RowDataPacket[]>(
      `SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.id
       WHERE t.id = ? AND t.store_id = ?`,
      [id, storeId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactions[0];

    // Get transaction items
    const [items] = await db.execute<RowDataPacket[]>(
      `SELECT 
        ti.*,
        p.name as current_product_name,
        p.sku
       FROM transaction_items ti
       LEFT JOIN products p ON ti.product_id = p.id
       WHERE ti.transaction_id = ?`,
      [id]
    );

    const formattedItems = items.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      currentProductName: item.current_product_name,
      sku: item.sku,
      quantity: item.quantity,
      price: parseFloat(item.price),
      discount: parseFloat(item.discount),
      total: parseFloat(item.total)
    }));

    res.json({
      success: true,
      data: {
        id: transaction.id,
        storeId: transaction.store_id,
        transactionNumber: transaction.transaction_number,
        type: transaction.type,
        status: transaction.status,
        subtotal: parseFloat(transaction.subtotal),
        tax: parseFloat(transaction.tax),
        discount: parseFloat(transaction.discount),
        total: parseFloat(transaction.total),
        paymentMethod: transaction.payment_method,
        paymentStatus: transaction.payment_status,
        customer: transaction.customer_name ? {
          name: transaction.customer_name,
          email: transaction.customer_email,
          phone: transaction.customer_phone
        } : null,
        items: formattedItems,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

// Create new transaction
router.post('/', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    const userId = req.user.userId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'No store associated with user' });
    }

    const {
      items, paymentMethod, customerData, discount = 0, taxRate = 0.1
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Transaction items are required' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Generate transaction number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      const transactionNumber = `TRX${year}${month}${day}${time}${random}`;

      // Calculate totals
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const [products] = await connection.execute<RowDataPacket[]>(
          'SELECT * FROM products WHERE id = ? AND store_id = ? AND is_active = TRUE',
          [item.productId, storeId]
        );

        if (products.length === 0) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const product = products[0];

        // Check stock availability
        if (product.track_inventory && !product.allow_negative_stock && product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const itemTotal = item.quantity * (item.price || product.price);
        subtotal += itemTotal;

        validatedItems.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          price: item.price || product.price,
          total: itemTotal,
          product: product
        });
      }

      const discountAmount = discount || 0;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const tax = subtotalAfterDiscount * (taxRate || 0);
      const total = subtotalAfterDiscount + tax;

      // Handle customer
      let customerId = null;
      if (customerData && customerData.name) {
        // Check if customer exists
        const [existingCustomers] = await connection.execute<RowDataPacket[]>(
          'SELECT id FROM customers WHERE email = ? AND store_id = ?',
          [customerData.email, storeId]
        );

        if (existingCustomers.length > 0) {
          customerId = existingCustomers[0].id;
        } else {
          // Create new customer
          customerId = uuidv4();
          await connection.execute(
            'INSERT INTO customers (id, store_id, name, email, phone, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [customerId, storeId, customerData.name, customerData.email, customerData.phone]
          );
        }
      }

      // Create transaction
      const transactionId = uuidv4();
      await connection.execute(
        `INSERT INTO transactions (
          id, store_id, customer_id, transaction_number, type, status,
          subtotal, tax, discount, total, payment_method, payment_status,
          amount_paid, amount_change, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'sale', 'completed', ?, ?, ?, ?, ?, 'paid', ?, 0, ?, NOW(), NOW())`,
        [
          transactionId, storeId, customerId, transactionNumber,
          subtotal, tax, discountAmount, total, paymentMethod, total, userId
        ]
      );

      // Create transaction items and update stock
      for (const item of validatedItems) {
        // Insert transaction item
        await connection.execute(
          `INSERT INTO transaction_items (
            id, transaction_id, product_id, product_name, quantity, price, total, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [uuidv4(), transactionId, item.productId, item.productName, item.quantity, item.price, item.total]
        );

        // Update product stock
        if (item.product.track_inventory) {
          const newStock = item.product.stock - item.quantity;
          await connection.execute(
            'UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?',
            [newStock, item.productId]
          );

          // Record stock movement
          await connection.execute(
            `INSERT INTO stock_movements (
              id, product_id, transaction_id, movement_type, quantity,
              previous_stock, new_stock, created_by, created_at
            ) VALUES (?, ?, ?, 'sale', ?, ?, ?, ?, NOW())`,
            [uuidv4(), item.productId, transactionId, -item.quantity, item.product.stock, newStock, userId]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        data: {
          id: transactionId,
          transactionNumber,
          total,
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: new Date()
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

export default router;