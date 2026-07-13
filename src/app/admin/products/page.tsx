'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import axiosClient, { unwrapResponse } from '@/services/axiosClient';
import { deleteProduct } from '@/services/adminService';
import type { Product } from '@/types/product.types';
import DataTable, { TableColumn } from '@/components/admin/DataTable';
import LoadingSkeleton from '@/components/admin/LoadingSkeleton';
import ConfirmationDialog from '@/components/admin/ConfirmationDialog';
import { toast } from 'react-toastify';

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get('id');
  const searchCategory = searchParams.get('category');
  const searchVal = searchParams.get('search');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    axiosClient.get('/products')
      .then((res) => {
        let list = unwrapResponse<Product[]>(res.data);
        if (searchId) {
          list = list.filter((p) => p.id === Number(searchId));
        } else if (searchCategory) {
          list = list.filter((p) => p.category?.toLowerCase() === searchCategory.toLowerCase());
        } else if (searchVal) {
          list = list.filter((p) => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.category?.toLowerCase().includes(searchVal.toLowerCase()));
        }
        setProducts(list);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        toast.error('Unable to fetch product listings.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [searchId, searchCategory, searchVal]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(`Product "${deleteTarget.name}" deleted successfully.`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete product.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'imageUrl',
      header: 'Image',
      render: (row) => (
        <div className="h-10 w-10 overflow-hidden rounded border border-slate-100 bg-[#fcfcfc] flex items-center justify-center p-1">
          <img src={row.imageUrl || '/placeholder.png'} alt={row.name} className="h-full w-full object-contain" />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-900 block truncate max-w-xs">{row.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 border border-slate-200/80 text-slate-600 uppercase">
          {row.category || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'cost',
      header: 'Price',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">₹{row.cost.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (row) => (
        <span className={`font-semibold ${row.stock <= 5 ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
          {row.stock} units
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewProduct(row)}
            className="text-slate-500 hover:text-slate-900 font-bold text-[11px] uppercase tracking-wider"
          >
            View
          </button>
          <Link
            href={`/admin/products/edit/${row.id}`}
            className="text-primary hover:underline font-bold text-[11px] uppercase tracking-wider"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-danger hover:text-red-700 font-bold text-[11px] uppercase tracking-wider"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and organize your store catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Search products by name..."
          emptyStateTitle="No products found"
          emptyStateDesc="Create a product or clear active search filters to view catalog."
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteTarget !== null}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* View Details Drawer/Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Product Details</h3>
              <button onClick={() => setViewProduct(null)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-20 w-20 overflow-hidden rounded border border-slate-100 bg-[#fcfcfc] flex items-center justify-center p-2 flex-shrink-0">
                <img src={viewProduct.imageUrl || '/placeholder.png'} alt={viewProduct.name} className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{viewProduct.name}</h4>
                <p className="text-[10px] px-2 py-0.5 rounded-full inline-block font-semibold bg-slate-100 border border-slate-200/80 text-slate-600 uppercase">
                  {viewProduct.category || 'Uncategorized'}
                </p>
                <p className="text-xs text-slate-400 font-medium pt-1">Product ID: #{viewProduct.id}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Catalog Price:</span>
                <span className="text-slate-900 font-bold">₹{viewProduct.cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>In Stock Count:</span>
                <span className="text-slate-900">{viewProduct.stock} units</span>
              </div>
              <div className="flex justify-between">
                <span>Image Link:</span>
                <span className="text-slate-600 truncate max-w-[220px] font-mono">{viewProduct.imageUrl || 'No image'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
