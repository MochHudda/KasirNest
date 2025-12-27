import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProductService } from '../../services/productService';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Search, Package, AlertTriangle, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StockListProps {
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export function StockList({ onEditProduct, onDeleteProduct }: StockListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [category, showLowStock]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (showLowStock) {
        response = await ProductService.getLowStockProducts();
      } else {
        response = await ProductService.getProducts(category || undefined);
      }

      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError(response.error || 'Failed to load products');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const response = await ProductService.updateStock(productId, newStock);
      if (response.success) {
        loadProducts(); // Refresh the list
      } else {
        setError(response.error || 'Failed to update stock');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update stock');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStockStatus = (product: Product) => {
    if (product.minStock && product.stock <= product.minStock) {
      return 'low';
    } else if (product.maxStock && product.stock >= product.maxStock) {
      return 'high';
    }
    return 'normal';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibent text-gray-900">Apparel Stock Management</h2>
            <p className="text-sm text-gray-500">Monitor clothing inventory and stock levels</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showLowStock ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowLowStock(!showLowStock)}
              icon={AlertTriangle}
            >
              Low Stock
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="Men Basics">Men Basics</option>
            <option value="Women Basics">Women Basics</option>
            <option value="Kids Wear">Kids Wear</option>
            <option value="Baby Wear">Baby Wear</option>
            <option value="Accessories">Accessories</option>
            <option value="Footwear">Footwear</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No products found</p>
            <p className="text-sm text-gray-400">
              {showLowStock ? 'No products with low stock' : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      stockStatus === 'low' ? 'bg-red-100' : 
                      stockStatus === 'high' ? 'bg-yellow-100' : 'bg-green-100'
                    )}>
                      <Package className={cn(
                        'w-6 h-6',
                        stockStatus === 'low' ? 'text-red-600' : 
                        stockStatus === 'high' ? 'text-yellow-600' : 'text-green-600'
                      )} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{product.category}</span>
                        {product.sku && <span>SKU: {product.sku}</span>}
                        <span>{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Stock Management */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockUpdate(product.id, Math.max(0, product.stock - 1))}
                        disabled={product.stock <= 0}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className={cn(
                        'px-3 py-1 rounded font-medium text-sm',
                        stockStatus === 'low' ? 'bg-red-100 text-red-700' :
                        stockStatus === 'high' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'
                      )}>
                        {product.stock}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockUpdate(product.id, product.stock + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Stock Status Info */}
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {product.minStock && `Min: ${product.minStock}`}
                        {product.minStock && product.maxStock && ' | '}
                        {product.maxStock && `Max: ${product.maxStock}`}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {onEditProduct && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                          className="w-8 h-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {onDeleteProduct && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteProduct(product.id)}
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}