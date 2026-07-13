'use client';

import { Order } from '@/types/order.types';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 font-sans p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl border border-slate-200/80 bg-white shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Order #{order.orderId} Details</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Placed on {new Date(order.orderDate).toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors bg-white hover:bg-slate-200 rounded-full p-1.5 shadow-sm border border-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer & Shipping */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Customer & Shipping</h3>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 space-y-2.5 border border-slate-200/60 shadow-sm h-full">
                <p className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Name</span> <span className="font-semibold text-slate-900">{order.shippingName || 'N/A'}</span></p>
                <p className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Phone</span> <span className="font-semibold text-slate-900">{order.shippingPhone || 'N/A'}</span></p>
                <p className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Address</span> <span className="font-medium">{order.shippingAddress || 'N/A'}</span></p>
              </div>
            </div>

            {/* Payment & Status */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Payment & Status</h3>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 space-y-2.5 border border-slate-200/60 shadow-sm h-full">
                <p className="flex items-center justify-between">
                  <span className="font-semibold">Order Status</span> 
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {order.status}
                  </span>
                </p>
                <p className="flex items-center justify-between"><span className="font-semibold">Payment Method</span> <span className="font-medium uppercase text-xs">{order.paymentMethod || 'N/A'}</span></p>
                <p className="flex items-center justify-between"><span className="font-semibold">Payment Status</span> <span className="font-medium uppercase text-xs">{order.paymentStatus || 'N/A'}</span></p>
                <p className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-bold mb-0.5 mt-2">Transaction ID</span> <span className="font-mono text-xs">{order.transactionId || 'N/A'}</span></p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Order Items</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items && order.items.length > 0 ? order.items.map((item, idx) => {
                    const price = item.unitPrice ?? (item as any).price ?? 0;
                    const subtotal = item.subtotal ?? (item as any).totalPrice ?? (price * item.quantity);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">₹{price.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500 italic">No items found for this order.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-sm text-slate-600 bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-mono">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-mono">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Service Fee</span>
                <span className="font-mono">₹{(order.serviceFee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg border-t border-slate-200 pt-3 mt-3">
                <span>Grand Total</span>
                <span className="font-mono">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
