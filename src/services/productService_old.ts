import { api } from '../config/firebase';
import { Product, ProductFormData, ApiResponse } from '../types';

export class ProductService {
  // Get all products
  static async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get('/products');
      
      return {
        success: true,
        data: response.data,
        message: 'Products retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get products'
      };
    }
  }

  // Get single product
  static async getProduct(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await api.get(`/products/${productId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Product retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get product'
      };
    }
  }

  // Create new product
  static async createProduct(productData: ProductFormData, createdBy?: string): Promise<ApiResponse<Product>> {
    try {
      const response = await api.post('/products', productData);
      
      return {
        success: true,
        data: response.data,
        message: 'Product created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create product'
      };
    }
  }

  // Update product
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
        error: error.message || 'Failed to update product'
      };
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/products/${productId}`);
      
      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete product'
      };
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Search completed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Search failed'
      };
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Products retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get products by category'
      };
    }
  }

  // Get low stock products
  static async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get('/products/low-stock');
      
      return {
        success: true,
        data: response.data,
        message: 'Low stock products retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get low stock products'
      };
    }
  }

  // Update stock
  static async updateStock(productId: string, newStock: number, reason?: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.put(`/products/${productId}/stock`, {
        stock: newStock,
        reason
      });
      
      return {
        success: true,
        message: 'Stock updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update stock'
      };
    }
  }

  // Subscribe to product changes (for real-time updates compatibility)
  static subscribeToProducts(callback: (products: Product[]) => void): () => void {
    // For now, just fetch products once
    // In the future, we could implement WebSocket or polling
    this.getProducts().then(result => {
      if (result.success && result.data) {
        callback(result.data);
      }
    });

    // Return unsubscribe function
    return () => {
      // No-op for now
    };
  }

  // Subscribe to single product changes
  static subscribeToProduct(productId: string, callback: (product: Product) => void): () => void {
    this.getProduct(productId).then(result => {
      if (result.success && result.data) {
        callback(result.data);
      }
    });

    return () => {
      // No-op for now
    };
  }

  // Update existing product
  static async updateProduct(productId: string, updateData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const productRef = doc(db, 'stores', storeId, 'products', productId);
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await updateDoc(productRef, updatePayload);
      
      // Get updated product
      const updatedDoc = await getDoc(productRef);
      if (updatedDoc.exists()) {
        const updatedProduct: Product = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        } as Product;

        return {
          success: true,
          data: updatedProduct,
          message: 'Product updated successfully'
        };
      }

      throw new Error('Product not found after update');
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const productRef = doc(db, 'stores', storeId, 'products', productId);
      await deleteDoc(productRef);

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get single product
  static async getProduct(productId: string): Promise<ApiResponse<Product>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const productDoc = await getDoc(doc(db, 'stores', storeId, 'products', productId));
      
      if (productDoc.exists()) {
        const product: Product = {
          id: productDoc.id,
          ...productDoc.data()
        } as Product;

        return {
          success: true,
          data: product
        };
      }

      throw new Error('Product not found');
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all products for store
  static async getProducts(category?: string, isActive: boolean = true): Promise<ApiResponse<Product[]>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      let q = query(
        this.getProductsCollection(storeId),
        where('isActive', '==', isActive),
        orderBy('name')
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });

      return {
        success: true,
        data: products
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get low stock products
  static async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const q = query(
        this.getProductsCollection(storeId),
        where('isActive', '==', true),
        orderBy('stock')
      );

      const querySnapshot = await getDocs(q);
      const lowStockProducts: Product[] = [];

      querySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() } as Product;
        if (product.minStock && product.stock <= product.minStock) {
          lowStockProducts.push(product);
        }
      });

      return {
        success: true,
        data: lowStockProducts
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update stock
  static async updateStock(productId: string, newStock: number): Promise<ApiResponse<void>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const productRef = doc(db, 'stores', storeId, 'products', productId);
      
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date()
      });

      return {
        success: true,
        message: 'Stock updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Subscribe to products changes
  static subscribeToProducts(callback: (products: Product[]) => void, category?: string): () => void {
    const storeId = storeConfig.getStoreId();
    if (!storeId) {
      throw new Error('No active store found');
    }

    let q = query(
      this.getProductsCollection(storeId),
      where('isActive', '==', true),
      orderBy('name')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    return onSnapshot(q, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });
      callback(products);
    });
  }
}