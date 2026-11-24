'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  MapPin,
} from 'lucide-react';
import { StudentSidebar } from './StudentSidebar';

interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

const PAGE_TITLES: Record<string, string> = {
  '/student': 'Tổng quan học viên',
  '/student/classes': 'Danh sách lớp học',
  '/student/my-classes': 'Lớp học đã đăng ký',
  '/student/schedule': 'Lịch tập',
  '/student/attendance': 'Lịch sử điểm danh',
  '/student/tuition': 'Thông tin học phí',
  '/student/notifications': 'Thông báo',
};

export function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser>({
    name: 'Học viên',
    email: '',
    role: 'hoc_vien',
  });
  const [currentDate, setCurrentDate] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pageTitle = PAGE_TITLES[pathname] || 'Khu vực học viên';

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser({
            name: data.user.name || 'Học viên',
            email: data.user.email || '',
            role: data.user.role || 'hoc_vien',
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(
        new Intl.DateTimeFormat('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date())
      );
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/student/notifications', {
          cache: 'no-store',
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setUnreadCount(data.summary?.soChuaDoc || 0);
        }
      } catch {
        // silent
      }
    };

    fetchUnreadCount();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'HV';

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                {pageTitle}
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Karate-HaUI — Đại học Công Nghiệp Hà Nội
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 xl:flex">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="capitalize">{currentDate}</span>
            </div>

            <button
              onClick={() => router.push('/student/notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              title="Thông báo"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative border-l border-gray-200 pl-3 sm:pl-4">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-gray-50 sm:gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials}
                </div>

                <div className="hidden sm:block">
                  <p className="max-w-32 truncate text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-gray-500">Học viên</p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
              </button>

              {showProfileMenu && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowProfileMenu(false)}
                    aria-label="Đóng menu"
                  />

                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                    <div className="border-b border-gray-100 px-2 pb-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-gray-500">
                        {user.email}
                      </p>
                      <span className="mt-2 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        Tài khoản học viên
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

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
