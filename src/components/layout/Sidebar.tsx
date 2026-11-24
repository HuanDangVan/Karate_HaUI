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
  MapPin,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { title: 'Quản lý học viên', href: '/hoc-vien', icon: Users },
  { title: 'Quản lý huấn luyện viên', href: '/huan-luyen-vien', icon: Award },
  { title: 'Quản lý lớp học', href: '/lop-hoc', icon: Shield },
  { title: 'Quản lý lịch tập', href: '/lich-tap', icon: CalendarDays },
  { title: 'Điểm danh', href: '/diem-danh', icon: ClipboardCheck },
  { title: 'Quản lý học phí', href: '/hoc-phi', icon: Wallet },
  { title: 'Thông báo', href: '/thong-bao', icon: Bell },
  { title: 'Thống kê', href: '/thong-ke', icon: BarChart3 },
  { title: 'Cài đặt', href: '/cai-dat', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="font-serif text-sm font-bold">空</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Karate-HaUI</p>
              <p className="truncate text-[11px] text-gray-500">
                ĐH Công Nghiệp Hà Nội
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Address */}
        <div className="border-b border-gray-100 px-4 py-2">
          <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="leading-tight">
              Chùa Tu Hoàng, cách ĐHCN 900m
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
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
