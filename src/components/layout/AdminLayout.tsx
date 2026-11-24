'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MapPin } from 'lucide-react';

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
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white py-4 px-6 text-center text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <p>
              © 2026 <strong className="text-gray-700">Karate-HaUI</strong> — Đại học Công Nghiệp Hà Nội
            </p>
            <span className="hidden sm:inline text-gray-300">•</span>
            <p className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Địa chỉ: Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
