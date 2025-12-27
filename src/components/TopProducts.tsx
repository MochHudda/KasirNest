import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: string;
  stock: number;
}

const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'Basic White T-Shirt',
    category: 'Men Basics',
    sales: 245,
    revenue: 'Rp 2,450,000',
    stock: 85,
  },
  {
    id: 'P002',
    name: 'Kids Denim Jeans',
    category: 'Kids Wear',
    sales: 198,
    revenue: 'Rp 5,940,000',
    stock: 42,
  },
  {
    id: 'P003',
    name: 'Women Cotton Dress',
    category: 'Women Basics',
    sales: 156,
    revenue: 'Rp 4,680,000',
    stock: 28,
  },
  {
    id: 'P004',
    name: 'Family Pack Socks',
    category: 'Accessories',
    sales: 134,
    revenue: 'Rp 2,010,000',
    stock: 120,
  },
];

export function TopProducts() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Items</h2>
            <p className="text-sm text-gray-500">Best performing apparel this month</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {mockProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="font-medium text-gray-900">{product.sales}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="font-medium text-gray-900">{product.revenue}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Stock</p>
                  <p
                    className={cn(
                      'font-medium',
                      product.stock < 20 ? 'text-red-600' : 'text-gray-900'
                    )}
                  >
                    {product.stock}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}