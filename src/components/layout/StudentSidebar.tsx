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
  Sparkles,
  MapPin,
} from 'lucide-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    title: 'Tổng quan',
    href: '/student',
    icon: LayoutDashboard,
  },
  {
    title: 'Lớp học',
    href: '/student/classes',
    icon: BookOpen,
  },
  {
    title: 'Lớp đã đăng ký',
    href: '/student/my-classes',
    icon: Users,
  },
  {
    title: 'Lịch tập',
    href: '/student/schedule',
    icon: CalendarDays,
  },
  {
    title: 'Lịch sử điểm danh',
    href: '/student/attendance',
    icon: ClipboardCheck,
  },
  {
    title: 'Học phí',
    href: '/student/tuition',
    icon: Wallet,
  },
  {
    title: 'Thông báo',
    href: '/student/notifications',
    icon: Bell,
  },
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-pink-100 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-pink-100/80 px-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-300 to-sky-400 text-white shadow-md shadow-pink-200/50 ring-2 ring-pink-100">
              <span className="font-serif text-lg font-black">空</span>
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-sky-200">
                <Sparkles className="h-2.5 w-2.5 text-pink-500" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
                  Karate-HaUI
                </span>
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700 ring-1 ring-pink-200/60">
                  Học viên
                </span>
              </div>
              <p className="truncate text-[11px] font-semibold tracking-wide text-sky-700">
                Đại học Công Nghiệp Hà Nội
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-pink-50 hover:text-pink-600 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role & Address info */}
        <div className="border-b border-pink-100/60 bg-gradient-to-r from-pink-50/70 via-sky-50/50 to-pink-50/70 px-4 py-2.5">
          <p className="text-[11px] font-bold tracking-widest text-pink-700 uppercase">
            Khu vực Học viên
          </p>
          <div className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-500 mt-0.5" />
            <span className="leading-tight font-medium">
              Chùa Tu Hoàng, cách ĐHCN 900m
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-4">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
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
                className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-100/90 via-pink-50/80 to-sky-100/70 text-pink-700 shadow-xs border-l-4 border-pink-400'
                    : 'text-slate-600 hover:bg-pink-50/60 hover:text-pink-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive ? 'text-pink-600' : 'text-slate-400 group-hover:text-pink-500'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
