'use client';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function DashboardCard({ title, value, icon, description, trend }: DashboardCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3 font-sans">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</span>
        <div className="text-slate-400 p-1 bg-slate-50 rounded-lg border border-slate-100/60">
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {description && (
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            {trend && (
              <span className={`font-bold mr-1.5 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
            )}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
