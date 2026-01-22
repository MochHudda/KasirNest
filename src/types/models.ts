export interface User {
  id: string; // UUID instead of uid
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: 'admin' | 'manager' | 'staff';
  globalRole?: 'admin' | 'manager' | 'staff';
  storeRole?: 'owner' | 'admin' | 'manager' | 'staff';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  joinedAt?: Date;
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
  categoryId?: string;
  supplierId?: string;
  name: string;
  description?: string;
  category: string; // Category name for display
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  unitOfMeasure?: string;
  weight?: number;
  images?: string[];
  tags?: string[];
  isActive: boolean;
  trackInventory: boolean;
  allowNegativeStock?: boolean;
  wholesalePrice?: number;
  retailPrice?: number;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
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
  unitOfMeasure?: string;
  weight?: number;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface TransactionItem {
  id?: string;
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
  customerId?: string;
  transactionNumber: string;
  type: 'sale' | 'return' | 'adjustment' | 'void';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'voided';
  items?: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'digital' | 'credit' | 'split';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
  amountPaid?: number;
  amountChange?: number;
  amountDue?: number;
  receiptNumber?: string;
  receiptPrinted?: boolean;
  originalTransactionId?: string;
  returnReason?: string;
  notes?: string;
  customFields?: Record<string, any>;
  customer?: CustomerInfo;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
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