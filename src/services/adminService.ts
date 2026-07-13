import axiosClient, { unwrapResponse } from './axiosClient';
import type { DashboardStats } from '@/types/admin.types';
import type { Product } from '@/types/product.types';
import type { User } from '@/types/auth.types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await axiosClient.get(`/admin/dashboard`);
  return unwrapResponse<DashboardStats>(response.data);
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const response = await axiosClient.post(`/products`, product);
  return unwrapResponse<Product>(response.data);
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  const response = await axiosClient.put(`/products/${id}`, product);
  return unwrapResponse<Product>(response.data);
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await axiosClient.delete(`/products/${id}`);
  return unwrapResponse<void>(response.data);
}

export async function getAllUsers(): Promise<User[]> {
  const response = await axiosClient.get(`/users`);
  return unwrapResponse<User[]>(response.data);
}

export interface CouponPayload {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumAmount: number;
  expiryDate: string; // YYYY-MM-DD
}

export async function createCoupon(coupon: CouponPayload): Promise<any> {
  const response = await axiosClient.post(`/coupons`, coupon);
  return unwrapResponse<any>(response.data);
}

export async function deactivateCoupon(couponId: number): Promise<void> {
  const response = await axiosClient.patch(`/coupons/${couponId}/deactivate`);
  return unwrapResponse<void>(response.data);
}

export async function getAllCoupons(): Promise<any[]> {
  const response = await axiosClient.get(`/coupons`);
  return unwrapResponse<any[]>(response.data);
}
