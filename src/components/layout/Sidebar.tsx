'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Award,
  Shield,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  Bell,
  BarChart3,
  Settings,
  X,
  Flame,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Tổng quan',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Quản lý học viên',
    href: '/hoc-vien',
    icon: Users,
  },
  {
    title: 'Quản lý huấn luyện viên',
    href: '/huan-luyen-vien',
    icon: Award,
  },
  {
    title: 'Quản lý lớp học',
    href: '/lop-hoc',
    icon: Shield,
  },
  {
    title: 'Quản lý lịch tập',
    href: '/lich-tap',
    icon: CalendarDays,
  },
  {
    title: 'Điểm danh',
    href: '/diem-danh',
    icon: ClipboardCheck,
    badge: '',
  },
  {
    title: 'Quản lý học phí',
    href: '/hoc-phi',
    icon: Wallet,
  },
  {
    title: 'Thông báo',
    href: '/thong-bao',
    icon: Bell,
    badge: '',
  },
  {
    title: 'Thống kê',
    href: '/thong-ke',
    icon: BarChart3,
  },
  {
    title: 'Cài đặt',
    href: '/cai-dat',
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Container: Ít trắng, nền pastel hồng nhạt - xanh nhạt có chiều sâu */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r-2 border-pink-200/90 bg-gradient-to-b from-rose-50/95 via-pink-50/90 to-sky-50/95 text-slate-800 shadow-sm backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-pink-200/80 px-5 bg-gradient-to-r from-pink-100/70 via-rose-50/60 to-sky-100/70">
          <div className="flex items-center gap-3">
            {/* Karate Martial Emblem: Điểm nhấn Đỏ Võ Đạo + Hồng Xanh Pastel */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 via-rose-500 to-pink-500 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400">
              <span className="font-serif text-lg font-black tracking-tighter">空</span>
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-red-300">
                <Flame className="h-2.5 w-2.5 text-red-600" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-red-700">
                  Karate-HaUI
                </span>
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                  CLB
                </span>
              </div>
              <p className="truncate text-[11px] font-bold tracking-wide text-sky-800">
                Đại học Công Nghiệp Hà Nội
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Club Address & Affiliation Strip */}
        <div className="border-b border-pink-200/80 bg-gradient-to-r from-red-50/70 via-pink-50/80 to-sky-50/70 px-4 py-2.5">
          <div className="flex items-start gap-1.5 text-[11px] text-slate-700">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-red-600 mt-0.5" />
            <span className="leading-tight font-semibold" title="Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m">
              Chùa Tu Hoàng, cách ĐH Công Nghiệp 900m
            </span>
          </div>
          <p className="mt-1 text-[10px] font-black tracking-wider text-red-700 uppercase">
            Tâm • Trí • Dũng — Karate-dō
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-4">
          <div className="px-3 pb-2 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
            Quản trị CLB
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`group relative flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 text-white shadow-md shadow-red-500/20'
                    : 'text-slate-700 hover:bg-pink-100/70 hover:text-red-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive ? 'text-white' : 'text-red-500/70 group-hover:text-red-600'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-600 text-white shadow-xs'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
