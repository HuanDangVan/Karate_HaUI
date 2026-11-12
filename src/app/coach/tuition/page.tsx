
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Wallet,
    TrendingUp,
    AlertCircle,
    Users,
    RefreshCw,
    Filter,
    Search,
    GraduationCap,
    CalendarDays,
    CreditCard,
} from 'lucide-react';

import type {
    TuitionItem,
    TuitionSummary,
    TuitionStatus,
} from '@/types/tuition';

interface ClassOption {
    maLop: number;
    maSoLop: string;
    tenLop: string;
}

const EMPTY_SUMMARY: TuitionSummary = {
    tongHocPhi: 0,
    daThu: 0,
    conNo: 0,
    soHocVien: 0,
};

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
    { length: 7 },
    (_, index) => CURRENT_YEAR - 3 + index,
);

const STATUS_LABELS: Record<TuitionStatus, string> = {
    da_dong: 'Đã đóng',
    chua_dong: 'Chưa đóng',
};

const STATUS_STYLES: Record<TuitionStatus, string> = {
    da_dong: 'bg-green-100 text-green-700',
    chua_dong: 'bg-red-100 text-red-700',
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0);
}

export default function CoachTuitionPage() {
    const router = useRouter();

    const [tuitionList, setTuitionList] = useState<TuitionItem[]>([]);
    const [summary, setSummary] =
        useState<TuitionSummary>(EMPTY_SUMMARY);

    const [classes, setClasses] = useState<ClassOption[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [maLop, setMaLop] = useState('');
    const [thang, setThang] = useState('');
    const [nam, setNam] = useState('');
    const [trangThai, setTrangThai] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();

            if (maLop) params.set('maLop', maLop);
            if (thang) params.set('thang', thang);
            if (nam) params.set('nam', nam);
            if (trangThai) params.set('trangThai', trangThai);

            const [tuitionResponse, classResponse] = await Promise.all([
                fetch(`/api/coach/tuition?${params.toString()}`),
                fetch('/api/coach/classes'),
            ]);

            if (
                tuitionResponse.status === 401 ||
                classResponse.status === 401
            ) {
                router.push('/login');
                return;
            }

            const tuitionResult = await tuitionResponse.json();
            const classResult = await classResponse.json();

            if (!tuitionResponse.ok || !tuitionResult.success) {
                throw new Error(
                    tuitionResult.message || 'Không thể tải dữ liệu học phí.',
                );
            }

            setTuitionList(tuitionResult.data || []);
            setSummary(tuitionResult.summary || EMPTY_SUMMARY);

            if (classResponse.ok && classResult.success) {
                setClasses(classResult.data || []);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải dữ liệu.',
            );
        } finally {
            setLoading(false);
        }
    }, [maLop, thang, nam, trangThai, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function handleReset() {
        setMaLop('');
        setThang('');
        setNam('');
        setTrangThai('');
    }

    return (
        <div className="space-y-6">
            {/* Tiêu đề */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Theo dõi học phí
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Theo dõi tình hình học phí của học viên thuộc các lớp bạn phụ trách.
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

            {/* Thông báo lỗi */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Thống kê */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Tổng học phí
                            </p>
                            <p className="mt-2 text-xl font-bold text-gray-800">
                                {formatCurrency(summary.tongHocPhi)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                            <Wallet size={22} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Đã thu
                            </p>
                            <p className="mt-2 text-xl font-bold text-green-600">
                                {formatCurrency(summary.daThu)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                            <TrendingUp size={22} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Còn nợ
                            </p>
                            <p className="mt-2 text-xl font-bold text-red-600">
                                {formatCurrency(summary.conNo)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-3">
                            <AlertCircle size={22} className="text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Số học viên
                            </p>
                            <p className="mt-2 text-2xl font-bold text-purple-600">
                                {summary.soHocVien}
                            </p>
                        </div>
                        <div className="rounded-lg bg-purple-50 p-3">
                            <Users size={22} className="text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <Filter size={18} />
                    Bộ lọc học phí
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Lớp học
                        </label>
                        <select
                            value={maLop}
                            onChange={(event) => setMaLop(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả lớp phụ trách</option>
                            {classes.map((item) => (
                                <option key={item.maLop} value={item.maLop}>
                                    {item.maSoLop} - {item.tenLop}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Tháng
                        </label>
                        <select
                            value={thang}
                            onChange={(event) => setThang(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả tháng</option>
                            {MONTHS.map((month) => (
                                <option key={month} value={month}>
                                    Tháng {month}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Năm
                        </label>
                        <select
                            value={nam}
                            onChange={(event) => setNam(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả năm</option>
                            {YEARS.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Trạng thái thanh toán
                        </label>
                        <select
                            value={trangThai}
                            onChange={(event) =>
                                setTrangThai(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="da_dong">Đã đóng</option>
                            <option value="chua_dong">Chưa đóng</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Search size={16} />
                        Áp dụng bộ lọc
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Bảng học phí */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-800">
                            Chi tiết học phí học viên
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {tuitionList.length} bản ghi học phí
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <GraduationCap size={19} />
                        Lớp học phụ trách
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-sm text-gray-500">
                        <RefreshCw
                            size={24}
                            className="mx-auto mb-3 animate-spin text-blue-500"
                        />
                        Đang tải dữ liệu học phí...
                    </div>
                ) : tuitionList.length === 0 ? (
                    <div className="py-16 text-center">
                        <CreditCard
                            size={40}
                            className="mx-auto mb-3 text-gray-300"
                        />
                        <p className="font-medium text-gray-600">
                            Chưa có dữ liệu học phí
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                            Không tìm thấy học phí phù hợp với điều kiện lọc.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-4">Học viên</th>
                                    <th className="px-5 py-4">Lớp học</th>
                                    <th className="px-5 py-4">Thời gian</th>
                                    <th className="px-5 py-4 text-center">
                                        Số buổi
                                    </th>
                                    <th className="px-5 py-4 text-right">
                                        Đơn giá / buổi
                                    </th>
                                    <th className="px-5 py-4 text-right">
                                        Tổng tiền
                                    </th>
                                    <th className="px-5 py-4 text-center">
                                        Trạng thái
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {tuitionList.map((item) => (
                                    <tr
                                        key={item.maHocPhi}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-800">
                                                {item.hoTen}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {item.maSoHocVien}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-700">
                                                {item.maSoLop}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {item.tenLop}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-gray-700">
                                                <CalendarDays
                                                    size={15}
                                                    className="text-gray-400"
                                                />
                                                {String(item.thang).padStart(2, '0')}/{item.nam}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-center text-gray-700">
                                            {item.soBuoi}
                                        </td>

                                        <td className="px-5 py-4 text-right text-gray-700">
                                            {formatCurrency(item.donGiaMoiBuoi)}
                                        </td>

                                        <td className="px-5 py-4 text-right font-semibold text-gray-800">
                                            {formatCurrency(item.tongTien)}
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[item.trangThai]}`}
                                            >
                                                {STATUS_LABELS[item.trangThai]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && tuitionList.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-500">
                        Số liệu được tổng hợp từ các buổi điểm danh và trạng thái thanh toán hiện tại.
                    </div>
                )}
            </div>
        </div>
    );
}
