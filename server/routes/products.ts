import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../index';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all products for current store
router.get('/', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'No store associated with user' });
    }

    const [products] = await db.execute<RowDataPacket[]>(
      `SELECT 
        p.*, 
        pc.name as category_name,
        s.name as supplier_name
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.store_id = ? AND p.is_active = TRUE
       ORDER BY p.created_at DESC`,
      [storeId]
    );

    const formattedProducts = products.map(product => ({
      id: product.id,
      storeId: product.store_id,
      name: product.name,
      description: product.description,
      category: product.category_name || 'Uncategorized',
      price: parseFloat(product.price),
      cost: product.cost ? parseFloat(product.cost) : 0,
      sku: product.sku,
      barcode: product.barcode,
      stock: product.stock,
      minStock: product.min_stock,
      maxStock: product.max_stock,
      unitOfMeasure: product.unit_of_measure,
      weight: product.weight ? parseFloat(product.weight) : 0,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      isActive: product.is_active,
      trackInventory: product.track_inventory,
      allowNegativeStock: product.allow_negative_stock,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    res.json({
      success: true,
      data: formattedProducts
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get single product
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;

    const [products] = await db.execute<RowDataPacket[]>(
      `SELECT 
        p.*, 
        pc.name as category_name,
        s.name as supplier_name
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ? AND p.store_id = ?`,
      [id, storeId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    res.json({
      success: true,
      data: {
        id: product.id,
        storeId: product.store_id,
        name: product.name,
        description: product.description,
        category: product.category_name || 'Uncategorized',
        price: parseFloat(product.price),
        cost: product.cost ? parseFloat(product.cost) : 0,
        sku: product.sku,
        barcode: product.barcode,
        stock: product.stock,
        minStock: product.min_stock,
        maxStock: product.max_stock,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Create new product
router.post('/', async (req: any, res) => {
  try {
    const storeId = req.user.storeId;
    const userId = req.user.userId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'No store associated with user' });
    }

    const {
      name, description, category, price, cost, sku, barcode,
      stock, minStock, maxStock, unitOfMeasure, weight, tags
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Check if SKU already exists
    if (sku) {
      const [existingSku] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM products WHERE sku = ? AND store_id = ?',
        [sku, storeId]
      );
      
      if (existingSku.length > 0) {
        return res.status(409).json({ error: 'SKU already exists' });
      }
    }

    // Find or create category
    let categoryId = null;
    if (category) {
      const [categories] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM product_categories WHERE name = ? AND store_id = ?',
        [category, storeId]
      );

      if (categories.length > 0) {
        categoryId = categories[0].id;
      } else {
        // Create new category
        const newCategoryId = uuidv4();
        await db.execute(
          'INSERT INTO product_categories (id, store_id, name, created_at) VALUES (?, ?, ?, NOW())',
          [newCategoryId, storeId, category]
        );
        categoryId = newCategoryId;
      }
    }

    // Create product
    const productId = uuidv4();
    await db.execute(
      `INSERT INTO products (
        id, store_id, category_id, name, description, price, cost, 
        sku, barcode, stock, min_stock, max_stock, unit_of_measure, 
        weight, tags, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        productId, storeId, categoryId, name, description || null, 
        price, cost || 0, sku || null, barcode || null,
        stock || 0, minStock || 0, maxStock || null, 
        unitOfMeasure || 'pcs', weight || 0,
        tags ? JSON.stringify(tags) : '[]', userId
      ]
    );

    // Record initial stock movement if stock > 0
    if (stock && stock > 0) {
      await db.execute(
        `INSERT INTO stock_movements (
          id, product_id, movement_type, quantity, previous_stock, 
          new_stock, notes, created_by, created_at
        ) VALUES (?, ?, 'adjustment', ?, 0, ?, 'Initial stock', ?, NOW())`,
        [uuidv4(), productId, stock, stock, userId]
      );
    }

    res.status(201).json({
      success: true,
      data: {
        id: productId,
        storeId,
        name,
        description,
        category,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : 0,
        sku,
        barcode,
        stock: stock || 0,
        minStock: minStock || 0,
        maxStock,
        isActive: true,
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;
    const userId = req.user.userId;

    const [existingProducts] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ? AND store_id = ?',
      [id, storeId]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingProduct = existingProducts[0];
    const {
      name, description, category, price, cost, sku, barcode,
      stock, minStock, maxStock, isActive
    } = req.body;

    // Handle category
    let categoryId = null;
    if (category) {
      const [categories] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM product_categories WHERE name = ? AND store_id = ?',
        [category, storeId]
      );

      if (categories.length > 0) {
        categoryId = categories[0].id;
      } else {
        const newCategoryId = uuidv4();
        await db.execute(
          'INSERT INTO product_categories (id, store_id, name, created_at) VALUES (?, ?, ?, NOW())',
          [newCategoryId, storeId, category]
        );
        categoryId = newCategoryId;
      }
    }

    // Update product
    await db.execute(
      `UPDATE products SET 
        category_id = ?, name = ?, description = ?, price = ?, cost = ?,
        sku = ?, barcode = ?, stock = ?, min_stock = ?, max_stock = ?,
        is_active = ?, updated_at = NOW()
       WHERE id = ? AND store_id = ?`,
      [
        categoryId, name, description, price, cost || 0,
        sku, barcode, stock || 0, minStock || 0, maxStock,
        isActive !== undefined ? isActive : true, id, storeId
      ]
    );

    // Record stock movement if stock changed
    if (stock !== undefined && stock !== existingProduct.stock) {
      const stockChange = stock - existingProduct.stock;
      await db.execute(
        `INSERT INTO stock_movements (
          id, product_id, movement_type, quantity, previous_stock, 
          new_stock, notes, created_by, created_at
        ) VALUES (?, ?, 'adjustment', ?, ?, ?, 'Stock adjustment', ?, NOW())`,
        [uuidv4(), id, stockChange, existingProduct.stock, stock, userId]
      );
    }

    res.json({
      success: true,
      data: {
        id,
        message: 'Product updated successfully'
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.storeId;

    const [products] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM products WHERE id = ? AND store_id = ?',
      [id, storeId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.execute(
      'UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = ? AND store_id = ?',
      [id, storeId]
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;