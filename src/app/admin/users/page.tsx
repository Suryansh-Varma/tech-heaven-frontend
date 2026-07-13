'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '@/services/adminService';
import type { User } from '@/types/auth.types';
import DataTable, { TableColumn } from '@/components/admin/DataTable';
import LoadingSkeleton from '@/components/admin/LoadingSkeleton';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => {
        console.error('Failed to load users list:', err);
        toast.error('Unable to retrieve user directory.');
      })
      .finally(() => setLoading(false));
  }, []);

  const columns: TableColumn<User>[] = [
    {
      key: 'id',
      header: 'Avatar',
      render: (row) => {
        const letter = row.name ? row.name.charAt(0).toUpperCase() : 'U';
        return (
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200">
            {letter}
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Full Name',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900">{row.name || 'Anonymous User'}</span>,
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      render: (row) => <span className="text-slate-600 font-mono">{row.email}</span>,
    },
    {
      key: 'status',
      header: 'Account Status',
      render: () => (
        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Customer Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">Audit customer accounts registered on the system.</p>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchKey="name"
          searchPlaceholder="Search customers by name..."
          emptyStateTitle="No customers registered"
          emptyStateDesc="Registered user accounts will show up here."
        />
      )}
    </div>
  );
}
