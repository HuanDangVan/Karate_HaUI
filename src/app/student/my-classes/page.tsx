
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Users,
    UserRound,
    CalendarDays,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';

interface MyClass {
    maDangKy: number;
    ngayDangKy: string;
    trangThai: string;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    moTa: string | null;
    capDo: string | null;
    siSoToiDa: number;
    donGiaMoiBuoi: number;
    tenHuanLuyenVien: string | null;
    siSoHienTai: number;
}

const statusInfo: Record<
    string,
    { label: string; color: string; icon: typeof Clock }
> = {
    cho_duyet: {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock,
    },
    dang_hoc: {
        label: 'Đang học',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle2,
    },
    tu_choi: {
        label: 'Bị từ chối',
        color: 'bg-red-100 text-red-700',
        icon: XCircle,
    },
};

const formatDate = (value: string) => {
    if (!value) return 'Chưa có thông tin';

    return new Date(value).toLocaleDateString('vi-VN');
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ';

export default function MyClassesPage() {
    const [classes, setClasses] = useState<MyClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMyClasses = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/student/my-classes');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Không thể tải danh sách lớp học.'
                );
            }

            setClasses(result.data || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải dữ liệu.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyClasses();
    }, [fetchMyClasses]);

    const pendingCount = classes.filter(
        (item) => item.trangThai === 'cho_duyet'
    ).length;

    const approvedCount = classes.filter(
        (item) => item.trangThai === 'dang_hoc'
    ).length;

    const rejectedCount = classes.filter(
        (item) => item.trangThai === 'tu_choi'
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-700 p-2.5 text-white">
                            <BookOpen size={24} />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                Lớp học của tôi
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
                            Danh sách lớp đã đăng ký
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Theo dõi các yêu cầu đăng ký và lớp học của bạn.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/student/classes"
                            className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
                        >
                            <BookOpen size={17} />
                            Đăng ký lớp mới
                        </Link>

                        <button
                            onClick={fetchMyClasses}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? 'animate-spin' : ''}
                            />
                            Làm mới
                        </button>
                    </div>
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
                                Tổng số đăng ký
                            </span>
                            <BookOpen className="text-red-600" size={22} />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-900">
                            {classes.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Chờ duyệt
                            </span>
                            <Clock className="text-yellow-600" size={22} />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-yellow-600">
                            {pendingCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Đã được duyệt
                            </span>
                            <CheckCircle2 className="text-green-600" size={22} />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-green-600">
                            {approvedCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Bị từ chối
                            </span>
                            <XCircle className="text-red-600" size={22} />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-red-600">
                            {rejectedCount}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-gray-500">
                        <RefreshCw
                            size={30}
                            className="mb-3 animate-spin"
                        />
                        <p className="text-sm">Đang tải danh sách lớp học...</p>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <BookOpen
                            size={42}
                            className="mx-auto mb-4 text-gray-300"
                        />
                        <h3 className="font-semibold text-gray-700">
                            Bạn chưa đăng ký lớp học nào
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Hãy tìm lớp học phù hợp và gửi yêu cầu đăng ký.
                        </p>
                        <Link
                            href="/student/classes"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
                        >
                            <BookOpen size={17} />
                            Khám phá lớp học
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {classes.map((item) => {
                            const status = statusInfo[item.trangThai] || {
                                label: item.trangThai,
                                color: 'bg-gray-100 text-gray-700',
                                icon: AlertCircle,
                            };

                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={item.maDangKy}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                                >
                                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                        <div className="flex gap-4">
                                            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700 sm:flex">
                                                <BookOpen size={27} />
                                            </div>

                                            <div>
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                        {item.maSoLop}
                                                    </span>

                                                    {item.capDo && (
                                                        <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                                            {item.capDo}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {item.tenLop}
                                                </h3>

                                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                                                    {item.moTa || 'Chưa có mô tả lớp học.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${status.color}`}>
                                            <StatusIcon size={17} />
                                            {status.label}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="flex items-center gap-3">
                                            <UserRound
                                                size={19}
                                                className="text-red-600"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Huấn luyện viên
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-800">
                                                    {item.tenHuanLuyenVien || 'Chưa phân công'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Users
                                                size={19}
                                                className="text-red-600"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Sĩ số lớp
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-800">
                                                    {item.siSoHienTai}/{item.siSoToiDa}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CalendarDays
                                                size={19}
                                                className="text-red-600"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Ngày đăng ký
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-800">
                                                    {formatDate(item.ngayDangKy)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <BookOpen
                                                size={19}
                                                className="text-red-600"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Học phí mỗi buổi
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-800">
                                                    {formatCurrency(item.donGiaMoiBuoi)}
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
