export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Store {
  id: string;
  name: string;
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
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  required: boolean;
  options?: string[]; // For select type
}

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
  isActive: boolean;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

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

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface Transaction {
  id: string;
  storeId: string;
  transactionNumber: string;
  type: 'sale' | 'return' | 'void';
  status: 'pending' | 'completed' | 'cancelled';
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital' | 'credit';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  customFields?: Record<string, any>;
  customer?: CustomerInfo;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone?: string;
}

export interface TransactionFormData {
  items: {
    productId: string;
    quantity: number;
    price: number;
    discount?: number;
  }[];
  paymentMethod: 'cash' | 'card' | 'digital' | 'credit';
  discount?: number;
  notes?: string;
  customer?: CustomerInfo;
  customFields?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}