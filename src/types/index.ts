export * from './models';

// Core User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Store Types  
export interface Store {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  owners: string[]; // User UIDs
  settings: StoreSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  features: {
    inventory: boolean;
    reports: boolean;
    multiUser: boolean;
    customFields: boolean;
  };
  currency: string;
  taxRate: number;
  customFields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  required: boolean;
  options?: string[]; // For select type
}

// Product Types
export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  minStock?: number;
  maxStock?: number;
  images?: string[];
  tags?: string[];
  isActive: boolean;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User UID
}

export interface ProductCategory {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  storeId: string;
  transactionNumber: string;
  type: 'sale' | 'return' | 'adjustment';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital' | 'credit';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed';
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User UID
  customer?: Customer;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Report Types
export interface SalesReport {
  id: string;
  storeId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalSales: number;
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    quantity: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: Date;
    sales: number;
    revenue: number;
  }>;
  generatedAt: Date;
  generatedBy: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface ProductFormData {
  name: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  minStock?: number;
  maxStock?: number;
  customFields?: Record<string, any>;
}

export interface TransactionFormData {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  paymentMethod: 'cash' | 'card' | 'digital' | 'credit';
  discount?: number;
  notes?: string;
  customer?: Customer;
  customFields?: Record<string, any>;
}