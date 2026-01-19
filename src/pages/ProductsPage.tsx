import { useState } from 'react';
import { ProductForm } from '../components/ProductForm';
import { StockList } from '../components/StockList';
import { Button } from '../components/ui/Button';
import { Product } from '../types';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = (product: any) => {
    console.log('Product saved:', product);
    setShowForm(false);
    setEditingProduct(null);
    // Refresh product list
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      // TODO: Call ProductService.deleteProduct
      console.log('Delete product:', productId);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Apparel Catalog</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage your clothing inventory and product catalog.</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={Plus} className="self-start sm:self-auto">
          <span className="hidden sm:inline">Add Apparel Item</span>
          <span className="sm:hidden">Add Item</span>
        </Button>
      </div>

      {showForm ? (
        <div className="mb-6 lg:mb-8">
          <ProductForm
            productId={editingProduct?.id}
            initialData={editingProduct ? {
              name: editingProduct.name,
              description: editingProduct.description,
              category: editingProduct.category,
              price: editingProduct.price,
              cost: editingProduct.cost,
              sku: editingProduct.sku,
              barcode: editingProduct.barcode,
              stock: editingProduct.stock,
              minStock: editingProduct.minStock,
              maxStock: editingProduct.maxStock,
            } : undefined}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      ) : (
        <StockList
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
    </div>
  );
}