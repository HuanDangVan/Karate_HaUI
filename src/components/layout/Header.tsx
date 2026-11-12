'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Menu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  LogOut,
  ChevronDown,
  X,
  RefreshCw,
  MapPin,
  Flame,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
  pageTitle?: string;
  variant?: 'admin' | 'coach';
}

interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

interface NotificationItem {
  maThongBao: number;
  tieuDe: string;
  noiDung: string;
  tenNguoiTao: string;
  ngayTao: string;
  tongNguoiNhan: number;
  soNguoiDaDoc: number;
  soNguoiChuaDoc: number;
  daDoc?: boolean;
  thoiGianDoc?: string | null;
}

export function Header({
  onOpenSidebar,
  pageTitle = 'Tổng quan hệ thống',
  variant = 'admin',
}: HeaderProps) {
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [currentDate, setCurrentDate] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [markReadMessage, setMarkReadMessage] = useState('');
  const [user, setUser] = useState<CurrentUser>({
    name: 'Admin',
    email: 'admin.karate@haui.edu.vn',
    role: 'quan_tri_vien',
  });

  // Cập nhật ngày tháng theo thời gian thực
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

    const interval = setInterval(updateDate, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Lấy thông tin tài khoản
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Lấy danh sách thông báo từ SQL Server
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setNotificationError('');

    try {
      const apiUrl =
        variant === 'coach'
          ? '/api/coach/notifications'
          : '/api/notifications';

      const response = await fetch(apiUrl, {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Không thể tải thông báo.');
      }

      setNotifications(data.data || []);
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Không thể tải thông báo.'
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Chỉ tải thông báo khi mở chuông
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  // Tổng số lượt chưa đọc của tất cả người nhận
  const unreadCount =
    variant === 'coach'
      ? notifications.filter((item) => !item.daDoc).length
      : notifications.reduce(
          (total, item) => total + item.soNguoiChuaDoc,
          0
        );

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  // Lấy 2 chữ cái đầu làm avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'AD';

  const formatDate = (date: string) => {
    if (!date) return '';

    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewNotification = async (id: number) => {
    setLoadingDetail(true);
    setDetailError('');
    setMarkReadMessage('');
    setSelectedNotification(null);
    setShowNotifications(false);

    try {
      if (variant === 'coach') {
        const notification = notifications.find(
          (item) => item.maThongBao === id
        );

        if (!notification) {
          throw new Error('Không tìm thấy thông báo.');
        }

        setSelectedNotification(notification);

        if (!notification.daDoc) {
          const response = await fetch(
            `/api/coach/notifications/${id}`,
            { method: 'PATCH' }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message || 'Không thể đánh dấu đã đọc.'
            );
          }

          setNotifications((previous) =>
            previous.map((item) =>
              item.maThongBao === id
                ? {
                    ...item,
                    daDoc: true,
                    thoiGianDoc: new Date().toISOString(),
                  }
                : item
            )
          );

          setSelectedNotification({
            ...notification,
            daDoc: true,
            thoiGianDoc: new Date().toISOString(),
          });

          setMarkReadMessage('Đã đánh dấu là đã đọc.');
        } else {
          setMarkReadMessage('Thông báo này đã được đọc.');
        }

        return;
      }

      const response = await fetch(`/api/notifications/${id}`, {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Không thể tải nội dung thông báo.');
      }

      setSelectedNotification(data.data);

      const readResponse = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      });

      const readData = await readResponse.json();

      if (readResponse.ok && readData.success) {
        setMarkReadMessage('Đã đánh dấu là đã đọc.');

        setNotifications((previous) =>
          previous.map((item) =>
            item.maThongBao === id
              ? {
                  ...item,
                  soNguoiChuaDoc: Math.max(0, item.soNguoiChuaDoc - 1),
                  soNguoiDaDoc: item.soNguoiDaDoc + 1,
                }
              : item
          )
        );
      } else {
        setMarkReadMessage(
          readData.message ||
            'Không thể cập nhật trạng thái đọc cho tài khoản này.'
        );
      }
    } catch (error) {
      setDetailError(
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi mở thông báo.'
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-pink-200/90 bg-gradient-to-r from-rose-100/95 via-pink-100/90 to-sky-100/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 shadow-xs">
      {/* Bên trái: Nút mở menu di động + Tiêu đề trang & Huy hiệu CLB phong phú màu sắc */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 lg:hidden transition-colors shadow-xs"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5 text-red-600" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-slate-800">
              {pageTitle}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-sky-500 px-3 py-0.5 text-[11px] font-black text-white shadow-xs ring-1 ring-red-300">
              <Flame className="h-3 w-3 text-yellow-300" />
              Karate-HaUI
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="font-extrabold text-sky-800">
              Đại học Công Nghiệp Hà Nội
            </span>
            <span className="text-red-400 font-bold">•</span>
            <span className="flex items-center gap-1 text-slate-700 font-semibold bg-white/40 px-2.5 py-0.5 rounded-full ring-1 ring-pink-200">
              <MapPin className="h-3 w-3 text-red-600" />
              Chùa Tu Hoàng, cách ĐHCN 900m
            </span>
          </div>
        </div>
      </div>

      {/* Bên phải */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Ngày hiện tại */}
        <div className="hidden items-center gap-1.5 rounded-2xl border border-pink-200 bg-white/60 px-3.5 py-1.5 text-xs text-slate-700 shadow-xs xl:flex font-semibold">
          <Calendar className="h-3.5 w-3.5 text-red-600" />
          <span className="capitalize">{currentDate}</span>
        </div>

        {/* Chuông thông báo */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-pink-200 bg-white/80 text-slate-700 transition-all hover:border-red-400 hover:bg-red-50 hover:text-red-600 shadow-xs"
            title="Xem thông báo"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-3xl border-2 border-pink-300 bg-gradient-to-b from-rose-50 via-pink-50 to-sky-50 shadow-2xl shadow-red-500/10 sm:w-96">
              {/* Tiêu đề */}
              <div className="flex items-center justify-between border-b border-pink-200 p-4 bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 text-white">
                <div>
                  <h4 className="text-sm font-black flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-yellow-300" />
                    Thông báo Karate-HaUI
                  </h4>
                  <p className="mt-0.5 text-[11px] text-pink-100 font-medium">
                    {notifications.length} thông báo
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchNotifications}
                    disabled={loadingNotifications}
                    className="rounded-lg p-2 text-white/80 hover:bg-white/20 disabled:opacity-50"
                    title="Tải lại"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        loadingNotifications ? 'animate-spin' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => setShowNotifications(false)}
                    className="rounded-lg p-2 text-white/80 hover:bg-white/20"
                    title="Đóng"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Số lượt chưa đọc */}
              <div className="border-b border-pink-200 bg-red-50 px-4 py-2">
                <p className="text-xs font-bold text-red-700">
                  {unreadCount} lượt chưa đọc trong danh sách
                </p>
              </div>

              {/* Danh sách */}
              <div className="max-h-80 overflow-y-auto divide-y divide-pink-100">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-500">
                    <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                    Đang tải thông báo...
                  </div>
                ) : notificationError ? (
                  <div className="p-5 text-center">
                    <p className="text-xs text-red-600 font-semibold">
                      {notificationError}
                    </p>
                    <button
                      onClick={fetchNotifications}
                      className="mt-2 text-xs font-bold text-red-700 hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-pink-300" />
                    <p className="mt-2 text-xs text-slate-500">
                      Chưa có thông báo nào.
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((item) => (
                    <button
                      key={item.maThongBao}
                      onClick={() =>
                        handleViewNotification(item.maThongBao)
                      }
                      className="block w-full px-4 py-3 text-left transition-colors hover:bg-white/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-1 text-xs font-bold text-slate-800">
                          {item.tieuDe}
                        </p>

                        {(variant === 'coach'
                          ? !item.daDoc
                          : item.soNguoiChuaDoc > 0) && (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600 ring-2 ring-red-200" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
                        {item.noiDung}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                        <span className="truncate font-semibold text-sky-800">
                          {item.tenNguoiTao}
                        </span>
                        <span className="shrink-0">
                          {formatDate(item.ngayTao)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Xem tất cả */}
              <button
                onClick={() => {
                  setShowNotifications(false);
                  router.push(
                    variant === 'coach'
                      ? '/coach/notifications'
                      : '/thong-bao'
                  );
                }}
                className="w-full border-t border-pink-200 bg-white/70 px-4 py-3 text-center text-xs font-bold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                Xem tất cả thông báo →
              </button>
            </div>
          )}
        </div>

        {/* Tài khoản: Avatar đỏ & hồng xanh */}
        <div className="relative pl-2 sm:border-l sm:border-pink-200">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex cursor-pointer items-center gap-3 rounded-2xl p-1 text-left transition-colors hover:bg-white/50"
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-sky-500 font-black text-white shadow-sm ring-2 ring-red-300">
                <span className="text-xs font-black">{initials}</span>
              </div>

              <div
                className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white ring-1 ring-white"
                title="Tài khoản hệ thống"
              >
                <ShieldCheck className="h-2.5 w-2.5 text-yellow-300" />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <p className="max-w-[140px] truncate text-sm font-extrabold leading-tight text-slate-800">
                  {user.name}
                </p>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              </div>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-red-600">
                  {user.role === 'quan_tri_vien'
                    ? 'Quản trị viên'
                    : user.role === 'huan_luyen_vien'
                    ? 'Huấn luyện viên'
                    : user.role}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-3xl border-2 border-pink-300 bg-gradient-to-b from-rose-50 via-pink-50 to-sky-50 p-3.5 shadow-2xl shadow-red-500/10">
              <div className="border-b border-pink-200 px-2 pb-3">
                <p className="text-xs font-black text-slate-800">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-slate-600">
                  {user.email}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                  {variant === 'coach'
                    ? 'Tài khoản Huấn luyện viên'
                    : 'Tài khoản Quản trị viên'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-100/70"
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  <span>Đăng xuất khỏi hệ thống</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cửa sổ chi tiết thông báo */}
      {(loadingDetail || selectedNotification || detailError) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border-2 border-pink-300 bg-gradient-to-b from-rose-50 to-sky-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pink-200 p-5 bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 text-white">
              <h3 className="text-base font-black flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-yellow-300" />
                Chi tiết thông báo
              </h3>

              <button
                onClick={() => {
                  setSelectedNotification(null);
                  setDetailError('');
                  setMarkReadMessage('');
                }}
                className="rounded-lg p-2 text-white/80 hover:bg-white/20"
                title="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-600">
                <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                Đang tải nội dung...
              </div>
            ) : detailError ? (
              <div className="p-6 text-sm text-red-600 font-semibold">{detailError}</div>
            ) : selectedNotification ? (
              <div className="p-5">
                <h4 className="text-lg font-bold text-slate-800">
                  {selectedNotification.tieuDe}
                </h4>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="font-semibold text-sky-800">Người tạo: {selectedNotification.tenNguoiTao}</span>
                  <span>{formatDate(selectedNotification.ngayTao)}</span>
                </div>

                <div className="mt-5 max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-white/70 border border-pink-200 p-4 text-sm leading-7 text-slate-700 shadow-inner">
                  {selectedNotification.noiDung}
                </div>

                <div className="mt-4 text-xs font-semibold text-slate-600">
                  {markReadMessage}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      setMarkReadMessage('');
                    }}
                    className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-sky-600 transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
