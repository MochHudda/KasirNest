-- =====================================================
-- KasirNest MySQL Database Schema
-- Compatible with MySQL 8.4
-- Execute this script in Navicat or MySQL Workbench
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS kasirnest 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE kasirnest;

-- Set SQL mode for strict data validation (MySQL 8.4 compatible)
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =====================================================
-- CORE TABLES (Created first for proper dependencies)
-- =====================================================

-- Users Table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed password
    display_name VARCHAR(255),
    photo_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL,
    
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB;

-- Stores Table
CREATE TABLE stores (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- Settings as JSON for flexibility
    theme_settings JSON DEFAULT ('{"primaryColor":"#2563eb","secondaryColor":"#64748b","fontFamily":"Inter"}'),
    
    features JSON DEFAULT ('{"inventory":true,"reports":true,"multiUser":false,"customFields":false}'),
    
    currency VARCHAR(3) DEFAULT 'USD',
    tax_rate DECIMAL(5,4) DEFAULT 0.1000,
    custom_fields JSON DEFAULT ('[]'),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_stores_name (name)
) ENGINE=InnoDB;

-- Store Users (Many-to-Many Relationship)
CREATE TABLE store_users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_store_user (store_id, user_id),
    INDEX idx_store_users_store_id (store_id),
    INDEX idx_store_users_user_id (user_id),
    INDEX idx_store_users_role (role)
) ENGINE=InnoDB;

-- =====================================================
-- ADDITIONAL SAAS POS TABLES
-- =====================================================
-- Subscription Plans Table (untuk SaaS billing)
CREATE TABLE subscription_plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle ENUM('monthly', 'yearly') NOT NULL,
    max_stores INT DEFAULT 1,
    max_users INT DEFAULT 5,
    max_products INT DEFAULT 1000,
    max_transactions_per_month INT DEFAULT 10000,
    features JSON DEFAULT ('{}'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_plans_active (is_active)
) ENGINE=InnoDB;

-- Store Subscriptions Table
CREATE TABLE store_subscriptions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    plan_id CHAR(36) NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'suspended') DEFAULT 'active',
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    
    INDEX idx_subscriptions_store (store_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_expires (ends_at)
) ENGINE=InnoDB;

-- Suppliers Table (untuk inventory management)
CREATE TABLE suppliers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_number VARCHAR(50),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    INDEX idx_suppliers_store (store_id),
    INDEX idx_suppliers_active (is_active)
) ENGINE=InnoDB;

-- Purchase Orders Table
CREATE TABLE purchase_orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    po_number VARCHAR(50) NOT NULL,
    status ENUM('draft', 'sent', 'confirmed', 'received', 'cancelled') DEFAULT 'draft',
    order_date DATETIME NOT NULL,
    expected_date DATETIME,
    received_date DATETIME,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_store_po_number (store_id, po_number),
    INDEX idx_po_store (store_id),
    INDEX idx_po_status (status)
) ENGINE=InnoDB;

-- Discounts/Promotions Table
CREATE TABLE promotions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed_amount', 'buy_x_get_y') NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    min_purchase DECIMAL(12,2) DEFAULT 0,
    applicable_to ENUM('all_products', 'specific_products', 'categories') DEFAULT 'all_products',
    product_ids JSON DEFAULT ('[]'),
    category_ids JSON DEFAULT ('[]'),
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    INDEX idx_promotions_store (store_id),
    INDEX idx_promotions_active (is_active),
    INDEX idx_promotions_dates (starts_at, ends_at)
) ENGINE=InnoDB;

-- Tax Categories Table (untuk tax management yang lebih baik)
CREATE TABLE tax_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,4) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_store_tax_name (store_id, name),
    INDEX idx_tax_categories_store (store_id)
) ENGINE=InnoDB;

-- Employee Shifts Table (untuk time tracking)
CREATE TABLE employee_shifts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    shift_date DATE NOT NULL,
    clock_in DATETIME NOT NULL,
    clock_out DATETIME NULL,
    break_time INT DEFAULT 0, -- in minutes
    total_hours DECIMAL(4,2) DEFAULT 0,
    hourly_rate DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_shifts_store_date (store_id, shift_date),
    INDEX idx_shifts_user (user_id)
) ENGINE=InnoDB;

