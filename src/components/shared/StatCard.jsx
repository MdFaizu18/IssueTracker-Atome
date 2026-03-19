/* eslint-disable no-unused-vars */
import { cn } from '../../utils/cn';

export function StatCard({ title, value, icon: Icon, trend, className }) {
  return (
    <div className={cn('p-6 rounded-xl bg-card border border-border', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
          {trend && (
            <p className={cn('mt-2 text-sm font-medium', trend.isPositive ? 'text-success' : 'text-destructive')}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
