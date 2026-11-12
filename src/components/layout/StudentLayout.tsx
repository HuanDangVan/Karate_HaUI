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
  Sparkles,
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
        // Không làm ảnh hưởng giao diện nếu tải thông báo thất bại.
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
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50/30 via-slate-50/60 to-sky-50/30 font-sans text-slate-800 antialiased">
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-pink-100/90 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-200/80 bg-pink-50/50 text-slate-700 hover:bg-pink-100/60 lg:hidden transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5 text-pink-600" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-slate-800 sm:text-lg">
                  {pageTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-0.5 text-[11px] font-bold text-pink-700">
                  <Sparkles className="h-3 w-3 text-pink-500" />
                  Karate-HaUI
                </span>
              </div>
              <p className="hidden text-xs text-sky-700 sm:block font-medium">
                Cổng thông tin học viên • Đại học Công Nghiệp Hà Nội
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-1.5 rounded-xl border border-pink-100/80 bg-gradient-to-r from-pink-50/50 to-sky-50/50 px-3 py-1.5 text-xs text-slate-600 xl:flex">
              <CalendarDays className="h-3.5 w-3.5 text-pink-500" />
              <span className="capitalize">{currentDate}</span>
            </div>

            <button
              onClick={() => router.push('/student/notifications')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-pink-100 bg-white text-slate-700 transition hover:border-pink-300 hover:bg-pink-50/60 hover:text-pink-600"
              title="Thông báo"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative border-l border-pink-100 pl-3 sm:pl-4">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl p-1 text-left transition hover:bg-pink-50/50 sm:gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-400 text-xs font-black text-white shadow-sm ring-2 ring-pink-100">
                  {initials}
                </div>

                <div className="hidden sm:block">
                  <div className="flex items-center gap-1">
                    <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                      {user.name}
                    </p>
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                  </div>
                  <p className="text-[11px] font-semibold text-pink-600">
                    Học viên Karate-HaUI
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>

              {showProfileMenu && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowProfileMenu(false)}
                    aria-label="Đóng menu tài khoản"
                  />

                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-pink-100 bg-white p-3 shadow-xl shadow-pink-100/50">
                    <div className="border-b border-pink-50 px-2 pb-3">
                      <p className="text-xs font-bold text-slate-800">
                        {user.name}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {user.email}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-pink-700">
                        Tài khoản học viên
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-pink-600 transition hover:bg-pink-50 hover:text-pink-700"
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

        {/* Nội dung */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-pink-100/80 bg-white/80 backdrop-blur-xs px-6 py-4 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
            <p>
              © 2026 <strong className="text-pink-600 font-bold">Karate-HaUI</strong> —{' '}
              <span className="text-sky-700 font-semibold">Đại học Công Nghiệp Hà Nội</span>
            </p>
            <span className="hidden sm:inline text-pink-300">•</span>
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
