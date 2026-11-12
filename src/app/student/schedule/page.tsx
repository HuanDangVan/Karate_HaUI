
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    CalendarDays,
    Clock,
    MapPin,
    BookOpen,
    RefreshCw,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Filter,
} from 'lucide-react';

interface StudentSchedule {
    maLichTap: number;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string | null;
    noiDung: string | null;
    trangThai: string;
}

const statusInfo: Record<
    string,
    { label: string; color: string; icon: typeof Clock }
> = {
    da_len_lich: {
        label: 'Đã lên lịch',
        color: 'bg-blue-100 text-blue-700',
        icon: Clock,
    },
    da_hoan_thanh: {
        label: 'Đã hoàn thành',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle2,
    },
    da_huy: {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-700',
        icon: XCircle,
    },
};

const formatDate = (value: string) => {
    if (!value) return 'Chưa xác định';

    return new Date(value).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatTime = (value: string) => {
    if (!value) return '--:--';

    if (typeof value === 'string') {
        return value.slice(0, 5);
    }

    return String(value);
};

export default function StudentSchedulePage() {
    const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('tat_ca');

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/student/schedule');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Không thể tải thời khóa biểu.'
                );
            }

            setSchedules(result.data || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải thời khóa biểu.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const filteredSchedules = useMemo(() => {
        if (filter === 'tat_ca') return schedules;

        return schedules.filter(
            (item) => item.trangThai === filter
        );
    }, [schedules, filter]);

    const upcomingCount = schedules.filter(
        (item) => item.trangThai === 'da_len_lich'
    ).length;

    const completedCount = schedules.filter(
        (item) => item.trangThai === 'da_hoan_thanh'
    ).length;

    const cancelledCount = schedules.filter(
        (item) => item.trangThai === 'da_huy'
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-700 p-2.5 text-white">
                            <CalendarDays size={24} />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                Thời khóa biểu
                            </h1>
                            <p className="text-xs text-gray-500">
                                Câu lạc bộ Karate HaUI
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/student"
                        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        <ArrowLeft size={16} />
                        Quay lại
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Lịch tập của tôi
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Theo dõi thời gian và địa điểm các buổi tập của bạn.
                        </p>
                    </div>

                    <button
                        onClick={fetchSchedules}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? 'animate-spin' : ''}
                        />
                        Làm mới
                    </button>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Tổng số buổi tập
                            </span>
                            <CalendarDays size={22} className="text-red-600" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-900">
                            {schedules.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Đã lên lịch
                            </span>
                            <Clock size={22} className="text-blue-600" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-blue-600">
                            {upcomingCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Đã hoàn thành
                            </span>
                            <CheckCircle2 size={22} className="text-green-600" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-green-600">
                            {completedCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Đã hủy
                            </span>
                            <XCircle size={22} className="text-red-600" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-red-600">
                            {cancelledCount}
                        </p>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Filter size={18} />
                        Lọc lịch tập
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-red-500"
                    >
                        <option value="tat_ca">Tất cả trạng thái</option>
                        <option value="da_len_lich">Đã lên lịch</option>
                        <option value="da_hoan_thanh">Đã hoàn thành</option>
                        <option value="da_huy">Đã hủy</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-gray-500">
                        <RefreshCw size={30} className="mb-3 animate-spin" />
                        <p className="text-sm">Đang tải thời khóa biểu...</p>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <CalendarDays
                            size={42}
                            className="mx-auto mb-4 text-gray-300"
                        />
                        <h3 className="font-semibold text-gray-700">
                            {schedules.length === 0
                                ? 'Bạn chưa có lịch tập nào'
                                : 'Không có buổi tập phù hợp'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Lịch tập sẽ xuất hiện khi bạn được duyệt vào lớp học.
                        </p>
                        <Link
                            href="/student/my-classes"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
                        >
                            <BookOpen size={17} />
                            Xem lớp học của tôi
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSchedules.map((item) => {
                            const status = statusInfo[item.trangThai] || {
                                label: item.trangThai,
                                color: 'bg-gray-100 text-gray-700',
                                icon: AlertCircle,
                            };

                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={item.maLichTap}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                        <div className="flex gap-4">
                                            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-red-50 text-red-700">
                                                <CalendarDays size={22} />
                                            </div>

                                            <div>
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                        {item.maSoLop}
                                                    </span>
                                                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                                                        <StatusIcon size={14} />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {item.tenLop}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {formatDate(item.ngayTap)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-gray-50 px-5 py-3 sm:min-w-44">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock size={17} />
                                                <span className="text-xs">
                                                    Thời gian tập
                                                </span>
                                            </div>
                                            <p className="mt-1 text-lg font-bold text-gray-900">
                                                {formatTime(item.gioBatDau)}
                                                {' - '}
                                                {formatTime(item.gioKetThuc)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 border-t border-gray-100 px-5 py-4 sm:grid-cols-2 sm:px-6">
                                        <div className="flex items-start gap-3">
                                            <MapPin
                                                size={19}
                                                className="mt-0.5 text-red-600"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Địa điểm
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-800">
                                                    {item.diaDiem || 'Chưa cập nhật'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <BookOpen
                                                size={19}
                                                className="mt-0.5 text-red-600"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Nội dung buổi tập
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-800">
                                                    {item.noiDung || 'Chưa cập nhật'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
