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

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setNotificationError('');

    try {
      const apiUrl =
        variant === 'coach'
          ? '/api/coach/notifications'
          : '/api/notifications';

      const response = await fetch(apiUrl, { cache: 'no-store' });
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

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-gray-900 sm:text-lg">
            {pageTitle}
          </h1>
          <p className="hidden text-xs text-gray-500 lg:block">
            Karate-HaUI — Đại học Công Nghiệp Hà Nội
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 xl:flex">
          <Calendar className="h-3.5 w-3.5" />
          <span className="capitalize">{currentDate}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            title="Xem thông báo"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-96">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Thông báo
                  </h4>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {notifications.length} thông báo
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={fetchNotifications}
                    disabled={loadingNotifications}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
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
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
                    title="Đóng"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {unreadCount > 0 && (
                <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
                  <p className="text-xs text-blue-700">
                    {unreadCount} lượt chưa đọc
                  </p>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-xs text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang tải thông báo...
                  </div>
                ) : notificationError ? (
                  <div className="p-5 text-center">
                    <p className="text-xs text-red-600">{notificationError}</p>
                    <button
                      onClick={fetchNotifications}
                      className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-xs text-gray-500">
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
                      className="block w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-1 text-xs font-medium text-gray-800">
                          {item.tieuDe}
                        </p>

                        {(variant === 'coach'
                          ? !item.daDoc
                          : item.soNguoiChuaDoc > 0) && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-[11px] text-gray-500">
                        {item.noiDung}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-gray-400">
                        <span className="truncate">
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

              <button
                onClick={() => {
                  setShowNotifications(false);
                  router.push(
                    variant === 'coach'
                      ? '/coach/notifications'
                      : '/thong-bao'
                  );
                }}
                className="w-full border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs font-medium text-blue-600 hover:bg-gray-100"
              >
                Xem tất cả thông báo →
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative pl-2 sm:border-l sm:border-gray-200">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-1 text-left hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials}
            </div>

            <div className="hidden sm:block">
              <p className="max-w-[140px] truncate text-sm font-medium text-gray-900">
                {user.name}
              </p>
              <p className="text-[11px] text-gray-500">
                {user.role === 'quan_tri_vien'
                  ? 'Quản trị viên'
                  : user.role === 'huan_luyen_vien'
                  ? 'Huấn luyện viên'
                  : user.role}
              </p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <div className="border-b border-gray-100 px-2 pb-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-gray-500">
                  {user.email}
                </p>
                <span className="mt-1.5 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {variant === 'coach'
                    ? 'Huấn luyện viên'
                    : 'Quản trị viên'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification detail modal */}
      {(loadingDetail || selectedNotification || detailError) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-5">
              <h3 className="text-base font-semibold text-gray-900">
                Chi tiết thông báo
              </h3>

              <button
                onClick={() => {
                  setSelectedNotification(null);
                  setDetailError('');
                  setMarkReadMessage('');
                }}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
                title="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Đang tải nội dung...
              </div>
            ) : detailError ? (
              <div className="p-6 text-sm text-red-600">{detailError}</div>
            ) : selectedNotification ? (
              <div className="p-5">
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedNotification.tieuDe}
                </h4>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>Người tạo: {selectedNotification.tenNguoiTao}</span>
                  <span>{formatDate(selectedNotification.ngayTao)}</span>
                </div>

                <div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm leading-7 text-gray-700">
                  {selectedNotification.noiDung}
                </div>

                {markReadMessage && (
                  <div className="mt-3 text-xs text-gray-500">
                    {markReadMessage}
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      setMarkReadMessage('');
                    }}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
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
