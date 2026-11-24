
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    MapPin,
    RefreshCw,
    Search,
    CheckCircle2,
    XCircle,
    Clock3,
    FileCheck,
    ClipboardCheck,
} from 'lucide-react';

type AttendanceStatus = 'co_mat' | 'vang' | 'di_muon' | 'co_phep';

interface AttendanceItem {
    maDiemDanh: number;
    maLichTap: number;
    maHocVien: number;
    maSoLop: string;
    tenLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string | null;
    trangThai: AttendanceStatus;
    ghiChu: string | null;
    nguoiDiemDanh: number | null;
    thoiGianDiemDanh: string | null;
}

const statusConfig: Record<
    AttendanceStatus,
    { label: string; className: string; icon: typeof CheckCircle2 }
> = {
    co_mat: {
        label: 'Có mặt',
        className: 'bg-green-100 text-green-700',
        icon: CheckCircle2,
    },
    vang: {
        label: 'Vắng',
        className: 'bg-red-100 text-red-700',
        icon: XCircle,
    },
    di_muon: {
        label: 'Đi muộn',
        className: 'bg-amber-100 text-amber-700',
        icon: Clock3,
    },
    co_phep: {
        label: 'Có phép',
        className: 'bg-blue-100 text-blue-700',
        icon: FileCheck,
    },
};

function formatDate(value: string) {
    if (!value) return '—';

    const parts = value.split('-');
    if (parts.length !== 3) return value;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function StudentAttendancePage() {
    const [items, setItems] = useState<AttendanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('tat_ca');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/student/attendance', {
                cache: 'no-store',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tải lịch sử điểm danh.');
            }

            setItems(Array.isArray(result.data) ? result.data : []);
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

    const statistics = useMemo(() => ({
        total: items.length,
        present: items.filter((item) => item.trangThai === 'co_mat').length,
        late: items.filter((item) => item.trangThai === 'di_muon').length,
        absent: items.filter((item) => item.trangThai === 'vang').length,
        excused: items.filter((item) => item.trangThai === 'co_phep').length,
    }), [items]);

    const attendanceRate = statistics.total > 0
        ? Math.round(
            ((statistics.present + statistics.late + statistics.excused) /
                statistics.total) * 100,
        )
        : 0;

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
                            Lịch sử điểm danh
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Theo dõi tình trạng tham gia các buổi tập của bạn.
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

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Tổng buổi tập</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">
                            {statistics.total}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Có mặt</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {statistics.present}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Đi muộn</p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {statistics.late}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Vắng</p>
                        <p className="mt-2 text-2xl font-bold text-red-600">
                            {statistics.absent}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">Tỷ lệ tham gia</p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {attendanceRate}%
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Có mặt, đi muộn và có phép
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
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
                            <option value="co_mat">Có mặt</option>
                            <option value="vang">Vắng</option>
                            <option value="di_muon">Đi muộn</option>
                            <option value="co_phep">Có phép</option>
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
                        <h2 className="font-semibold text-slate-800">
                            Danh sách điểm danh
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Tìm thấy {filteredItems.length} kết quả
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-slate-500">
                            Đang tải lịch sử điểm danh...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center p-12 text-center">
                            <ClipboardCheck
                                size={42}
                                className="text-slate-300"
                            />
                            <p className="mt-3 font-medium text-slate-700">
                                Chưa có dữ liệu điểm danh
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                Lịch sử sẽ xuất hiện sau khi huấn luyện viên điểm danh.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredItems.map((item) => {
                                const config = statusConfig[item.trangThai];
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={item.maDiemDanh}
                                        className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-slate-800">
                                                    {item.tenLop}
                                                </h3>
                                                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
                                                    {item.maSoLop}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarDays size={15} />
                                                    {formatDate(item.ngayTap)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock size={15} />
                                                    {item.gioBatDau?.slice(0, 5)} - {item.gioKetThuc?.slice(0, 5)}
                                                </span>
                                                {item.diaDiem && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin size={15} />
                                                        {item.diaDiem}
                                                    </span>
                                                )}
                                            </div>

                                            {item.ghiChu && (
                                                <p className="mt-3 text-sm text-slate-500">
                                                    Ghi chú: {item.ghiChu}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${config.className}`}>
                                                <StatusIcon size={15} />
                                                {config.label}
                                            </span>
                                            {item.thoiGianDiemDanh && (
                                                <span className="text-xs text-slate-400">
                                                    Điểm danh lúc: {item.thoiGianDiemDanh}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
