import { api } from '../utils/api';
import { Product, ProductFormData, ApiResponse } from '../types';
import { storeConfig } from '../config/storeSettings';

export class ProductService {
  // Create new product
  static async createProduct(productData: ProductFormData): Promise<ApiResponse<Product>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const payload = {
        ...productData,
        storeId,
        isActive: true
      };

      const response = await api.post('/products', payload);
      return {
        success: true,
        data: response.data,
        message: 'Product created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create product'
      };
    }
  }

  // Get single product by ID
  static async getProduct(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await api.get(`/products/${productId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get product'
      };
    }
  }

  // Update existing product
  static async updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return {
        success: true,
        data: response.data,
        message: 'Product updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update product'
      };
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<ApiResponse<boolean>> {
    try {
      await api.delete(`/products/${productId}`);
      return {
        success: true,
        data: true,
        message: 'Product deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete product'
      };
    }
  }

  // Get all products with filters
  static async getProducts(category?: string, isActive: boolean = true): Promise<ApiResponse<Product[]>> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      params.append('isActive', isActive.toString());

      const response = await api.get(`/products?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get products'
      };
    }
  }

  // Get products with low stock
  static async getLowStockProducts(threshold: number = 10): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get(`/products?lowStock=true&threshold=${threshold}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get low stock products'
      };
    }
  }

  // Update product stock
  static async updateStock(productId: string, newStock: number): Promise<ApiResponse<Product>> {
    try {
      const response = await api.put(`/products/${productId}`, { stock: newStock });
      return {
        success: true,
        data: response.data,
        message: 'Stock updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update stock'
      };
    }
  }

  // Search products
  static async searchProducts(searchTerm: string): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get(`/products?search=${encodeURIComponent(searchTerm)}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to search products'
      };
    }
  }

  // Subscribe to products changes (polling implementation)
  static subscribeToProducts(
    callback: (products: Product[]) => void,
    category?: string
  ): (() => void) {
    const interval = setInterval(async () => {
      try {
        const result = await this.getProducts(category);
        if (result.success && result.data) {
          callback(result.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        callback([]);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }
}