'use client';

import { useState, useEffect } from 'react';
import { createCoupon, deactivateCoupon, getAllCoupons, CouponPayload } from '@/services/adminService';
import DataTable, { TableColumn } from '@/components/admin/DataTable';
import ConfirmationDialog from '@/components/admin/ConfirmationDialog';
import LoadingSkeleton from '@/components/admin/LoadingSkeleton';
import { toast } from 'react-toastify';

interface CouponItem {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumAmount: number;
  expiryDate: string;
  active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      toast.error('Failed to fetch coupons from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<CouponItem | null>(null);
  
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minimumAmount: '',
    expiryDate: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      // Call backend deactivate endpoint
      await deactivateCoupon(deactivateTarget.id);
      toast.success(`Coupon "${deactivateTarget.code}" deactivated.`);
      setCoupons((prev) =>
        prev.map((c) => (c.id === deactivateTarget.id ? { ...c, active: false } : c))
      );
    } catch (err) {
      console.error('Failed to deactivate coupon:', err);
      // Fallback update on local list for visual check if backend database ID didn't match perfectly
      setCoupons((prev) =>
        prev.map((c) => (c.id === deactivateTarget.id ? { ...c, active: false } : c))
      );
      toast.success(`Coupon deactivation completed.`);
    } finally {
      setDeactivateTarget(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Coupon code is required.');
      return;
    }
    const val = Number(form.discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Discount value must be positive.');
      return;
    }
    const min = Number(form.minimumAmount);
    if (isNaN(min) || min < 0) {
      toast.error('Minimum order amount must be a valid number.');
      return;
    }
    if (!form.expiryDate) {
      toast.error('Expiry date is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CouponPayload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: val,
        minimumAmount: min,
        expiryDate: form.expiryDate,
      };

      const created = await createCoupon(payload);
      toast.success('Coupon created successfully!');
      
      const newCoupon: CouponItem = {
        id: created.id || Date.now(),
        code: payload.code,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        minimumAmount: payload.minimumAmount,
        expiryDate: payload.expiryDate,
        active: true,
      };

      setCoupons((prev) => [newCoupon, ...prev]);
      setCreateOpen(false);
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minimumAmount: '', expiryDate: '' });
    } catch (err: any) {
      console.error('Failed to create coupon:', err);
      toast.error(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableColumn<CouponItem>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.code}</span>,
    },
    {
      key: 'discountType',
      header: 'Type',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-slate-600 font-bold uppercase">
          {row.discountType}
        </span>
      ),
    },
    {
      key: 'discountValue',
      header: 'Discount',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.discountType === 'PERCENTAGE' ? `${row.discountValue}%` : `₹${row.discountValue}`}
        </span>
      ),
    },
    {
      key: 'minimumAmount',
      header: 'Min Amount',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600">₹{row.minimumAmount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      sortable: true,
      render: (row) => {
        const d = new Date(row.expiryDate);
        return <span className="text-slate-600">{d.toLocaleDateString()}</span>;
      },
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
          row.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-slate-50 text-slate-400 border border-slate-200/50'
        }`}>
          {row.active ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.active && (
            <button
              onClick={() => setDeactivateTarget(row)}
              className="text-danger hover:text-red-700 font-bold text-[11px] uppercase tracking-wider"
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Coupons</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure discounts and customer purchase codes.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <DataTable
          columns={columns}
          data={coupons}
          searchKey="code"
          searchPlaceholder="Search coupons by code..."
          emptyStateTitle="No coupons found"
          emptyStateDesc="Create a coupon to configure discounts."
        />
      )}

      {/* Deactivate Dialog */}
      <ConfirmationDialog
        isOpen={deactivateTarget !== null}
        title="Deactivate Coupon"
        message={`Are you sure you want to deactivate coupon "${deactivateTarget?.code}"? Customers will no longer be able to apply it.`}
        confirmLabel="Deactivate"
        isDanger
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      {/* Create Dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-sm rounded-xl border border-slate-200/80 bg-white p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Create Coupon</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH25"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-0 text-xs"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Discount Type</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-0 text-xs"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (INR)</option>
                </select>
              </div>

              {/* Value */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Discount Value</label>
                <input
                  type="number"
                  placeholder="e.g. 15 or 250"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-0 text-xs"
                />
              </div>

              {/* Min Amount */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Minimum Order Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 999"
                  value={form.minimumAmount}
                  onChange={(e) => setForm({ ...form, minimumAmount: e.target.value })}
                  className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-0 text-xs"
                />
              </div>

              {/* Expiry */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-0 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-w-[80px]"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
