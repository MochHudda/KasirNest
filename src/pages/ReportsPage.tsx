import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Dummy data untuk Sales Report
const salesData = [
  { month: 'Jan', sales: 45000000, orders: 324 },
  { month: 'Feb', sales: 52000000, orders: 387 },
  { month: 'Mar', sales: 48000000, orders: 356 },
  { month: 'Apr', sales: 61000000, orders: 428 },
  { month: 'May', sales: 55000000, orders: 392 },
  { month: 'Jun', sales: 67000000, orders: 471 },
  { month: 'Jul', sales: 73000000, orders: 529 },
  { month: 'Aug', sales: 69000000, orders: 495 },
  { month: 'Sep', sales: 58000000, orders: 412 },
  { month: 'Oct', sales: 64000000, orders: 456 },
  { month: 'Nov', sales: 71000000, orders: 508 },
  { month: 'Dec', sales: 82000000, orders: 587 }
];

// Dummy data untuk Category Sales
const categorySales = [
  { name: 'Men Basics', value: 185000000, color: '#3B82F6' },
  { name: 'Women Basics', value: 234000000, color: '#EF4444' },
  { name: 'Kids Wear', value: 156000000, color: '#10B981' },
  { name: 'Baby Wear', value: 89000000, color: '#F59E0B' },
  { name: 'Accessories', value: 78000000, color: '#8B5CF6' },
  { name: 'Footwear', value: 125000000, color: '#F97316' }
];

// Dummy data untuk Top Products
const topProductsData = [
  { name: 'Basic White T-Shirt', sales: 2450000, qty: 245, category: 'Men Basics' },
  { name: 'Kids Denim Jeans', sales: 5940000, qty: 198, category: 'Kids Wear' },
  { name: 'Women Cotton Dress', sales: 4680000, qty: 156, category: 'Women Basics' },
  { name: 'Family Pack Socks', sales: 2010000, qty: 134, category: 'Accessories' },
  { name: 'Baby Onesie Set', sales: 3200000, qty: 128, category: 'Baby Wear' }
];

// Format IDR
const formatIDR = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function ReportsPage() {
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-sm lg:text-base text-gray-600">Comprehensive business insights for your apparel store</p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Button variant="outline" icon={Filter} size="sm" className="sm:size-auto">
              <span className="hidden sm:inline">Filter</span>
              <span className="sm:hidden">Filter</span>
            </Button>
            <Button variant="outline" icon={Download} size="sm" className="sm:size-auto">
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatIDR(totalSales)}</p>
                <p className="text-sm text-green-600 mt-1">+18.5% from last year</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString('id-ID')}</p>
                <p className="text-sm text-green-600 mt-1">+12.3% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatIDR(avgOrderValue)}</p>
                <p className="text-sm text-green-600 mt-1">+5.8% from last month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
                <p className="text-sm text-green-600 mt-1">+23.1% from last month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Monthly Sales Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Monthly Sales Performance</h2>
                <p className="text-xs lg:text-sm text-gray-500">Revenue and order trends throughout the year</p>
              </div>
              <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis 
                    stroke="#6B7280" 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatIDR(value).replace('Rp', 'Rp')}
                  />
                  <Tooltip 
                    formatter={(value: any, name) => [
                      name === 'sales' ? formatIDR(value) : value.toLocaleString('id-ID'),
                      name === 'sales' ? 'Revenue' : 'Orders'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
              <p className="text-sm text-gray-500">Revenue distribution across product categories</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatIDR(value), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
            <p className="text-sm text-gray-500">Best performing items by revenue and quantity</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Quantity Sold</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProductsData.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900">
                      {product.qty.toLocaleString('id-ID')} pcs
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      {formatIDR(product.sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}