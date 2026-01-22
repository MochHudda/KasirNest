import { Store, StoreSettings } from '../types';
import { auth } from './firebase';

// Default store settings
export const defaultStoreSettings: StoreSettings = {
  theme: {
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter'
  },
  features: {
    inventory: true,
    reports: true,
    multiUser: false,
    customFields: false
  },
  currency: 'USD',
  taxRate: 0.1,
  customFields: []
};

// Store configuration that can be loaded from API
export class StoreConfig {
  private static instance: StoreConfig;
  private currentStore: Store | null = null;

  private constructor() {
    // Try to load store from localStorage on initialization
    this.loadFromStorage();
  }

  public static getInstance(): StoreConfig {
    if (!StoreConfig.instance) {
      StoreConfig.instance = new StoreConfig();
    }
    return StoreConfig.instance;
  }

  public setStore(store: Store): void {
    this.currentStore = store;
    this.saveToStorage();
  }

  public getStore(): Store | null {
    return this.currentStore;
  }

  public getStoreId(): string | null {
    return this.currentStore?.id || null;
  }

  public getStoreSettings(): StoreSettings {
    return this.currentStore?.settings || defaultStoreSettings;
  }

  public clearStore(): void {
    this.currentStore = null;
    localStorage.removeItem('current_store');
  }

  private saveToStorage(): void {
    if (this.currentStore) {
      localStorage.setItem('current_store', JSON.stringify(this.currentStore));
    }
  }

  private loadFromStorage(): void {
    try {
      const storedStore = localStorage.getItem('current_store');
      if (storedStore) {
        this.currentStore = JSON.parse(storedStore);
      }
    } catch (error) {
      console.error('Error loading store from storage:', error);
      this.currentStore = null;
    }
  }

  public isFeatureEnabled(feature: keyof StoreSettings['features']): boolean {
    return this.getStoreSettings().features[feature] || false;
  }

  public getPrimaryColor(): string {
    return this.getStoreSettings().theme.primaryColor;
  }

  public getCurrency(): string {
    return this.getStoreSettings().currency;
  }

  public getTaxRate(): number {
    return this.getStoreSettings().taxRate;
  }

  public getCustomFields(): any[] {
    return this.getStoreSettings().customFields || [];
  }

  public reset(): void {
    this.currentStore = null;
  }
}

// Export singleton instance
export const storeConfig = StoreConfig.getInstance();