-- Audit Logs Table (untuk tracking changes)
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    user_id CHAR(36) NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id CHAR(36) NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_audit_store_table (store_id, table_name),
    INDEX idx_audit_record (table_name, record_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- API Keys Table (untuk integrations)
CREATE TABLE api_keys (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    permissions JSON DEFAULT ('[]'),
    last_used_at DATETIME NULL,
    expires_at DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_api_keys_store (store_id),
    INDEX idx_api_keys_key (api_key)
) ENGINE=InnoDB;

-- Product Categories Table
CREATE TABLE product_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id CHAR(36) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_store_category (store_id, name),
    INDEX idx_categories_store_id (store_id),
    INDEX idx_categories_parent_id (parent_id)
) ENGINE=InnoDB;

-- Customers Table
CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    custom_fields JSON DEFAULT ('{}'),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    INDEX idx_customers_store_id (store_id),
    INDEX idx_customers_email (email),
    INDEX idx_customers_phone (phone)
) ENGINE=InnoDB;

-- Products Table (Enhanced for SaaS POS)
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    category_id CHAR(36) NULL,
    supplier_id CHAR(36) NULL,
    tax_category_id CHAR(36) NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(12,2) NULL CHECK (cost >= 0),
    
    sku VARCHAR(100),
    barcode VARCHAR(100),
    internal_code VARCHAR(100), -- For internal tracking
    
    stock INT DEFAULT 0 CHECK (stock >= 0),
    min_stock INT DEFAULT 0 CHECK (min_stock >= 0),
    max_stock INT NULL, -- Removed problematic CHECK constraint
    
    -- Enhanced inventory fields
    unit_of_measure VARCHAR(20) DEFAULT 'pcs',
    weight DECIMAL(8,3) DEFAULT 0,
    dimensions JSON DEFAULT ('{}'), -- {length, width, height}
    
    images JSON DEFAULT ('[]'), -- Array of image URLs
    tags JSON DEFAULT ('[]'),   -- Array of tags
    
    is_active BOOLEAN DEFAULT TRUE,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_negative_stock BOOLEAN DEFAULT FALSE,
    
    -- Pricing tiers
    wholesale_price DECIMAL(12,2) NULL,
    retail_price DECIMAL(12,2) NULL,
    
    custom_fields JSON DEFAULT ('{}'),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36) NULL,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (tax_category_id) REFERENCES tax_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_products_store_id (store_id),
    INDEX idx_products_category_id (category_id),
    INDEX idx_products_supplier_id (supplier_id),
    INDEX idx_products_is_active (is_active),
    INDEX idx_products_sku (sku),
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_stock_alert (store_id, stock, min_stock)
) ENGINE=InnoDB;

-- Transactions Table (Enhanced for SaaS POS)
CREATE TABLE transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    store_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NULL,
    promotion_id CHAR(36) NULL,
    
    transaction_number VARCHAR(50) NOT NULL,
    type ENUM('sale', 'return', 'adjustment', 'void') DEFAULT 'sale',
    status ENUM('pending', 'completed', 'cancelled', 'refunded', 'voided') DEFAULT 'pending',
    
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    payment_method ENUM('cash', 'card', 'digital', 'credit', 'split') NULL,
    payment_status ENUM('pending', 'paid', 'partial', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Enhanced payment tracking
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_change DECIMAL(12,2) DEFAULT 0,
    amount_due DECIMAL(12,2) DEFAULT 0,
    
    -- Receipt info
    receipt_number VARCHAR(50),
    receipt_printed BOOLEAN DEFAULT FALSE,
    
    -- Return/refund info
    original_transaction_id CHAR(36) NULL,
    return_reason TEXT,
    
    notes TEXT,
    custom_fields JSON DEFAULT ('{}'),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36) NULL,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
    FOREIGN KEY (original_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_store_transaction_number (store_id, transaction_number),
    
    INDEX idx_transactions_store_id (store_id),
    INDEX idx_transactions_customer_id (customer_id),
    INDEX idx_transactions_created_at (created_at),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_receipt (receipt_number)
) ENGINE=InnoDB;

-- Transaction Items Table
CREATE TABLE transaction_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    transaction_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    
    product_name VARCHAR(255) NOT NULL, -- Snapshot of product name
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    discount DECIMAL(12,2) DEFAULT 0 CHECK (discount >= 0),
    total DECIMAL(12,2) NOT NULL CHECK (total >= 0),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    
    INDEX idx_transaction_items_transaction_id (transaction_id),
    INDEX idx_transaction_items_product_id (product_id)
) ENGINE=InnoDB;

