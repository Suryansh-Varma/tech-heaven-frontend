'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addProduct } from '@/services/adminService';
import type { Product } from '@/types/product.types';
import { toast } from 'react-toastify';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    category: '',
    cost: '',
    stock: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Product name is required';
    }

    if (!form.category.trim()) {
      nextErrors.category = 'Category is required';
    }

    const costNum = Number(form.cost);
    if (!form.cost) {
      nextErrors.cost = 'Price is required';
    } else if (isNaN(costNum) || costNum <= 0) {
      nextErrors.cost = 'Price must be a positive number';
    }

    const stockNum = Number(form.stock);
    if (!form.stock) {
      nextErrors.stock = 'Stock is required';
    } else if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum <= 0) {
      nextErrors.stock = 'Stock must be a positive integer';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: Omit<Product, 'id'> = {
        name: form.name.trim(),
        category: form.category.trim(),
        cost: Number(form.cost),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim() || undefined,
      };

      await addProduct(payload);
      toast.success('Product created successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Failed to create product:', err);
      toast.error(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-2xl">
      {/* Navigation */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Products
      </Link>

      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Add New Product</h1>
        <p className="text-xs text-slate-500 mt-0.5">Publish a new item to the store catalog.</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Name */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full rounded-lg border py-2 px-3 font-medium text-slate-800 focus:outline-none focus:ring-0 text-xs transition-colors ${
                errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200/85 focus:border-slate-400'
              }`}
            />
            {errors.name && <p className="text-[10px] text-rose-600 font-bold">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Category</label>
            <input
              type="text"
              placeholder="e.g. Electronics, Books"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full rounded-lg border py-2 px-3 font-medium text-slate-800 focus:outline-none focus:ring-0 text-xs transition-colors ${
                errors.category ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200/85 focus:border-slate-400'
              }`}
            />
            {errors.category && <p className="text-[10px] text-rose-600 font-bold">{errors.category}</p>}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Price (INR)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 1999.00"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className={`w-full rounded-lg border py-2 px-3 font-medium text-slate-800 focus:outline-none focus:ring-0 text-xs transition-colors ${
                errors.cost ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200/85 focus:border-slate-400'
              }`}
            />
            {errors.cost && <p className="text-[10px] text-rose-600 font-bold">{errors.cost}</p>}
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Initial Stock</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className={`w-full rounded-lg border py-2 px-3 font-medium text-slate-800 focus:outline-none focus:ring-0 text-xs transition-colors ${
                errors.stock ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200/85 focus:border-slate-400'
              }`}
            />
            {errors.stock && <p className="text-[10px] text-rose-600 font-bold">{errors.stock}</p>}
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Image URL</label>
            <input
              type="url"
              placeholder="e.g. https://images.unsplash.com/..."
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-200/85 py-2 px-3 font-medium text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-0 text-xs transition-colors"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold tracking-wide transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 min-w-[90px] disabled:opacity-50"
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
              'Save Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
