'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MapPin, Shield, Flame } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function AdminLayout({
  children,
  pageTitle = 'Tổng quan hệ thống',
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-100/70 via-purple-50/60 to-sky-100/70 font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Header */}
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>

        {/* Footer: Màu sắc pastel hồng xanh + điểm nhấn đỏ võ đạo (ít trắng) */}
        <footer className="border-t-2 border-pink-200/90 bg-gradient-to-r from-rose-100/95 via-pink-100/90 to-sky-100/95 py-4 px-6 text-center text-xs text-slate-700 shadow-sm backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-xs">
                <Flame className="h-3 w-3" />
              </span>
              <p>
                © 2026 <strong className="text-red-700 font-black">Karate-HaUI</strong> —{' '}
                <span className="text-sky-800 font-bold">Đại học Công Nghiệp Hà Nội</span>
              </p>
            </div>
            <span className="hidden sm:inline text-red-300 font-black">•</span>
            <div className="flex items-center gap-1 text-slate-700 font-medium bg-white/40 px-3 py-1 rounded-full ring-1 ring-red-200">
              <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <span>
                <strong className="text-red-700">Địa chỉ:</strong> Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