-- Stock Movements Table (for inventory tracking)
CREATE TABLE stock_movements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    transaction_id CHAR(36) NULL,
    
    movement_type ENUM('sale', 'purchase', 'adjustment', 'return') NOT NULL,
    quantity INT NOT NULL, -- Positive for inbound, negative for outbound
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36) NULL,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_stock_movements_product_id (product_id),
    INDEX idx_stock_movements_created_at (created_at),
    INDEX idx_stock_movements_type (movement_type)
) ENGINE=InnoDB;

-- Payment Gateway Transactions Table (now after transactions table is created)
CREATE TABLE payment_gateway_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    transaction_id CHAR(36) NOT NULL,
    gateway_name VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_reference VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'success', 'failed', 'cancelled') NOT NULL,
    gateway_response JSON,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    
    INDEX idx_gateway_trans_id (transaction_id),
    INDEX idx_gateway_status (status),
    INDEX idx_gateway_reference (gateway_reference)
) ENGINE=InnoDB;

-- =====================================================
-- SECURITY VIEWS FOR ROLE-BASED ACCESS CONTROL
-- =====================================================

-- User Store Access View (Create only once)
DROP VIEW IF EXISTS user_store_access;
CREATE VIEW user_store_access AS
SELECT 
    su.user_id,
    su.store_id,
    s.name AS store_name,
    su.role,
    su.is_active
FROM store_users su
JOIN stores s ON su.store_id = s.id
WHERE su.is_active = TRUE;

-- User Products View
DROP VIEW IF EXISTS user_products;
CREATE VIEW user_products AS
SELECT 
    p.*,
    usa.user_id,
    usa.role
FROM products p
JOIN user_store_access usa ON p.store_id = usa.store_id
WHERE p.is_active = TRUE;

-- User Transactions View
DROP VIEW IF EXISTS user_transactions;
CREATE VIEW user_transactions AS
SELECT 
    t.*,
    usa.user_id,
    usa.role
FROM transactions t
JOIN user_store_access usa ON t.store_id = usa.store_id;

-- =====================================================
-- FUNCTIONS AND PROCEDURES (Simplified for Navicat)
-- =====================================================

-- Note: Complex functions and procedures removed for better Navicat compatibility
-- These can be added separately after initial schema creation

-- =====================================================
-- TRIGGERS (Simplified for Navicat)
-- =====================================================

-- Note: Complex triggers removed for better Navicat compatibility
-- These can be added separately after initial schema creation

-- =====================================================
-- STORED PROCEDURES (Simplified for Navicat)
-- =====================================================

-- Note: Complex stored procedures removed for better Navicat compatibility
-- These can be added separately after initial schema creation

-- =====================================================
-- REPORTING VIEWS
-- =====================================================

-- Daily Sales Report View
DROP VIEW IF EXISTS daily_sales_report;
CREATE VIEW daily_sales_report AS
SELECT 
    t.store_id,
    s.name AS store_name,
    DATE(t.created_at) AS sale_date,
    COUNT(*) AS transaction_count,
    SUM(t.subtotal) AS total_subtotal,
    SUM(t.tax) AS total_tax,
    SUM(t.discount) AS total_discount,
    SUM(t.total) AS total_sales,
    AVG(t.total) AS avg_transaction_value
FROM transactions t
JOIN stores s ON t.store_id = s.id
WHERE t.status = 'completed'
GROUP BY t.store_id, s.name, DATE(t.created_at);

-- Product Sales Report View
DROP VIEW IF EXISTS product_sales_report;
CREATE VIEW product_sales_report AS
SELECT 
    p.id AS product_id,
    p.store_id,
    p.name AS product_name,
    pc.name AS category_name,
    SUM(ti.quantity) AS total_quantity_sold,
    SUM(ti.total) AS total_revenue,
    AVG(ti.price) AS avg_selling_price,
    COUNT(DISTINCT ti.transaction_id) AS transaction_count
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN transaction_items ti ON p.id = ti.product_id
LEFT JOIN transactions t ON ti.transaction_id = t.id AND t.status = 'completed'
GROUP BY p.id, p.store_id, p.name, pc.name;

-- Low Stock Alert View
DROP VIEW IF EXISTS low_stock_alerts;
CREATE VIEW low_stock_alerts AS
SELECT 
    p.id AS product_id,
    p.store_id,
    s.name AS store_name,
    p.name AS product_name,
    p.sku,
    p.stock AS current_stock,
    p.min_stock,
    (p.min_stock - p.stock) AS stock_deficit
