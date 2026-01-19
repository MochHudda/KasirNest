import { LucideIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '../utils/cn';

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function DashboardCard({
  title,
  value,
  change,
  changeType = 'increase',
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-primary-600',
}: DashboardCardProps) {
  return (
    <Card className="p-4 lg:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div className={cn('p-2 lg:p-3 rounded-lg', iconBgColor)}>
          <Icon className={cn('w-5 h-5 lg:w-6 lg:h-6', iconColor)} />
        </div>
        {change && (
          <span
            className={cn(
              'text-xs lg:text-sm font-medium',
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-xs lg:text-sm mb-1">{title}</h3>
      <p className="text-lg lg:text-2xl font-semibold text-gray-900">{value}</p>
    </Card>
  );
}