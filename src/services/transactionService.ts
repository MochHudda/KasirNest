import { api } from '../utils/api';
import { Transaction, TransactionFormData, TransactionItem, ApiResponse } from '../types';
import { storeConfig } from '../config/storeSettings';
import { ProductService } from './productService';

export class TransactionService {
  // Create new transaction
  static async createTransaction(
    transactionData: TransactionFormData
  ): Promise<ApiResponse<Transaction>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      // Calculate transaction totals
      let subtotal = 0;
      let totalItems = 0;
      
      const transactionItems: TransactionItem[] = [];

      for (const item of transactionData.items) {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        const itemDiscount = item.discount || 0;
        const itemTotal = (itemPrice * itemQuantity) - itemDiscount;

        transactionItems.push({
          productId: item.productId,
          productName: item.productName || '',
          quantity: itemQuantity,
          price: itemPrice,
          discount: itemDiscount,
          total: itemTotal
        });

        subtotal += itemTotal;
        totalItems += itemQuantity;
      }

      const discount = transactionData.discount || 0;
      const taxRate = storeConfig.getTaxRate() || 0;
      const discountAmount = Math.min(discount, subtotal);
      const taxableAmount = subtotal - discountAmount;
      const tax = taxableAmount * (taxRate / 100);
      const total = taxableAmount + tax;

      const transactionPayload = {
        storeId,
        type: 'sale',
        status: 'completed',
        items: transactionItems,
        subtotal,
        discount: discountAmount,
        tax,
        total,
        paymentMethod: transactionData.paymentMethod,
        paymentStatus: 'paid',
        notes: transactionData.notes || '',
        customFields: transactionData.customFields || {},
        customer: transactionData.customer
      };

      const response = await api.post('/transactions', transactionPayload);
      return {
        success: true,
        data: response.data,
        message: 'Transaction created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create transaction'
      };
    }
  }

  // Get transaction by ID
  static async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get transaction'
      };
    }
  }

  // Get transactions with filters
  static async getTransactions(
    status?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      const params = new URLSearchParams();
      
      if (status && status !== 'all') {
        params.append('status', status);
      }
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      params.append('limit', limit.toString());

      const response = await api.get(`/transactions?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get transactions'
      };
    }
  }

  // Get recent transactions
  static async getRecentTransactions(limit: number = 10): Promise<ApiResponse<Transaction[]>> {
    return this.getTransactions(undefined, undefined, undefined, limit);
  }

  // Update transaction
  static async updateTransaction(
    transactionId: string, 
    updateData: Partial<TransactionFormData>
  ): Promise<ApiResponse<Transaction>> {
    try {
      const response = await api.put(`/transactions/${transactionId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Transaction updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update transaction'
      };
    }
  }

  // Delete transaction
  static async deleteTransaction(transactionId: string): Promise<ApiResponse<boolean>> {
    try {
      await api.delete(`/transactions/${transactionId}`);
      return {
        success: true,
        data: true,
        message: 'Transaction deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete transaction'
      };
    }
  }

  // Get transaction summary/statistics
  static async getTransactionSummary(): Promise<ApiResponse<{
    totalRevenue: number;
    totalTransactions: number;
    totalItems: number;
    averageOrderValue: number;
  }>> {
    try {
      const response = await api.get('/transactions/summary');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get transaction summary'
      };
    }
  }

  // Subscribe to transactions changes (for real-time updates)
  static subscribeToTransactions(
    callback: (transactions: Transaction[]) => void,
    limitCount: number = 50
  ): (() => void) {
    // For now, we'll poll the API every 5 seconds
    // In a real implementation, you might use WebSocket or SSE
    const interval = setInterval(async () => {
      try {
        const result = await this.getRecentTransactions(limitCount);
        if (result.success && result.data) {
          callback(result.data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        callback([]);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }
}