FROM products p
JOIN stores s ON p.store_id = s.id
WHERE p.is_active = TRUE 
AND p.stock <= p.min_stock
ORDER BY stock_deficit DESC;

-- =====================================================
-- ENHANCED SAMPLE DATA FOR SAAS POS
-- =====================================================

-- Insert subscription plans
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, max_stores, max_users, max_products) VALUES
(UUID(), 'Basic', 'Perfect for small businesses', 29.99, 'monthly', 1, 3, 500),
(UUID(), 'Professional', 'Ideal for growing businesses', 79.99, 'monthly', 3, 10, 2000),
(UUID(), 'Enterprise', 'For large businesses', 199.99, 'monthly', 10, 50, 10000);

-- Insert sample user
INSERT INTO users (id, username, email, password, display_name, role) 
VALUES (UUID(), 'admin', 'admin@kasirnest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');

-- Insert sample store
INSERT INTO stores (id, name, description) 
VALUES (UUID(), 'Sample Store', 'A sample store for testing');

-- Subscribe store to basic plan
INSERT INTO store_subscriptions (id, store_id, plan_id, starts_at, ends_at)
SELECT UUID(), s.id, sp.id, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)
FROM stores s, subscription_plans sp
WHERE s.name = 'Sample Store' AND sp.name = 'Basic';

-- Link user to store
INSERT INTO store_users (store_id, user_id, role)
SELECT s.id, u.id, 'owner'
FROM stores s, users u
WHERE s.name = 'Sample Store' AND u.email = 'admin@kasirnest.com';

-- Insert tax categories
INSERT INTO tax_categories (id, store_id, name, rate, description)
SELECT UUID(), s.id, 'Standard VAT', 0.1000, 'Standard VAT rate'
FROM stores s WHERE s.name = 'Sample Store';

INSERT INTO tax_categories (id, store_id, name, rate, description)
SELECT UUID(), s.id, 'Zero VAT', 0.0000, 'Zero VAT rate for exempt items'
FROM stores s WHERE s.name = 'Sample Store';

-- Insert sample supplier
INSERT INTO suppliers (id, store_id, name, contact_person, email, phone, address)
SELECT UUID(), s.id, 'Electronics Supplier Inc', 'John Smith', 'john@supplier.com', '+1234567890', '123 Supplier Street'
FROM stores s WHERE s.name = 'Sample Store';

-- Insert sample category
INSERT INTO product_categories (id, store_id, name, description)
SELECT UUID(), s.id, 'Electronics', 'Electronic products and gadgets'
FROM stores s
WHERE s.name = 'Sample Store';

-- Insert enhanced sample products with supplier and tax category
INSERT INTO products (id, store_id, category_id, supplier_id, tax_category_id, name, description, price, cost, sku, stock, min_stock, unit_of_measure)
SELECT 
    UUID(), 
    s.id, 
    pc.id, 
    sp.id,
    tc.id,
    'Sample Product 1', 
    'This is a sample product for testing', 
    25000.00, 
    20000.00, 
    'SKU001', 
    50, 
    10,
    'pcs'
FROM stores s
JOIN product_categories pc ON s.id = pc.store_id
JOIN suppliers sp ON s.id = sp.store_id
JOIN tax_categories tc ON s.id = tc.store_id
WHERE s.name = 'Sample Store' AND pc.name = 'Electronics' AND tc.name = 'Standard VAT';

-- Insert sample promotion
INSERT INTO promotions (id, store_id, name, description, type, value, starts_at, ends_at)
SELECT UUID(), s.id, '10% Off Electronics', 'Get 10% off all electronics', 'percentage', 10.00, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)
FROM stores s WHERE s.name = 'Sample Store';

-- Insert sample customer
INSERT INTO customers (id, store_id, name, email, phone, address)
SELECT UUID(), s.id, 'John Doe', 'john.doe@example.com', '08123456789', 'Jakarta, Indonesia'
FROM stores s
WHERE s.name = 'Sample Store';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'kasirnest'
ORDER BY table_name;

-- Check all triggers exist (none in simplified version)
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'kasirnest';

-- Check all functions/procedures exist (none in simplified version)
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'kasirnest';

-- Show sample data
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Stores', COUNT(*) FROM stores
UNION ALL
SELECT 'Store Users', COUNT(*) FROM store_users
UNION ALL
SELECT 'Product Categories', COUNT(*) FROM product_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers;

-- =====================================================
-- END OF SCRIPT
-- Database setup completed successfully!
-- =====================================================