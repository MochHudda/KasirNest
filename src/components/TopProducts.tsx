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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">Top Selling Items</h2>
            <p className="text-xs lg:text-sm text-gray-500">Best performing apparel this month</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 self-start sm:self-auto">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 lg:space-y-4">
          {mockProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 lg:p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-semibold text-sm lg:text-base">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">{product.name}</h4>
                  <p className="text-xs lg:text-sm text-gray-500">{product.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:gap-8">
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-gray-500">Sales</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{product.sales}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs lg:text-sm text-gray-500">Revenue</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{product.revenue}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-gray-500">Stock</p>
                  <p
                    className={cn(
                      'font-medium text-sm lg:text-base',
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