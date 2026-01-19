import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from './ui/Card';

const salesData = [
  { name: 'Mon', sales: 4000000 },
  { name: 'Tue', sales: 3000000 },
  { name: 'Wed', sales: 5000000 },
  { name: 'Thu', sales: 4500000 },
  { name: 'Fri', sales: 6000000 },
  { name: 'Sat', sales: 7500000 },
  { name: 'Sun', sales: 6500000 },
];

// Custom formatter for IDR
const formatIDR = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">Sales Overview</h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">Weekly sales performance</p>
          </div>
          <select className="px-3 lg:px-4 py-2 border border-gray-200 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={formatIDR}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: any) => [formatIDR(value), 'Sales']}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#2563EB" 
                strokeWidth={3}
                dot={{ fill: '#2563EB', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}