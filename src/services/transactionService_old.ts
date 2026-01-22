import { api } from '../config/firebase';
import { Transaction, TransactionFormData, TransactionItem, ApiResponse } from '../types';

export class TransactionService {
  // Get all transactions
  static async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await api.get('/transactions');
      
      return {
        success: true,
        data: response.data,
        message: 'Transactions retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get transactions'
      };
    }
  }

  // Get single transaction with details
  static async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Transaction retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get transaction'
      };
    }
  }

  // Create new transaction
  static async createTransaction(transactionData: TransactionFormData): Promise<ApiResponse<Transaction>> {
    try {
      const response = await api.post('/transactions', transactionData);
      
      return {
        success: true,
        data: response.data,
        message: 'Transaction created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create transaction'
      };
    }
  }

  // Update transaction status
  static async updateTransactionStatus(transactionId: string, status: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.put(`/transactions/${transactionId}/status`, { status });
      
      return {
        success: true,
        message: 'Transaction status updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update transaction status'
      };
    }
  }

  // Process return
  static async processReturn(originalTransactionId: string, returnItems: TransactionItem[], reason?: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await api.post(`/transactions/${originalTransactionId}/return`, {
        items: returnItems,
        reason
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Return processed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to process return'
      };
    }
  }

  // Get transactions by date range
  static async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await api.get(`/transactions/date-range?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Transactions retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get transactions by date range'
      };
    }
  }

  // Get transaction statistics
  static async getTransactionStats(period: 'today' | 'week' | 'month' | 'year'): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(`/transactions/stats?period=${period}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Transaction statistics retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get transaction statistics'
      };
    }
  }

  // Generate transaction number
  static generateTransactionNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `TRX${year}${month}${day}${time}${random}`;
  }

  // Calculate transaction totals
  static calculateTotals(items: TransactionItem[], discount: number = 0, taxRate: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = discount;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = subtotalAfterDiscount * taxRate;
    const total = subtotalAfterDiscount + tax;

    return {
      subtotal,
      tax,
      discount: discountAmount,
      total
    };
  }

  // Subscribe to transactions (for real-time updates compatibility)
  static subscribeToTransactions(callback: (transactions: Transaction[]) => void): () => void {
    // For now, just fetch transactions once
    this.getTransactions().then(result => {
      if (result.success && result.data) {
        callback(result.data);
      }
    });

    // Return unsubscribe function
    return () => {
      // No-op for now
    };
  }

  // Subscribe to transaction changes
  static subscribeToTransaction(transactionId: string, callback: (transaction: Transaction) => void): () => void {
    this.getTransaction(transactionId).then(result => {
      if (result.success && result.data) {
        callback(result.data);
      }
    });

    return () => {
      // No-op for now
    };
  }

  // Get recent transactions
  static async getRecentTransactions(limit: number = 10): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await api.get(`/transactions/recent?limit=${limit}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Recent transactions retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get recent transactions'
      };
    }
  }

  // Create new transaction
  static async createTransaction(
    transactionData: TransactionFormData, 
    createdBy: string
  ): Promise<ApiResponse<Transaction>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const taxRate = storeConfig.getTaxRate();

      // Use Firestore transaction to ensure data consistency
      const result = await runTransaction(db, async (transaction) => {
        const transactionItems: TransactionItem[] = [];
        
        // Validate products and prepare transaction items
        for (const item of transactionData.items) {
          const productResponse = await ProductService.getProduct(item.productId);
          if (!productResponse.success || !productResponse.data) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          const product = productResponse.data;
          
          // Check stock availability
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
          }

          // Calculate item total
          const itemPrice = item.price || product.price;
          const itemDiscount = item.discount || 0;
          const itemTotal = (itemPrice * item.quantity) - itemDiscount;

          transactionItems.push({
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            price: itemPrice,
            discount: itemDiscount,
            total: itemTotal
          });

          // Update product stock
          const productRef = doc(db, 'stores', storeId, 'products', item.productId);
          transaction.update(productRef, {
            stock: product.stock - item.quantity,
            updatedAt: new Date()
          });
        }

        // Calculate transaction totals
        const totals = this.calculateTotals(
          transactionItems, 
          transactionData.discount || 0, 
          taxRate
        );

        // Create transaction document
        const now = new Date();
        const transactionDoc = {
          storeId,
          transactionNumber: this.generateTransactionNumber(),
          type: 'sale' as const,
          status: 'completed' as const,
          items: transactionItems,
          ...totals,
          paymentMethod: transactionData.paymentMethod,
          paymentStatus: 'paid' as const,
          notes: transactionData.notes || '',
          customFields: transactionData.customFields || {},
          customer: transactionData.customer,
          createdAt: now,
          updatedAt: now,
          createdBy
        };

        const transactionRef = await addDoc(this.getTransactionsCollection(storeId), transactionDoc);
        
        return {
          id: transactionRef.id,
          ...transactionDoc
        } as Transaction;
      });

      return {
        success: true,
        data: result,
        message: 'Transaction completed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transaction by ID
  static async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const transactionDoc = await getDoc(doc(db, 'stores', storeId, 'transactions', transactionId));
      
      if (transactionDoc.exists()) {
        const transaction: Transaction = {
          id: transactionDoc.id,
          ...transactionDoc.data()
        } as Transaction;

        return {
          success: true,
          data: transaction
        };
      }

      throw new Error('Transaction not found');
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transactions with filters
  static async getTransactions(
    status?: string, 
    startDate?: Date, 
    endDate?: Date, 
    limitCount: number = 50
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      let q = query(
        this.getTransactionsCollection(storeId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate));
      }

      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate));
      }

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });

      return {
        success: true,
        data: transactions
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get recent transactions
  static async getRecentTransactions(limitCount: number = 10): Promise<ApiResponse<Transaction[]>> {
    return this.getTransactions(undefined, undefined, undefined, limitCount);
  }

  // Cancel transaction
  static async cancelTransaction(transactionId: string): Promise<ApiResponse<void>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      await runTransaction(db, async (transaction) => {
        const transactionRef = doc(db, 'stores', storeId, 'transactions', transactionId);
        const transactionDoc = await transaction.get(transactionRef);
        
        if (!transactionDoc.exists()) {
          throw new Error('Transaction not found');
        }

        const transactionData = transactionDoc.data() as Transaction;
        
        if (transactionData.status === 'cancelled') {
          throw new Error('Transaction already cancelled');
        }

        // Restore product stock
        for (const item of transactionData.items) {
          const productResponse = await ProductService.getProduct(item.productId);
          if (productResponse.success && productResponse.data) {
            const product = productResponse.data;
            const productRef = doc(db, 'stores', storeId, 'products', item.productId);
            transaction.update(productRef, {
              stock: product.stock + item.quantity,
              updatedAt: new Date()
            });
          }
        }

        // Update transaction status
        transaction.update(transactionRef, {
          status: 'cancelled',
          updatedAt: new Date()
        });
      });

      return {
        success: true,
        message: 'Transaction cancelled successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Subscribe to transactions changes
  static subscribeToTransactions(
    callback: (transactions: Transaction[]) => void,
    limitCount: number = 50
  ): () => void {
    const storeId = storeConfig.getStoreId();
    if (!storeId) {
      throw new Error('No active store found');
    }

    const q = query(
      this.getTransactionsCollection(storeId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });
      callback(transactions);
    });
  }

  // Get sales summary for date range
  static async getSalesSummary(startDate: Date, endDate: Date): Promise<ApiResponse<{
    totalRevenue: number;
    totalTransactions: number;
    totalItems: number;
    averageOrderValue: number;
  }>> {
    try {
      const response = await this.getTransactions('completed', startDate, endDate, 1000);
      
      if (!response.success) {
        return {
          success: false,
          error: response.error
        };
      }

      const transactions = response.data || [];
      
      const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
      const totalTransactions = transactions.length;
      const totalItems = transactions.reduce((sum, t) => 
        sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      return {
        success: true,
        data: {
          totalRevenue,
          totalTransactions,
          totalItems,
          averageOrderValue
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}