
'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Wallet,
    TrendingUp,
    AlertCircle,
    Users,
    Search,
    Filter,
    RefreshCw,
    CheckCircle2,
    Clock,
    X,
    ChevronDown,
    CalendarDays,
    GraduationCap,
    MapPin,
    Flame,
} from 'lucide-react';

import type {
    TuitionItem,
    TuitionSummary,
    TuitionStatus,
} from '@/types/tuition';

const formatMoney = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);

const currentDate = new Date();

const EMPTY_SUMMARY: TuitionSummary = {
    tongHocPhi: 0,
    daThu: 0,
    conNo: 0,
    soHocVien: 0,
};

export default function TuitionPage() {
    const [tuitionList, setTuitionList] = useState<TuitionItem[]>([]);
    const [summary, setSummary] = useState<TuitionSummary>(EMPTY_SUMMARY);

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');
    const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
    const [year, setYear] = useState(String(currentDate.getFullYear()));
    const [status, setStatus] = useState('');
    const [classId, setClassId] = useState('');

    const fetchTuition = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();

            if (month) params.set('thang', month);
            if (year) params.set('nam', year);
            if (classId) params.set('maLop', classId);
            if (status) params.set('trangThai', status);

            const response = await fetch(
                `/api/tuition?${params.toString()}`,
                { cache: 'no-store' }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tải dữ liệu học phí.');
            }

            setTuitionList(result.data || []);
            setSummary(result.summary || EMPTY_SUMMARY);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải học phí.'
            );
        } finally {
            setLoading(false);
        }
    }, [month, year, classId, status]);

    useEffect(() => {
        fetchTuition();
    }, [fetchTuition]);

    const filteredList = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return tuitionList;

        return tuitionList.filter((item) =>
            item.hoTen.toLowerCase().includes(keyword) ||
            item.maSoHocVien.toLowerCase().includes(keyword) ||
            item.tenLop.toLowerCase().includes(keyword)
        );
    }, [tuitionList, search]);

    const handleUpdateStatus = async (item: TuitionItem) => {
        if (item.trangThai === 'da_dong') return;

        const confirmed = window.confirm(
            `Xác nhận học viên ${item.hoTen} đã thanh toán ${formatMoney(item.tongTien)}?`
        );

        if (!confirmed) return;

        setUpdatingId(item.maHocPhi);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/tuition/${item.maHocPhi}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trangThai: 'da_dong',
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể cập nhật thanh toán.');
            }

            setSuccess(`Đã xác nhận thanh toán của ${item.hoTen}.`);
            await fetchTuition();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể cập nhật trạng thái thanh toán.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const resetFilters = () => {
        setMonth('');
        setYear('');
        setStatus('');
        setClassId('');
        setSearch('');
    };

    const getStatusBadge = (value: TuitionStatus) => {
        if (value === 'da_dong') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <CheckCircle2 size={14} />
                    Đã thanh toán
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                <Clock size={14} />
                Chưa thanh toán
            </span>
        );
    };

    const stats = [
        {
            title: 'Tổng học phí',
            value: summary.tongHocPhi,
            description: 'Tổng tiền phải thu',
            icon: Wallet,
            card: 'border-gray-200 bg-white  ',
            color: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Đã thu',
            value: summary.daThu,
            description: 'Học phí đã thanh toán',
            icon: TrendingUp,
            card: 'border-sky-200 bg-white  to-cyan-100/80',
            color: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: 'Còn nợ',
            value: summary.conNo,
            description: 'Học phí chưa thanh toán',
            icon: AlertCircle,
            card: 'border-amber-200 bg-white from-amber-50 to-orange-100/80',
            color: 'bg-amber-50 text-amber-600',
        },
        {
            title: 'Học viên',
            value: summary.soHocVien,
            description: 'Số học viên có học phí',
            icon: Users,
            card: 'border-purple-200 bg-white  ',
            color: 'bg-purple-50 text-purple-600',
            isCount: true,
        },
    ];

    return (
        <AdminLayout pageTitle="Quản lý học phí">
            <div className="space-y-6 text-slate-800">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white    p-6 shadow-[0_12px_40px_rgba(219,39,119,0.08)] sm:p-8">
                    <div className="pointer-events-none absolute -bottom-16 -right-8 select-none text-[180px] font-black leading-none text-white/40">
                        空手
                    </div>
                    <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                                    <Flame size={13} />
                                    Karate-HaUI
                                </span>
                                <span className="rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                                    Đại học Công Nghiệp Hà Nội
                                </span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                Quản lý học phí{' '}
                                <span className="bg-white   bg-clip-text text-transparent">
                                    câu lạc bộ
                                </span>
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                                Theo dõi học phí, công nợ và xác nhận thanh toán của học viên CLB Karate-HaUI.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/75 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm">
                                <MapPin size={14} className="text-blue-600" />
                                Chùa Thủ Hoàng, Đại học Công Nghiệp Hà Nội
                            </div>
                        </div>

                        <button
                            onClick={fetchTuition}
                            disabled={loading}
                            className="relative inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? 'animate-spin' : ''}
                            />
                            Làm mới dữ liệu
                        </button>
                    </div>
                </section>

                {/* Thông báo */}
                {error && (
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                        <button onClick={() => setError('')}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            {success}
                        </div>
                        <button onClick={() => setSuccess('')}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Thống kê */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className={`rounded-[22px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.card}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                                            {item.title}
                                        </p>

                                        <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
                                            {item.isCount
                                                ? item.value.toLocaleString('vi-VN')
                                                : formatMoney(item.value)}
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className={`rounded-2xl p-3.5 ${item.color}`}>
                                        <Icon size={23} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bộ lọc */}
                <div className="rounded-[26px] border border-gray-200 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-xl bg-gray-100 p-2 text-blue-600">
                            <Filter size={17} />
                        </div>
                        <h2 className="font-bold text-slate-800">
                            Bộ lọc học phí
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Tháng
                            </label>
                            <div className="relative">
                                <CalendarDays
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="">Tất cả tháng</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <option key={m} value={m}>
                                            Tháng {m}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Năm
                            </label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="">Tất cả năm</option>
                                {[currentDate.getFullYear(), currentDate.getFullYear() - 1, currentDate.getFullYear() - 2].map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Trạng thái thanh toán
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="da_dong">Đã thanh toán</option>
                                <option value="chua_dong">Chưa thanh toán</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Mã lớp học
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                placeholder="Nhập mã lớp..."
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={resetFilters}
                            className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                {/* Danh sách học phí */}
                <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                    <div className="flex flex-col gap-4 border-b border-gray-200 bg-white    p-5 md:flex-row md:items-center md:justify-between sm:p-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Danh sách học phí
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Có {filteredList.length} kết quả phù hợp.
                            </p>
                        </div>

                        <div className="relative w-full md:max-w-xs">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm tên, mã học viên, lớp..."
                                className="w-full rounded-xl border border-gray-200 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">
                            <thead className="bg-white   text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Học viên</th>
                                    <th className="px-4 py-4">Lớp học</th>
                                    <th className="px-4 py-4">Thời gian</th>
                                    <th className="px-4 py-4 text-center">Số buổi</th>
                                    <th className="px-4 py-4">Đơn giá/buổi</th>
                                    <th className="px-4 py-4">Tổng tiền</th>
                                    <th className="px-4 py-4">Trạng thái</th>
                                    <th className="px-5 py-4 text-center">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-slate-500">
                                            <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-blue-600" />
                                            Đang tải dữ liệu học phí...
                                        </td>
                                    </tr>
                                ) : filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <Wallet size={36} className="mx-auto mb-3 text-gray-400" />
                                            <p className="font-semibold text-slate-700">
                                                Không tìm thấy dữ liệu học phí
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item) => (
                                        <tr
                                            key={item.maHocPhi}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-slate-800">
                                                    {item.hoTen}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {item.maSoHocVien}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="font-medium text-slate-700">
                                                    {item.tenLop}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {item.maSoLop}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 font-medium text-slate-600">
                                                {String(item.thang).padStart(2, '0')}/{item.nam}
                                            </td>

                                            <td className="px-4 py-4 text-center font-semibold text-slate-700">
                                                {item.soBuoi}
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                                                {formatMoney(item.donGiaMoiBuoi)}
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap font-bold text-slate-900">
                                                {formatMoney(item.tongTien)}
                                            </td>

                                            <td className="px-4 py-4">
                                                {getStatusBadge(item.trangThai)}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                {item.trangThai === 'chua_dong' ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item)}
                                                        disabled={updatingId === item.maHocPhi}
                                                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {updatingId === item.maHocPhi ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 size={14} />
                                                        )}
                                                        Xác nhận thu
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                        <CheckCircle2 size={15} />
                                                        Hoàn tất
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col justify-between gap-2 border-t border-gray-200 bg-white   px-5 py-3 text-xs text-slate-500 sm:flex-row">
                        <span>Hiển thị {filteredList.length} bản ghi</span>
                        <span>Dữ liệu học phí được tính từ hệ thống điểm danh.</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
