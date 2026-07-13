'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosClient, { unwrapResponse } from '@/services/axiosClient';
import type { Order } from '@/types/order.types';
import DataTable, { TableColumn } from '@/components/admin/DataTable';
import LoadingSkeleton from '@/components/admin/LoadingSkeleton';
import ConfirmationDialog from '@/components/admin/ConfirmationDialog';
import { toast } from 'react-toastify';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = () => {
    if (!user) return;
    setLoading(true);
    // Fetch orders history for current authenticated user
    axiosClient.get(`/orders/user/${user.id}`)
      .then((res) => {
        setOrders(unwrapResponse<Order[]>(res.data));
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        toast.error('Unable to fetch orders data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await axiosClient.put(`/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success(`Order #${orderId} status updated to ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error('Failed to update order status.');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await axiosClient.patch(`/orders/${cancelTarget.orderId}/cancel`);
      toast.success(`Order #${cancelTarget.orderId} cancelled successfully.`);
      // Reload orders
      fetchOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error('Failed to cancel order.');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      const response = await axiosClient.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_order_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully.');
    } catch (err) {
      console.error('Failed to download invoice:', err);
      toast.error('Failed to download invoice PDF.');
    }
  };

  // Filter orders by active status tab
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const columns: TableColumn<Order>[] = [
    {
      key: 'orderId',
      header: 'Order ID',
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-slate-900">#{row.orderId}</span>,
    },
    {
      key: 'user',
      header: 'Customer',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">{row.shippingName || user?.name || 'Customer'}</p>
          <p className="text-[10px] text-slate-400 font-medium">{row.shippingPhone || 'No Phone'}</p>
        </div>
      ),
    },
    {
      key: 'orderDate',
      header: 'Placed Date',
      sortable: true,
      render: (row) => {
        const d = new Date(row.orderDate);
        return <span className="text-slate-600">{d.toLocaleDateString()}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        return (
          <select
            value={row.status}
            onChange={(e) => handleUpdateStatus(row.orderId, e.target.value)}
            className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">₹{row.totalAmount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const canCancel = row.status === 'PENDING';
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadInvoice(row.orderId)}
              className="text-primary hover:underline font-bold text-[11px] uppercase tracking-wider flex items-center gap-1"
            >
              Invoice
            </button>
            {canCancel && (
              <button
                onClick={() => setCancelTarget(row)}
                className="text-danger hover:text-red-700 font-bold text-[11px] uppercase tracking-wider"
              >
                Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track, audit, and cancel pending customer shipments.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold shadow-sm max-w-sm overflow-x-auto select-none">
          {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all duration-150 ${
                statusFilter === tab
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          searchKey="orderId"
          searchPlaceholder="Search orders by ID..."
          emptyStateTitle="No orders found"
          emptyStateDesc="No transactions matching this status are registered."
        />
      )}

      {/* Cancel Order Dialog */}
      <ConfirmationDialog
        isOpen={cancelTarget !== null}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order #${cancelTarget?.orderId}? This will restore product inventory levels.`}
        confirmLabel={cancelling ? 'Cancelling...' : 'Cancel Order'}
        isDanger
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
