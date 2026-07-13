'use client';

import { useAuth } from '@/hooks/useAuth';
import SearchBar from './SearchBar';
import { useState, useRef, useEffect } from 'react';
import { getLowStockProducts } from '@/services/productService';
import type { Product } from '@/types/product.types';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notifsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifsDropdownRef.current && !notifsDropdownRef.current.contains(event.target as Node)) {
        setNotifsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminName = user?.name || 'Administrator';
  const adminEmail = user?.email || 'admin@techheaven.com';
  const avatarLetter = adminName.charAt(0).toUpperCase();

  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const products = await getLowStockProducts();
        setLowStockProducts(products);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };
    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hasUnread = lowStockProducts.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 shadow-sm font-sans">
      <div className="flex items-center gap-4 flex-1">
        {/* Menu Button (Mobile Only) */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:hidden focus:outline-none"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Bar Component */}
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <div ref={notifsDropdownRef} className="relative">
          <button
            onClick={() => setNotifsOpen(!notifsOpen)}
            className="relative rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasUnread && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200/80 bg-white py-2 shadow-lg z-50 text-xs">
              <div className="px-4 py-1.5 border-b border-slate-100 flex items-center justify-between font-semibold text-slate-800">
                <span>Alerts Log</span>
                <button className="text-[10px] text-primary hover:underline font-bold">Mark all read</button>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {lowStockProducts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No new alerts
                  </div>
                ) : (
                  lowStockProducts.map((p) => (
                    <div key={p.id} className="p-4 flex gap-3 transition-colors hover:bg-slate-50 bg-slate-50/40">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-rose-600">Low Stock Alert</span>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Now</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Product "{p.name}" {p.isAvailable === false ? 'is currently marked as unavailable.' : `is down to ${p.stock} units.`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileDropdownRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200">
              {avatarLetter}
            </div>
            <div className="hidden md:block text-left text-xs font-semibold text-slate-800 pr-1">
              {adminName}
            </div>
          </button>

          {/* Profile Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800">{adminName}</p>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{adminEmail}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 hover:font-bold transition-all duration-150 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
