'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@techheaven.com',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [notifs, setNotifs] = useState({
    stockAlerts: true,
    newOrders: true,
    registrations: false,
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSubmittingPassword(true);
    // Simulate updating password
    setTimeout(() => {
      toast.success('Security settings updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSubmittingPassword(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage credentials, preferences, and view platform parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Profile Settings */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Admin Profile</h3>
          </div>
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Display Name</label>
              <input
                type="text"
                disabled
                value={profileForm.name}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 font-semibold text-slate-400 focus:outline-none text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                disabled
                value={profileForm.email}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 font-semibold text-slate-400 focus:outline-none text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
              Profile details are controlled by key account registrations and cannot be modified inline.
            </p>
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Change Password</h3>
          </div>
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-850 focus:border-slate-450 focus:outline-none text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-850 focus:border-slate-450 focus:outline-none text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-200/85 py-1.5 px-3 font-medium text-slate-850 focus:border-slate-450 focus:outline-none text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={submittingPassword}
              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors"
            >
              {submittingPassword ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>

        {/* Notifications Preference */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Alert Preferences</h3>
          </div>
          <div className="space-y-3.5 text-xs">
            <label className="flex items-center gap-3 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifs.stockAlerts}
                onChange={(e) => setNotifs({ ...notifs, stockAlerts: e.target.checked })}
                className="h-4 w-4 rounded border-slate-250 text-slate-900 focus:ring-0"
              />
              <span>Send notification on low stock thresholds</span>
            </label>
            <label className="flex items-center gap-3 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifs.newOrders}
                onChange={(e) => setNotifs({ ...notifs, newOrders: e.target.checked })}
                className="h-4 w-4 rounded border-slate-250 text-slate-900 focus:ring-0"
              />
              <span>Send notification on new order confirmations</span>
            </label>
            <label className="flex items-center gap-3 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifs.registrations}
                onChange={(e) => setNotifs({ ...notifs, registrations: e.target.checked })}
                className="h-4 w-4 rounded border-slate-250 text-slate-900 focus:ring-0"
              />
              <span>Send notification on user registrations</span>
            </label>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Parameters</h3>
          </div>
          <div className="space-y-3.5 text-xs text-slate-500 font-semibold">
            <div className="flex justify-between">
              <span>Environment Status:</span>
              <span className="text-slate-800 font-bold uppercase">Production (SaaS Mode)</span>
            </div>
            <div className="flex justify-between">
              <span>Next.js Engine:</span>
              <span className="text-slate-850 font-mono">v15.3.3</span>
            </div>
            <div className="flex justify-between text-left">
              <span>Backend API Server:</span>
              <span className="text-slate-850 font-mono break-all">{process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}</span>
            </div>
            <div className="flex justify-between">
              <span>Client State Cache:</span>
              <span className="text-slate-800 uppercase">Zustand Stores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
