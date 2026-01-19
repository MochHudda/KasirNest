import { StockList } from '../components/StockList';

export default function InventoryPage() {
  const handleEditProduct = (product: any) => {
    console.log('Edit product:', product);
    // Navigate to product edit or show modal
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      console.log('Delete product:', productId);
      // TODO: Call ProductService.deleteProduct
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-sm lg:text-base text-gray-600">Monitor stock levels and manage your inventory.</p>
      </div>

      <StockList
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}