
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Wallet,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Search,
    CalendarDays,
    BookOpen,
    Receipt,
} from 'lucide-react';

type TuitionStatus = 'chua_dong' | 'da_dong';

interface TuitionItem {
    maHocPhi: number;
    maHocVien: number;
    maSoHocVien: string;
    hoTen: string;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    thang: number;
    nam: number;
    soBuoi: number;
    donGiaMoiBuoi: number;
    tongTien: number;
    trangThai: TuitionStatus;
    ngayCapNhat: string | null;
}

interface TuitionSummary {
    tongHocPhi: number;
    daThu: number;
    conNo: number;
    soKhoanHocPhi: number;
}

const formatMoney = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(Number(value) || 0);

const formatMonth = (month: number, year: number) =>
    `Tháng ${month}/${year}`;

export default function StudentTuitionPage() {
    const currentDate = new Date();

    const [items, setItems] = useState<TuitionItem[]>([]);
    const [summary, setSummary] = useState<TuitionSummary>({
        tongHocPhi: 0,
        daThu: 0,
        conNo: 0,
        soKhoanHocPhi: 0,
    });

    const [month, setMonth] = useState('');
    const [year, setYear] = useState(String(currentDate.getFullYear()));
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('tat_ca');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();

            if (month) params.set('thang', month);
            if (year) params.set('nam', year);

            const response = await fetch(
                `/api/student/tuition?${params.toString()}`,
                { cache: 'no-store' },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tải học phí.');
            }

            setItems(Array.isArray(result.data) ? result.data : []);
            setSummary(result.summary || {
                tongHocPhi: 0,
                daThu: 0,
                conNo: 0,
                soKhoanHocPhi: 0,
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải học phí.',
            );
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredItems = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return items.filter((item) => {
            const matchesKeyword =
                !normalizedKeyword ||
                item.tenLop.toLowerCase().includes(normalizedKeyword) ||
                item.maSoLop.toLowerCase().includes(normalizedKeyword);

            const matchesStatus =
                statusFilter === 'tat_ca' ||
                item.trangThai === statusFilter;

            return matchesKeyword && matchesStatus;
        });
    }, [items, keyword, statusFilter]);

    const years = Array.from(
        { length: 5 },
        (_, index) => currentDate.getFullYear() - index,
    );

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
                            Học phí của tôi
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Theo dõi các khoản học phí và tình trạng thanh toán.
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Tổng học phí
                            </p>
                            <Wallet className="text-blue-500" size={22} />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-800">
                            {formatMoney(summary.tongHocPhi)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Đã thanh toán
                            </p>
                            <CheckCircle2 className="text-green-500" size={22} />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-green-600">
                            {formatMoney(summary.daThu)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Còn phải đóng
                            </p>
                            <AlertCircle className="text-red-500" size={22} />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-red-600">
                            {formatMoney(summary.conNo)}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <CalendarDays size={19} className="text-blue-600" />
                        <h2 className="font-semibold text-slate-800">
                            Bộ lọc học phí
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <select
                            value={month}
                            onChange={(event) => setMonth(event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả các tháng</option>
                            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                                <option key={value} value={value}>
                                    Tháng {value}
                                </option>
                            ))}
                        </select>

                        <select
                            value={year}
                            onChange={(event) => setYear(event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            {years.map((value) => (
                                <option key={value} value={value}>
                                    Năm {value}
                                </option>
                            ))}
                        </select>
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
                                placeholder="Tìm theo tên hoặc mã lớp..."
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="tat_ca">Tất cả trạng thái</option>
                            <option value="da_dong">Đã đóng</option>
                            <option value="chua_dong">Chưa đóng</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-slate-800">
                                    Chi tiết học phí
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {filteredItems.length} khoản học phí
                                </p>
                            </div>
                            <Receipt size={22} className="text-slate-400" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-slate-500">
                            Đang tải thông tin học phí...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center p-12 text-center">
                            <BookOpen size={42} className="text-slate-300" />
                            <p className="mt-3 font-medium text-slate-700">
                                Chưa có khoản học phí nào
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                Thông tin học phí sẽ hiển thị tại đây sau khi hệ thống tính học phí.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.maHocPhi}
                                    className="p-5 transition hover:bg-slate-50"
                                >
                                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-slate-800">
                                                    {item.tenLop}
                                                </h3>
                                                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
                                                    {item.maSoLop}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-sm text-slate-500">
                                                {formatMonth(item.thang, item.nam)}
                                            </p>

                                            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                                                <p>
                                                    Số buổi tập: <strong>{item.soBuoi}</strong>
                                                </p>
                                                <p>
                                                    Đơn giá: <strong>{formatMoney(item.donGiaMoiBuoi)}</strong>
                                                </p>
                                                <p>
                                                    Tổng tiền: <strong className="text-slate-800">{formatMoney(item.tongTien)}</strong>
                                                </p>
                                            </div>

                                            {item.ngayCapNhat && (
                                                <p className="mt-2 text-xs text-slate-400">
                                                    Cập nhật: {item.ngayCapNhat}
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0">
                                            {item.trangThai === 'da_dong' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                                                    <CheckCircle2 size={15} />
                                                    Đã đóng
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700">
                                                    <AlertCircle size={15} />
                                                    Chưa đóng
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
