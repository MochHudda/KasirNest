import { DashboardCard } from '../components/DashboardCard';
import { SalesChart } from '../components/SalesChart';
import { TopProducts } from '../components/TopProducts';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Users 
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to your apparel store! Track your fashion business performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Revenue"
          value="Rp 234,567,800"
          change="+18.5%"
          changeType="increase"
          icon={DollarSign}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <DashboardCard
          title="Items Sold"
          value="1,847"
          change="+22.1%"
          changeType="increase"
          icon={TrendingUp}
          iconBgColor="bg-blue-50"
          iconColor="text-primary-600"
        />
        <DashboardCard
          title="Apparel Stock"
          value="845"
          change="+5.2%"
          changeType="increase"
          icon={ShoppingBag}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <DashboardCard
          title="Total Customers"
          value="845"
          change="+12.5%"
          changeType="increase"
          icon={Users}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart />
        <TopProducts />
      </div>
    </div>
  );
}