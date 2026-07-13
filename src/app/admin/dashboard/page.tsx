'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/services/adminService';
import type { DashboardStats } from '@/types/admin.types';
import DashboardCard from '@/components/admin/DashboardCard';
import LoadingSkeleton from '@/components/admin/LoadingSkeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => {
        console.error('Failed to load dashboard statistics:', err);
        setError('Unable to load dashboard details.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 font-sans">
        <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
        <LoadingSkeleton type="stats" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center space-y-4 max-w-md mx-auto mt-12 font-sans">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 mx-auto">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Failed to Load Dashboard</h3>
        <p className="text-xs text-slate-500">{error ?? 'Please check your connection and try again.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Overview of store health and operations.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          description="Confirmed orders total"
          icon={
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders}
          description="Lifetime placed orders count"
          icon={
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <DashboardCard
          title="Products Sold"
          value={stats.totalProductsSold}
          description="Confirmed items dispatched"
          icon={
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <DashboardCard
          title="Customers"
          value={stats.totalUsers}
          description="Registered user accounts"
          icon={
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders summary */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pending Tasks</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200/80 uppercase">
              {stats.pendingOrders} Orders Pending
            </span>
          </div>

          {stats.pendingOrders > 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <p className="text-xs text-slate-500 max-w-xs">
                You have {stats.pendingOrders} order(s) awaiting confirmation and shipment processing.
              </p>
              <Link
                href="/admin/orders"
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
              >
                Go to Order Management
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-500 font-medium">All orders are up to date.</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Low Stock Warnings</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200/80 uppercase">
              {stats.lowStockProducts.length} Items Low
            </span>
          </div>

          {stats.lowStockProducts.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
              {stats.lowStockProducts.map((p) => (
                <div key={p.productId} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Product ID: #{p.productId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.stock === 0 ? 'bg-rose-50 text-rose-700 border border-rose-200/50' : 'bg-amber-50 text-amber-700 border border-amber-200/50'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} remaining`}
                    </span>
                    <Link
                      href="/admin/inventory"
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-500 font-medium">All product stock counts are healthy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
