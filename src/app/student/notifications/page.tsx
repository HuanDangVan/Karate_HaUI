
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Bell,
    CheckCheck,
    CheckCircle2,
    Clock,
    RefreshCw,
    Search,
    UserRound,
    MailOpen,
    Mail,
    X,
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

type FilterType = 'tat_ca' | 'chua_doc' | 'da_doc';

const formatDate = (value: string) => {
    if (!value) return 'Không rõ thời gian';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
};

export default function StudentNotificationsPage() {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState<FilterType>('tat_ca');
    const [selected, setSelected] = useState<NotificationItem | null>(null);
    const [marking, setMarking] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/student/notifications', {
                cache: 'no-store',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tải thông báo.');
            }

            setItems(Array.isArray(result.data) ? result.data : []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải thông báo.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const unreadCount = items.filter((item) => !item.daDoc).length;
    const readCount = items.length - unreadCount;

    const filteredItems = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return items.filter((item) => {
            const matchesKeyword =
                !normalizedKeyword ||
                item.tieuDe.toLowerCase().includes(normalizedKeyword) ||
                item.noiDung.toLowerCase().includes(normalizedKeyword) ||
                item.tenNguoiTao.toLowerCase().includes(normalizedKeyword);

            const matchesFilter =
                filter === 'tat_ca' ||
                (filter === 'chua_doc' && !item.daDoc) ||
                (filter === 'da_doc' && item.daDoc);

            return matchesKeyword && matchesFilter;
        });
    }, [items, keyword, filter]);

    const markAsRead = async (item: NotificationItem) => {
        if (item.daDoc || marking) return;

        try {
            setMarking(true);

            const response = await fetch('/api/student/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    maThongBao: item.maThongBao,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể cập nhật thông báo.');
            }

            setItems((previous) =>
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
            alert(
                err instanceof Error
                    ? err.message
                    : 'Không thể đánh dấu thông báo đã đọc.',
            );
        } finally {
            setMarking(false);
        }
    };

    const openNotification = async (item: NotificationItem) => {
        setSelected(item);

        if (!item.daDoc) {
            await markAsRead(item);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/student"
                            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
                        >
                            <ArrowLeft size={16} />
                            Quay lại trang chủ
                        </Link>

                        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                            Thông báo của tôi
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Theo dõi thông báo từ câu lạc bộ và huấn luyện viên.
                        </p>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? 'animate-spin' : ''}
                        />
                        Làm mới
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Tổng thông báo</p>
                            <Bell size={22} className="text-blue-500" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-800">
                            {items.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Chưa đọc</p>
                            <Mail size={22} className="text-orange-500" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-orange-600">
                            {unreadCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Đã đọc</p>
                            <CheckCircle2 size={22} className="text-green-500" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-green-600">
                            {readCount}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Tìm theo tiêu đề, nội dung hoặc người gửi..."
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <select
                            value={filter}
                            onChange={(event) => setFilter(event.target.value as FilterType)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="tat_ca">Tất cả thông báo</option>
                            <option value="chua_doc">Chưa đọc</option>
                            <option value="da_doc">Đã đọc</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-800">
                                Danh sách thông báo
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {filteredItems.length} thông báo
                            </p>
                        </div>
                        <Bell size={22} className="text-slate-400" />
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-slate-500">
                            Đang tải thông báo...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center p-12 text-center">
                            <Bell size={42} className="text-slate-300" />
                            <p className="mt-3 font-medium text-slate-700">
                                Không có thông báo
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                Thông báo gửi đến bạn sẽ xuất hiện tại đây.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.maThongBao}
                                    onClick={() => openNotification(item)}
                                    className={`w-full p-5 text-left transition hover:bg-slate-50 ${!item.daDoc ? 'bg-blue-50/40' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 rounded-full p-3 ${item.daDoc
                                                ? 'bg-slate-100 text-slate-500'
                                                : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {item.daDoc ? (
                                                <MailOpen size={20} />
                                            ) : (
                                                <Mail size={20} />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className={`font-semibold ${item.daDoc
                                                        ? 'text-slate-700'
                                                        : 'text-slate-900'
                                                    }`}>
                                                    {item.tieuDe}
                                                </h3>

                                                {!item.daDoc && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Mới
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                                {item.noiDung}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <UserRound size={13} />
                                                    {item.tenNguoiTao}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={13} />
                                                    {formatDate(item.ngayTao)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="flex items-start justify-between border-b border-slate-100 p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                    <Bell size={22} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">
                                        Chi tiết thông báo
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {formatDate(selected.ngayTao)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Đóng"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <h3 className="text-xl font-bold text-slate-800">
                                {selected.tieuDe}
                            </h3>

                            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                                {selected.noiDung}
                            </div>

                            <div className="rounded-lg bg-slate-50 p-4 text-sm">
                                <p className="text-slate-500">Người gửi</p>
                                <p className="mt-1 font-medium text-slate-800">
                                    {selected.tenNguoiTao}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className={`text-sm font-medium ${selected.daDoc ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    {selected.daDoc ? 'Đã đọc' : 'Chưa đọc'}
                                </span>

                                {!selected.daDoc && (
                                    <button
                                        onClick={() => markAsRead(selected)}
                                        disabled={marking}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <CheckCheck size={16} />
                                        {marking ? 'Đang cập nhật...' : 'Đánh dấu đã đọc'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
