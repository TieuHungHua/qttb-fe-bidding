import { Card, CardContent } from '../ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../ui/utils';

interface KPICardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  delta?: number;
  deltaType?: 'increase' | 'decrease';
  format?: 'number' | 'currency';
  className?: string;
}

export function KPICard({ label, value, icon: Icon, delta, deltaType, format = 'number', className }: KPICardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    if (format === 'currency') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(val);
    }

    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-2">{formatValue(value)}</p>

            {delta !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {deltaType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    deltaType === 'increase' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {delta > 0 ? '+' : ''}{delta}%
                </span>
                <span className="text-sm text-muted-foreground">so với tháng trước</span>
              </div>
            )}
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
