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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Apparel Catalog</h1>
          <p className="text-gray-600">Manage your clothing inventory and product catalog.</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={Plus}>
          Add Apparel Item
        </Button>
      </div>

      {showForm ? (
        <div className="mb-8">
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