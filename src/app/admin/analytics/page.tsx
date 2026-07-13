'use client';

import { BarChart, LineChart, DonutChart } from '@/components/admin/Charts';

export default function AdminAnalyticsPage() {
  // Simulated stats for charts
  const revenueData = [
    { label: 'Jan', value: 45000 },
    { label: 'Feb', value: 52000 },
    { label: 'Mar', value: 49000 },
    { label: 'Apr', value: 63000 },
    { label: 'May', value: 58000 },
    { label: 'Jun', value: 71000 },
  ];

  const ordersData = [120, 145, 132, 180, 160, 210];
  const ordersLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const categoryDistribution = [
    { label: 'Electronics', value: 45, color: '#0f172a' },
    { label: 'Accessories', value: 30, color: '#334155' },
    { label: 'Office Supplies', value: 15, color: '#64748b' },
    { label: 'Other', value: 10, color: '#cbd5e1' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Performance audits, category distributions, and business trends.</p>
        </div>
        <div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-slate-950 text-white font-bold uppercase tracking-wider select-none shadow-sm ring-1 ring-slate-950/5">
            Coming Soon
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Revenue Trend</h3>
            <p className="text-[10px] text-slate-400 font-medium">Monthly revenue totals (Simulated)</p>
          </div>
          <BarChart data={revenueData} />
        </div>

        {/* Orders chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sales Volumes</h3>
            <p className="text-[10px] text-slate-400 font-medium">Monthly order counts (Simulated)</p>
          </div>
          <LineChart data={ordersData} labels={ordersLabels} />
        </div>

        {/* Category distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Category Shares</h3>
            <p className="text-[10px] text-slate-400 font-medium">Distribution by products category</p>
          </div>
          <DonutChart data={categoryDistribution} />
        </div>

        {/* Information Callout */}
        <div className="bg-slate-50 border border-slate-250/80 rounded-xl p-6 flex flex-col justify-center text-center space-y-3">
          <div className="h-10 w-10 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto border border-slate-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Database Integrations</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Analytics metrics are configured as placeholders. Advanced custom database aggregation reports are under implementation for Tech Heaven version 1.2.
          </p>
        </div>
      </div>
    </div>
  );
}
