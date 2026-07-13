'use client';

import { useEffect, useState } from 'react';
import axiosClient, { unwrapResponse } from '@/services/axiosClient';
import { updateProduct } from '@/services/adminService';
import type { Product } from '@/types/product.types';
import DataTable, { TableColumn } from '@/components/admin/DataTable';
import LoadingSkeleton from '@/components/admin/LoadingSkeleton';
import { toast } from 'react-toastify';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    axiosClient.get('/products')
      .then((res) => {
        setProducts(unwrapResponse<Product[]>(res.data));
      })
      .catch((err) => {
        console.error('Failed to fetch inventory:', err);
        toast.error('Failed to load inventory stock catalog.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenUpdate = (product: Product) => {
    setUpdatingProduct(product);
    setNewStock(String(product.stock));
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingProduct) return;

    const stockNum = Number(newStock);
    if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      toast.error('Stock must be a non-negative integer.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Product> = {
        name: updatingProduct.name,
        category: updatingProduct.category,
        cost: updatingProduct.cost,
        imageUrl: updatingProduct.imageUrl,
        stock: stockNum,
      };

      const updated = await updateProduct(updatingProduct.id, payload);
      toast.success(`Stock for "${updatingProduct.name}" updated to ${stockNum}.`);
      setProducts((prev) => prev.map((p) => (p.id === updatingProduct.id ? updated : p)));
      setUpdatingProduct(null);
    } catch (err) {
      console.error('Failed to update stock:', err);
      toast.error('Failed to update stock quantity.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (row) => <span className="font-mono text-[10px] text-slate-500 font-bold">#{row.id}</span>,
    },
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900 block truncate max-w-xs">{row.name}</span>,
    },
    {
      key: 'stock',
      header: 'Stock Level',
      sortable: true,
      render: (row) => {
        const isOutOfStock = row.stock === 0;
        const isLowStock = row.stock > 0 && row.stock <= 5;

        return (
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">{row.stock} units</span>
            {isOutOfStock && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/50">
                Out of Stock
              </span>
            )}
            {isLowStock && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/50">
                Low Stock
              </span>
            )}
            {!isOutOfStock && !isLowStock && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                Healthy
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleOpenUpdate(row)}
          className="text-primary hover:underline font-bold text-[11px] uppercase tracking-wider"
        >
          Update Quantity
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">Monitor stock levels, warnings, and configure alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Stock Table */}
        <div className="lg:col-span-2">
          {loading ? (
            <LoadingSkeleton type="table" />
          ) : (
            <DataTable
              columns={columns}
              data={products}
              searchKey="name"
              searchPlaceholder="Search inventory by name..."
              emptyStateTitle="No inventory matches"
              emptyStateDesc="Create a product to manage inventory counts."
            />
          )}
        </div>

        {/* History Placeholder Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inventory Log</h3>
          </div>
          <div className="space-y-4 text-xs">
            <p className="text-slate-400 font-medium italic">Stock update histories will show up here. All updates are logged automatically.</p>
            <div className="border-l-2 border-slate-100 pl-4 space-y-3.5">
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-400 ring-4 ring-white" />
                <p className="font-semibold text-slate-700">Stock System Initialized</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Tech Heaven Version 1.1</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Quantity Dialog */}
      {updatingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4">
          <form
            onSubmit={handleUpdateStock}
            className="w-full max-w-sm rounded-xl border border-slate-200/80 bg-white p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Adjust Quantity</h3>
              <button
                type="button"
                onClick={() => setUpdatingProduct(null)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 line-clamp-1">{updatingProduct.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">Product ID: #{updatingProduct.id}</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700">New Stock Count</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-0 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setUpdatingProduct(null)}
                className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Update Stock'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
