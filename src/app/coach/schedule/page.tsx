'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarDays,
    Clock,
    MapPin,
    Search,
    RefreshCw,
    Filter,
    BookOpen,
    CalendarCheck,
    CalendarX,
    AlertCircle,
    Plus,
    Pencil,
    X,
    Ban,
    Save,
} from 'lucide-react';
import type { ScheduleItem, ScheduleStatus } from '@/types/schedule';

interface ClassOption {
    maLop: number;
    maSoLop: string;
    tenLop: string;
}

interface ScheduleForm {
    maLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string;
    noiDung: string;
}

const EMPTY_FORM: ScheduleForm = {
    maLop: '',
    ngayTap: '',
    gioBatDau: '',
    gioKetThuc: '',
    diaDiem: '',
    noiDung: '',
};

const STATUS_LABELS: Record<ScheduleStatus, string> = {
    da_len_lich: 'Đã lên lịch',
    da_hoan_thanh: 'Đã hoàn thành',
    da_huy: 'Đã hủy',
};

const STATUS_STYLES: Record<ScheduleStatus, string> = {
    da_len_lich: 'bg-blue-100 text-blue-700',
    da_hoan_thanh: 'bg-green-100 text-green-700',
    da_huy: 'bg-red-100 text-red-700',
};

function formatDate(value: string) {
    if (!value) return 'Chưa xác định';

    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatTime(value: string) {
    return value ? value.slice(0, 5) : '--:--';
}

export default function CoachSchedulePage() {
    const router = useRouter();

    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [maLop, setMaLop] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Trạng thái biểu mẫu
    const [showForm, setShowForm] = useState(false);
    const [editingSchedule, setEditingSchedule] =
        useState<ScheduleItem | null>(null);
    const [form, setForm] = useState<ScheduleForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();

            if (search.trim()) params.set('search', search.trim());
            if (status) params.set('status', status);
            if (maLop) params.set('maLop', maLop);
            if (fromDate) params.set('fromDate', fromDate);
            if (toDate) params.set('toDate', toDate);

            const [scheduleResponse, classResponse] = await Promise.all([
                fetch(`/api/coach/schedule?${params.toString()}`),
                fetch('/api/coach/classes'),
            ]);

            if (
                scheduleResponse.status === 401 ||
                classResponse.status === 401
            ) {
                router.push('/login');
                return;
            }

            const scheduleResult = await scheduleResponse.json();
            const classResult = await classResponse.json();

            if (!scheduleResponse.ok || !scheduleResult.success) {
                throw new Error(
                    scheduleResult.message || 'Không thể tải lịch tập.',
                );
            }

            setSchedules(scheduleResult.data || []);

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
    }, [search, status, maLop, fromDate, toDate, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        loadData();
    }

    function handleReset() {
        setSearch('');
        setStatus('');
        setMaLop('');
        setFromDate('');
        setToDate('');
    }

    function openCreateForm() {
        setEditingSchedule(null);
        setForm({
            ...EMPTY_FORM,
            maLop: classes.length === 1 ? String(classes[0].maLop) : '',
        });
        setError('');
        setMessage('');
        setShowForm(true);
    }

    function openEditForm(item: ScheduleItem) {
        setEditingSchedule(item);
        setForm({
            maLop: String(item.maLop),
            ngayTap: item.ngayTap.slice(0, 10),
            gioBatDau: item.gioBatDau.slice(0, 5),
            gioKetThuc: item.gioKetThuc.slice(0, 5),
            diaDiem: item.diaDiem || '',
            noiDung: item.noiDung || '',
        });
        setError('');
        setMessage('');
        setShowForm(true);
    }

    function closeForm() {
        if (saving) return;

        setShowForm(false);
        setEditingSchedule(null);
        setForm(EMPTY_FORM);
    }

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.maLop || !form.ngayTap ||
            !form.gioBatDau || !form.gioKetThuc) {
            setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
            return;
        }

        if (form.gioBatDau >= form.gioKetThuc) {
            setError('Giờ kết thúc phải sau giờ bắt đầu.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const url = editingSchedule
                ? `/api/coach/schedule/${editingSchedule.maLichTap}`
                : '/api/coach/schedule';

            const response = await fetch(url, {
                method: editingSchedule ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    maLop: Number(form.maLop),
                    ngayTap: form.ngayTap,
                    gioBatDau: form.gioBatDau,
                    gioKetThuc: form.gioKetThuc,
                    diaDiem: form.diaDiem.trim() || undefined,
                    noiDung: form.noiDung.trim() || undefined,
                    trangThai: editingSchedule?.trangThai || 'da_len_lich',
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể lưu lịch tập.');
            }

            setShowForm(false);
            setEditingSchedule(null);
            setForm(EMPTY_FORM);
            setMessage(result.message || 'Lưu lịch tập thành công.');

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi lưu lịch tập.',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleCancel(item: ScheduleItem) {
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn hủy lịch tập của lớp ${item.maSoLop} ngày ${formatDate(item.ngayTap)} không?`,
        );

        if (!confirmed) return;

        setError('');
        setMessage('');

        try {
            const response = await fetch(
                `/api/coach/schedule/${item.maLichTap}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        trangThai: 'da_huy',
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể hủy lịch tập.');
            }

            setMessage(result.message || 'Hủy lịch tập thành công.');
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi hủy lịch tập.',
            );
        }
    }

    const totalScheduled = schedules.filter(
        (item) => item.trangThai === 'da_len_lich',
    ).length;

    const totalCompleted = schedules.filter(
        (item) => item.trangThai === 'da_hoan_thanh',
    ).length;

    const totalCancelled = schedules.filter(
        (item) => item.trangThai === 'da_huy',
    ).length;

    return (
        <div className="space-y-6">
            {/* Tiêu đề */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Lịch tập
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Theo dõi và quản lý lịch tập của các lớp bạn đang phụ trách.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={openCreateForm}
                        disabled={classes.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus size={17} />
                        Thêm lịch tập
                    </button>

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
            </div>

            {classes.length === 0 && !loading && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                    Bạn chưa được phân công phụ trách lớp học nào đang hoạt động.
                </div>
            )}

            {/* Thông báo */}
            {message && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {message}
                </div>
            )}

            {/* Thống kê */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đã lên lịch</p>
                            <p className="mt-2 text-2xl font-bold text-blue-600">
                                {totalScheduled}
                            </p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                            <CalendarDays className="text-blue-600" size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đã hoàn thành</p>
                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {totalCompleted}
                            </p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                            <CalendarCheck className="text-green-600" size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đã hủy</p>
                            <p className="mt-2 text-2xl font-bold text-red-600">
                                {totalCancelled}
                            </p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-3">
                            <CalendarX className="text-red-600" size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <Filter size={18} />
                    Bộ lọc lịch tập
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Mã lớp, tên lớp, địa điểm..."
                                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

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
                            Trạng thái
                        </label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="da_len_lich">Đã lên lịch</option>
                            <option value="da_hoan_thanh">Đã hoàn thành</option>
                            <option value="da_huy">Đã hủy</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(event) => setFromDate(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(event) => setToDate(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="submit"
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
            </form>

            {/* Danh sách lịch */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-gray-800">
                            Danh sách lịch tập
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {schedules.length} buổi tập được tìm thấy
                        </p>
                    </div>
                    <BookOpen size={21} className="text-gray-400" />
                </div>

                {error && (
                    <div className="m-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16 text-center text-sm text-gray-500">
                        <RefreshCw
                            size={24}
                            className="mx-auto mb-3 animate-spin text-blue-500"
                        />
                        Đang tải lịch tập...
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="py-16 text-center">
                        <CalendarDays
                            size={40}
                            className="mx-auto mb-3 text-gray-300"
                        />
                        <p className="font-medium text-gray-600">
                            Không tìm thấy lịch tập
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                            Chưa có lịch phù hợp với điều kiện tìm kiếm.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {schedules.map((item) => (
                            <div
                                key={item.maLichTap}
                                className="p-5 transition hover:bg-gray-50"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-gray-800">
                                                {item.maSoLop} - {item.tenLop}
                                            </span>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.trangThai]}`}
                                            >
                                                {STATUS_LABELS[item.trangThai]}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-2">
                                                <CalendarDays size={16} className="text-blue-500" />
                                                {formatDate(item.ngayTap)}
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <Clock size={16} className="text-blue-500" />
                                                {formatTime(item.gioBatDau)}
                                                {' - '}
                                                {formatTime(item.gioKetThuc)}
                                            </span>

                                            {item.diaDiem && (
                                                <span className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-blue-500" />
                                                    {item.diaDiem}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {item.trangThai === 'da_len_lich' && (
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditForm(item)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil size={15} />
                                                Sửa
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleCancel(item)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                <Ban size={15} />
                                                Hủy
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {item.noiDung && (
                                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                        <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                            Nội dung buổi tập
                                        </p>
                                        <p className="whitespace-pre-line text-sm text-gray-700">
                                            {item.noiDung}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Biểu mẫu thêm / sửa lịch */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                    <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {editingSchedule ? 'Chỉnh sửa lịch tập' : 'Thêm lịch tập mới'}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {editingSchedule
                                        ? 'Cập nhật thông tin buổi tập.'
                                        : 'Tạo lịch tập cho lớp bạn phụ trách.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 p-6">
                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Lớp học <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.maLop}
                                    onChange={(event) =>
                                        setForm({ ...form, maLop: event.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">-- Chọn lớp học --</option>
                                    {classes.map((item) => (
                                        <option key={item.maLop} value={item.maLop}>
                                            {item.maSoLop} - {item.tenLop}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Ngày tập <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={form.ngayTap}
                                    onChange={(event) =>
                                        setForm({ ...form, ngayTap: event.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Giờ bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={form.gioBatDau}
                                        onChange={(event) =>
                                            setForm({ ...form, gioBatDau: event.target.value })
                                        }
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Giờ kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={form.gioKetThuc}
                                        onChange={(event) =>
                                            setForm({ ...form, gioKetThuc: event.target.value })
                                        }
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Địa điểm
                                </label>
                                <input
                                    value={form.diaDiem}
                                    onChange={(event) =>
                                        setForm({ ...form, diaDiem: event.target.value })
                                    }
                                    placeholder="Ví dụ: Nhà thi đấu A"
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Nội dung buổi tập
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.noiDung}
                                    onChange={(event) =>
                                        setForm({ ...form, noiDung: event.target.value })
                                    }
                                    placeholder="Nhập nội dung buổi tập..."
                                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Đóng
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {saving ? 'Đang lưu...' : 'Lưu lịch tập'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}