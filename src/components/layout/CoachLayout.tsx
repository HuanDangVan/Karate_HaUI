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
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
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

        <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <p>
              © 2026 <strong className="text-gray-700">Karate-HaUI</strong> — Đại học Công Nghiệp Hà Nội
            </p>
            <span className="hidden sm:inline text-gray-300">•</span>
            <p className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
