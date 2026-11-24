
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    BellRing,
    CheckCheck,
    CheckCircle2,
    Clock,
    Eye,
    RefreshCw,
    X,
    AlertCircle,
    Inbox,
} from 'lucide-react';

interface NotificationItem {
    maThongBao: number;
    tieuDe: string;
    noiDung: string;
    nguoiTao: number;
    tenNguoiTao: string;
    ngayTao: string;
    tongNguoiNhan: number;
    soNguoiDaDoc: number;
    soNguoiChuaDoc: number;
    daDoc: boolean;
    thoiGianDoc: string | null;
}

function formatDate(value: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function CoachNotificationsPage() {
    const router = useRouter();

    const [notifications, setNotifications] =
        useState<NotificationItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('tat_ca');

    const [selected, setSelected] =
        useState<NotificationItem | null>(null);

    const [updating, setUpdating] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/coach/notifications');

            if (response.status === 401) {
                router.push('/login');
                return;
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Không thể tải thông báo.',
                );
            }

            setNotifications(result.data || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải thông báo.',
            );
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const unreadCount = notifications.filter(
        (item) => !item.daDoc,
    ).length;

    const readCount = notifications.length - unreadCount;

    const filteredNotifications = notifications.filter((item) => {
        if (filter === 'chua_doc') return !item.daDoc;
        if (filter === 'da_doc') return item.daDoc;
        return true;
    });

    async function handleMarkAsRead(item: NotificationItem) {
        if (item.daDoc || updating) return;

        setUpdating(true);

        try {
            const response = await fetch(
                `/api/coach/notifications/${item.maThongBao}`,
                { method: 'PATCH' },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Không thể cập nhật thông báo.',
                );
            }

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.maThongBao === item.maThongBao
                        ? {
                            ...notification,
                            daDoc: true,
                            thoiGianDoc: new Date().toISOString(),
                        }
                        : notification,
                ),
            );

            setSelected((previous) =>
                previous?.maThongBao === item.maThongBao
                    ? {
                        ...previous,
                        daDoc: true,
                        thoiGianDoc: new Date().toISOString(),
                    }
                    : previous,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể đánh dấu đã đọc.',
            );
        } finally {
            setUpdating(false);
        }
    }

    async function handleOpenNotification(item: NotificationItem) {
        setSelected(item);

        if (!item.daDoc) {
            await handleMarkAsRead(item);
        }
    }

    return (
        <div className="space-y-6">
            {/* Tiêu đề */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Thông báo
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Theo dõi các thông báo được gửi đến tài khoản của bạn.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? 'animate-spin' : ''}
                    />
                    Làm mới
                </button>
            </div>

            {/* Lỗi */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="ml-auto"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Thống kê */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Tổng thông báo
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-800">
                                {notifications.length}
                            </p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                            <Bell size={23} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Chưa đọc
                            </p>
                            <p className="mt-2 text-2xl font-bold text-red-600">
                                {unreadCount}
                            </p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-3">
                            <BellRing size={23} className="text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Đã đọc
                            </p>
                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {readCount}
                            </p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                            <CheckCheck size={23} className="text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-semibold text-gray-800">
                        Danh sách thông báo
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {filteredNotifications.length} thông báo
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        { value: 'tat_ca', label: 'Tất cả' },
                        { value: 'chua_doc', label: 'Chưa đọc' },
                        { value: 'da_doc', label: 'Đã đọc' },
                    ].map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setFilter(item.value)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === item.value
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Danh sách */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-sm text-gray-500">
                        <RefreshCw
                            size={25}
                            className="mx-auto mb-3 animate-spin text-blue-500"
                        />
                        Đang tải thông báo...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="py-16 text-center">
                        <Inbox
                            size={42}
                            className="mx-auto mb-3 text-gray-300"
                        />
                        <p className="font-medium text-gray-600">
                            Không có thông báo
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                            {filter === 'chua_doc'
                                ? 'Bạn đã đọc tất cả thông báo.'
                                : 'Hiện chưa có thông báo nào phù hợp.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((item) => (
                            <div
                                key={item.maThongBao}
                                className={`flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-start ${!item.daDoc ? 'bg-blue-50/40' : ''
                                    }`}
                            >
                                <div className="flex min-w-0 flex-1 gap-3">
                                    <div
                                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.daDoc
                                                ? 'bg-gray-100 text-gray-500'
                                                : 'bg-blue-100 text-blue-600'
                                            }`}
                                    >
                                        <Bell size={19} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className={`font-semibold ${item.daDoc
                                                    ? 'text-gray-700'
                                                    : 'text-gray-900'
                                                }`}>
                                                {item.tieuDe}
                                            </h3>

                                            {!item.daDoc && (
                                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                    Mới
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-gray-600">
                                            {item.noiDung}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                                            <span>
                                                Người gửi: {item.tenNguoiTao}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={13} />
                                                {formatDate(item.ngayTao)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2 sm:pt-1">
                                    {item.daDoc ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                            <CheckCircle2 size={15} />
                                            Đã đọc
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                                            <Clock size={15} />
                                            Chưa đọc
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleOpenNotification(item)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Eye size={15} />
                                        Xem
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="w-full max-w-xl rounded-xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-gray-100 p-5">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-blue-50 p-2">
                                    <Bell className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        Chi tiết thông báo
                                    </h2>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Mã thông báo: #{selected.maThongBao}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">
                                    Tiêu đề
                                </p>
                                <h3 className="mt-1 text-lg font-semibold text-gray-800">
                                    {selected.tieuDe}
                                </h3>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">
                                    Nội dung
                                </p>
                                <div className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                                    {selected.noiDung}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-100 p-4 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Người gửi
                                    </p>
                                    <p className="mt-1 font-medium text-gray-700">
                                        {selected.tenNguoiTao}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Thời gian gửi
                                    </p>
                                    <p className="mt-1 font-medium text-gray-700">
                                        {formatDate(selected.ngayTao)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Trạng thái
                                    </p>
                                    <p className={`mt-1 font-medium ${selected.daDoc
                                            ? 'text-green-600'
                                            : 'text-orange-600'
                                        }`}>
                                        {selected.daDoc ? 'Đã đọc' : 'Chưa đọc'}
                                    </p>
                                </div>

                                {selected.daDoc && (
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Thời gian đọc
                                        </p>
                                        <p className="mt-1 font-medium text-gray-700">
                                            {formatDate(selected.thoiGianDoc)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 p-5">
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Đóng
                            </button>

                            {!selected.daDoc && (
                                <button
                                    type="button"
                                    onClick={() => handleMarkAsRead(selected)}
                                    disabled={updating}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <CheckCheck size={16} />
                                    {updating ? 'Đang cập nhật...' : 'Đánh dấu đã đọc'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
