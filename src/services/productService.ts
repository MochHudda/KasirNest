import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product, ProductFormData, ApiResponse } from '../types';
import { storeConfig } from '../config/storeSettings';

export class ProductService {
  private static getProductsCollection(storeId: string) {
    return collection(db, 'stores', storeId, 'products');
  }

  // Create new product
  static async createProduct(productData: ProductFormData, createdBy: string): Promise<ApiResponse<Product>> {
    try {
      const storeId = storeConfig.getStoreId();
      if (!storeId) {
        throw new Error('No active store found');
      }

      const now = new Date();
      const productDoc = {
        ...productData,
        storeId,
        isActive: true,
        stock: productData.stock || 0,
        createdAt: now,
        updatedAt: now,
        createdBy
      };

      const docRef = await addDoc(this.getProductsCollection(storeId), productDoc);
      
      const newProduct: Product = {
        id: docRef.id,
        ...productDoc
      };

      return {
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
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