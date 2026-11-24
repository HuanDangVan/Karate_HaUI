'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  Bell,
  X,
  MapPin,
} from 'lucide-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { title: 'Tổng quan', href: '/student', icon: LayoutDashboard },
  { title: 'Lớp học', href: '/student/classes', icon: BookOpen },
  { title: 'Lớp đã đăng ký', href: '/student/my-classes', icon: Users },
  { title: 'Lịch tập', href: '/student/schedule', icon: CalendarDays },
  { title: 'Lịch sử điểm danh', href: '/student/attendance', icon: ClipboardCheck },
  { title: 'Học phí', href: '/student/tuition', icon: Wallet },
  { title: 'Thông báo', href: '/student/notifications', icon: Bell },
];

export function StudentSidebar({
  isOpen,
  onClose,
}: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="font-serif text-sm font-bold">空</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900">Karate-HaUI</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  Học viên
                </span>
              </div>
              <p className="truncate text-[11px] text-gray-500">
                ĐH Công Nghiệp Hà Nội
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Address */}
        <div className="border-b border-gray-100 px-4 py-2">
          <p className="text-[11px] font-medium text-gray-400 uppercase">Khu vực học viên</p>
          <div className="mt-1 flex items-start gap-1.5 text-[11px] text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="leading-tight">Chùa Tu Hoàng, cách ĐHCN 900m</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Quản lý học tập
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/student'
                ? pathname === '/student'
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
