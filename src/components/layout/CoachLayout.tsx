'use client';

import React, { useState } from 'react';
import { CoachSidebar } from './CoachSidebar';
import { Header } from './Header';
import { MapPin } from 'lucide-react';

interface CoachLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function CoachLayout({
  children,
  pageTitle = 'Tổng quan huấn luyện viên',
}: CoachLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-50/40 via-slate-50/60 to-pink-50/30 font-sans text-slate-800 antialiased">
      <CoachSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
          variant="coach"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>

        <footer className="border-t border-sky-100/80 bg-white/80 backdrop-blur-xs px-6 py-4 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
            <p>
              © 2026 <strong className="text-sky-700 font-bold">Karate-HaUI</strong> —{' '}
              <span className="text-pink-600 font-semibold">Đại học Công Nghiệp Hà Nội</span>
            </p>
            <span className="hidden sm:inline text-sky-200">•</span>
            <p className="flex items-center gap-1 text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
              <span>Địa chỉ: Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
