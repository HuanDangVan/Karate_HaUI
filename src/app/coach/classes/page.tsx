
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Users,
    BookOpen,
    GraduationCap,
    RefreshCw,
    Eye,
    ChevronRight,
    Filter,
    AlertCircle,
    X,
    Layers,
} from 'lucide-react';
import type { ClassItem, ClassStatus } from '@/types/class';

type StatusFilter = 'tat_ca' | ClassStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'tat_ca', label: 'Tất cả trạng thái' },
    { value: 'hoat_dong', label: 'Đang hoạt động' },
    { value: 'tam_dung', label: 'Tạm dừng' },
    { value: 'ngung_hoat_dong', label: 'Ngừng hoạt động' },
];

const STATUS_CONFIG: Record<
    ClassStatus,
    { label: string; className: string; dot: string }
> = {
    hoat_dong: {
        label: 'Đang hoạt động',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        dot: 'bg-emerald-500',
    },
    tam_dung: {
        label: 'Tạm dừng',
        className: 'bg-amber-50 text-amber-700 ring-amber-200',
        dot: 'bg-amber-500',
    },
    ngung_hoat_dong: {
        label: 'Ngừng hoạt động',
        className: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
        dot: 'bg-zinc-400',
    },
};

export default function CoachClassesPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>('tat_ca');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadClasses = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/coach/classes');

            const result = await response.json();

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Không thể tải danh sách lớp học.',
                );
            }

            setClasses(result.data || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải dữ liệu.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    const filteredClasses = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return classes.filter((item) => {
            const matchesSearch =
                !keyword ||
                item.maSoLop.toLowerCase().includes(keyword) ||
                item.tenLop.toLowerCase().includes(keyword) ||
                (item.capDo || '').toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === 'tat_ca' ||
                item.trangThai === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [classes, search, statusFilter]);

    const totalStudents = classes.reduce(
        (total, item) => total + item.siSoHienTai,
        0,
    );

    const activeClasses = classes.filter(
        (item) => item.trangThai === 'hoat_dong',
    ).length;

    const totalCapacity = classes.reduce(
        (total, item) => total + item.siSoToiDa,
        0,
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('tat_ca');
    };

    return (
        <div className="min-h-screen space-y-6 bg-zinc-100 p-4 font-sans text-zinc-900 sm:p-6 lg:p-8">

            {/* HEADER */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 ring-1 ring-blue-400/30">
                            <BookOpen className="h-3.5 w-3.5" />
                            Khu vực chuyên môn
                        </div>

                        <h1 className="text-2xl font-black sm:text-3xl">
                            Lớp học phụ trách
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300">
                            Quản lý thông tin các lớp học được phân công,
                            theo dõi sĩ số và danh sách học viên.
                        </p>
                    </div>

                    <div className="hidden rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 sm:block">
                        <GraduationCap className="h-12 w-12 text-amber-400" />
                    </div>
                </div>
            </section>

            {/* ERROR */}
            {error && (
                <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>

                    <button
                        onClick={loadClasses}
                        className="flex items-center gap-2 font-bold hover:text-red-900"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Thử lại
                    </button>
                </div>
            )}

            {/* STATISTICS */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Tổng số lớp
                        </span>
                        <div className="rounded-xl bg-blue-50 p-2">
                            <Layers className="h-5 w-5 text-blue-700" />
                        </div>
                    </div>

                    <p className="mt-3 text-3xl font-black">
                        {loading ? '...' : classes.length}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        Các lớp được phân công
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Lớp hoạt động
                        </span>
                        <div className="rounded-xl bg-emerald-50 p-2">
                            <BookOpen className="h-5 w-5 text-emerald-700" />
                        </div>
                    </div>

                    <p className="mt-3 text-3xl font-black">
                        {loading ? '...' : activeClasses}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        Lớp đang trong quá trình huấn luyện
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Tổng học viên
                        </span>
                        <div className="rounded-xl bg-violet-50 p-2">
                            <Users className="h-5 w-5 text-violet-700" />
                        </div>
                    </div>

                    <p className="mt-3 text-3xl font-black">
                        {loading ? '...' : totalStudents}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        Sức chứa tối đa: {loading ? '...' : totalCapacity}
                    </p>
                </div>
            </section>

            {/* SEARCH AND FILTER */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <h2 className="text-base font-bold">
                            Danh sách lớp học
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            Danh sách các lớp do bạn trực tiếp phụ trách.
                        </p>
                    </div>

                    <button
                        onClick={loadClasses}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>

                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo mã lớp, tên lớp hoặc cấp độ..."
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />

                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                aria-label="Xóa tìm kiếm"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="relative md:w-64">
                        <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as StatusFilter)
                            }
                            className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                    <span>
                        Hiển thị <strong className="text-zinc-900">{filteredClasses.length}</strong> / {classes.length} lớp
                    </span>

                    {(search || statusFilter !== 'tat_ca') && (
                        <button
                            onClick={clearFilters}
                            className="font-semibold text-blue-700 hover:text-blue-900"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </section>

            {/* CLASS LIST */}
            <section>
                {loading ? (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5"
                            >
                                <div className="h-5 w-1/3 rounded bg-zinc-200" />
                                <div className="mt-4 h-4 w-2/3 rounded bg-zinc-100" />
                                <div className="mt-6 h-20 rounded-xl bg-zinc-100" />
                            </div>
                        ))}
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                            <BookOpen className="h-8 w-8 text-zinc-400" />
                        </div>

                        <h3 className="mt-4 text-base font-bold text-zinc-800">
                            {classes.length === 0
                                ? 'Bạn chưa được phân công lớp học'
                                : 'Không tìm thấy lớp học'}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                            {classes.length === 0
                                ? 'Các lớp học được quản trị viên phân công sẽ xuất hiện tại đây.'
                                : 'Không có lớp học nào phù hợp với điều kiện tìm kiếm.'}
                        </p>

                        {(search || statusFilter !== 'tat_ca') && (
                            <button
                                onClick={clearFilters}
                                className="mt-5 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {filteredClasses.map((item) => {
                            const status = STATUS_CONFIG[item.trangThai];
                            const percentage =
                                item.siSoToiDa > 0
                                    ? Math.min(
                                        100,
                                        (item.siSoHienTai / item.siSoToiDa) * 100,
                                    )
                                    : 0;

                            return (
                                <div
                                    key={item.maLop}
                                    className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                                >
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                    {item.maSoLop}
                                                </span>

                                                <h3 className="mt-3 text-lg font-black text-zinc-900">
                                                    {item.tenLop}
                                                </h3>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {item.capDo || 'Chưa cập nhật cấp độ'}
                                                </p>
                                            </div>

                                            <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ${status.className}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="mt-5 rounded-xl bg-zinc-50 p-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 text-zinc-600">
                                                    <Users className="h-4 w-4" />
                                                    Sĩ số học viên
                                                </span>

                                                <span className="font-bold text-zinc-900">
                                                    {item.siSoHienTai}/{item.siSoToiDa}
                                                </span>
                                            </div>

                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                                                <div
                                                    className="h-full rounded-full bg-blue-600 transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>

                                            <p className="mt-2 text-right text-[11px] text-zinc-500">
                                                {percentage.toFixed(0)}% sức chứa
                                            </p>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-zinc-100 p-3">
                                                <p className="text-[11px] text-zinc-500">
                                                    Học phí mỗi buổi
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-zinc-900">
                                                    {formatCurrency(item.donGiaMoiBuoi)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-zinc-100 p-3">
                                                <p className="text-[11px] text-zinc-500">
                                                    Chỉ tiêu còn lại
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-zinc-900">
                                                    {Math.max(0, item.siSoToiDa - item.siSoHienTai)} học viên
                                                </p>
                                            </div>
                                        </div>

                                        {item.moTa && (
                                            <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                                                {item.moTa}
                                            </p>
                                        )}

                                        <div className="mt-5 border-t border-zinc-100 pt-4">
                                            <Link
                                                href={`/coach/classes/${item.maLop}`}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Xem chi tiết lớp học
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
