
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
    AttendanceSessionOption,
    AttendanceStudentItem,
    AttendanceStatus,
} from '@/types/attendance';
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    Loader2,
    MapPin,
    Save,
    Search,
    Users,
    XCircle,
} from 'lucide-react';

const STATUS_OPTIONS: {
    value: AttendanceStatus;
    label: string;
    color: string;
}[] = [
        { value: 'co_mat', label: 'Có mặt', color: 'bg-emerald-100 text-emerald-700' },
        { value: 'vang', label: 'Vắng', color: 'bg-red-100 text-red-700' },
        { value: 'di_muon', label: 'Đi muộn', color: 'bg-amber-100 text-amber-700' },
        { value: 'co_phep', label: 'Có phép', color: 'bg-blue-100 text-blue-700' },
    ];

export default function CoachAttendancePage() {
    const [sessions, setSessions] = useState<AttendanceSessionOption[]>([]);
    const [students, setStudents] = useState<AttendanceStudentItem[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [search, setSearch] = useState('');
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchSessions = useCallback(async () => {
        try {
            setLoadingSessions(true);
            setError('');

            const response = await fetch('/api/attendance');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể tải danh sách buổi tập.');
            }

            setSessions(result.sessions || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
        } finally {
            setLoadingSessions(false);
        }
    }, []);

    const fetchStudents = useCallback(async (sessionId: string) => {
        if (!sessionId) {
            setStudents([]);
            return;
        }

        try {
            setLoadingStudents(true);
            setError('');
            setMessage('');

            const response = await fetch(
                `/api/attendance?maLichTap=${sessionId}`,
            );
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể tải danh sách học viên.');
            }

            setStudents(result.students || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        fetchStudents(selectedSession);
    }, [selectedSession, fetchStudents]);

    const selectedSessionInfo = sessions.find(
        (session) => String(session.maLichTap) === selectedSession,
    );

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return students;

        return students.filter(
            (student) =>
                student.hoTen.toLowerCase().includes(keyword) ||
                student.maSoHocVien.toLowerCase().includes(keyword),
        );
    }, [students, search]);

    const statistics = useMemo(() => ({
        total: students.length,
        co_mat: students.filter((s) => s.trangThaiDiemDanh === 'co_mat').length,
        vang: students.filter((s) => s.trangThaiDiemDanh === 'vang').length,
        di_muon: students.filter((s) => s.trangThaiDiemDanh === 'di_muon').length,
        co_phep: students.filter((s) => s.trangThaiDiemDanh === 'co_phep').length,
        chua_diem_danh: students.filter((s) => !s.trangThaiDiemDanh).length,
    }), [students]);

    const updateStudent = (
        maHocVien: number,
        field: 'trangThaiDiemDanh' | 'ghiChu',
        value: AttendanceStatus | string,
    ) => {
        setStudents((current) =>
            current.map((student) =>
                student.maHocVien === maHocVien
                    ? { ...student, [field]: value }
                    : student,
            ),
        );
    };

    const markAllPresent = () => {
        setStudents((current) =>
            current.map((student) => ({
                ...student,
                trangThaiDiemDanh: 'co_mat',
            })),
        );
    };

    const handleSave = async () => {
        if (!selectedSession) {
            setError('Bạn cần chọn buổi tập trước khi lưu.');
            return;
        }

        const unmarked = students.filter((student) => !student.trangThaiDiemDanh);

        if (unmarked.length > 0) {
            setError(`Còn ${unmarked.length} học viên chưa được điểm danh.`);
            return;
        }

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maLichTap: Number(selectedSession),
                    danhSach: students.map((student) => ({
                        maHocVien: student.maHocVien,
                        trangThai: student.trangThaiDiemDanh,
                        ghiChu: student.ghiChu || '',
                    })),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể lưu điểm danh.');
            }

            setMessage(result.message || 'Lưu điểm danh thành công.');
            await fetchStudents(selectedSession);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date: string) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                    Điểm danh học viên
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Theo dõi và ghi nhận tình trạng tham gia các buổi tập của lớp bạn phụ trách.
                </p>
            </div>

            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Chọn buổi tập */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-red-700" />
                    <h2 className="font-semibold text-zinc-900">Chọn buổi tập</h2>
                </div>

                <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    disabled={loadingSessions}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                >
                    <option value="">
                        {loadingSessions ? 'Đang tải buổi tập...' : '-- Chọn buổi tập --'}
                    </option>

                    {sessions.map((session) => (
                        <option key={session.maLichTap} value={session.maLichTap}>
                            {session.maSoLop} - {session.tenLop} | {formatDate(session.ngayTap)} | {session.gioBatDau.slice(0, 5)}
                        </option>
                    ))}
                </select>

                {selectedSessionInfo && (
                    <div className="mt-4 grid gap-3 rounded-xl bg-zinc-50 p-4 sm:grid-cols-3">
                        <div>
                            <p className="text-xs text-zinc-500">Lớp học</p>
                            <p className="mt-1 font-semibold text-zinc-800">
                                {selectedSessionInfo.tenLop}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-zinc-500">Thời gian</p>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-800">
                                <Clock className="h-4 w-4 text-red-700" />
                                {formatDate(selectedSessionInfo.ngayTap)} | {selectedSessionInfo.gioBatDau.slice(0, 5)} - {selectedSessionInfo.gioKetThuc.slice(0, 5)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-zinc-500">Địa điểm</p>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-800">
                                <MapPin className="h-4 w-4 text-red-700" />
                                {selectedSessionInfo.diaDiem || 'Chưa cập nhật'}
                            </p>
                        </div>
                    </div>
                )}

                {!loadingSessions && sessions.length === 0 && (
                    <p className="mt-3 text-sm text-amber-700">
                        Bạn chưa có buổi tập nào thuộc lớp đang phụ trách.
                    </p>
                )}
            </section>

            {/* Thống kê và danh sách */}
            {selectedSession && (
                <>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Users className="h-4 w-4" />
                                <span className="text-xs">Tổng học viên</span>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-zinc-900">{statistics.total}</p>
                        </div>

                        {STATUS_OPTIONS.map((status) => (
                            <div key={status.value} className="rounded-xl border border-zinc-200 bg-white p-4">
                                <p className="text-xs text-zinc-500">{status.label}</p>
                                <p className="mt-2 text-2xl font-bold text-zinc-900">
                                    {statistics[status.value]}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">Danh sách điểm danh</h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                Còn {statistics.chua_diem_danh} học viên chưa được điểm danh.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={markAllPresent}
                            disabled={students.length === 0 || loadingStudents}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                            <CheckCircle2 className="mr-2 inline h-4 w-4" />
                            Tất cả có mặt
                        </button>
                    </div>

                    {message && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            {message}
                        </div>
                    )}

                    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm tên hoặc mã học viên..."
                                    className="w-full rounded-lg border border-zinc-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                                />
                            </div>

                            <span className="text-sm text-zinc-500">
                                Hiển thị {filteredStudents.length}/{students.length} học viên
                            </span>
                        </div>

                        {loadingStudents ? (
                            <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Đang tải danh sách học viên...
                            </div>
                        ) : students.length === 0 ? (
                            <div className="py-16 text-center">
                                <Users className="mx-auto h-10 w-10 text-zinc-300" />
                                <p className="mt-3 font-medium text-zinc-700">
                                    Lớp học chưa có học viên hoạt động.
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Hãy kiểm tra danh sách đăng ký học viên của lớp.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left text-sm">
                                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                                        <tr>
                                            <th className="px-4 py-3">STT</th>
                                            <th className="px-4 py-3">Học viên</th>
                                            <th className="px-4 py-3">Mã học viên</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3">Ghi chú</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-100">
                                        {filteredStudents.map((student, index) => (
                                            <tr key={student.maHocVien} className="transition hover:bg-zinc-50">
                                                <td className="px-4 py-3 text-zinc-500">{index + 1}</td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {student.anhDaiDien ? (
                                                            <img
                                                                src={student.anhDaiDien}
                                                                alt=""
                                                                className="h-9 w-9 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                                                                {student.hoTen.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-zinc-800">{student.hoTen}</span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-zinc-600">{student.maSoHocVien}</td>

                                                <td className="px-4 py-3">
                                                    <select
                                                        value={student.trangThaiDiemDanh || ''}
                                                        onChange={(e) => updateStudent(
                                                            student.maHocVien,
                                                            'trangThaiDiemDanh',
                                                            e.target.value as AttendanceStatus,
                                                        )}
                                                        className={`w-32 rounded-lg border border-zinc-200 px-2 py-2 text-xs font-semibold outline-none ${STATUS_OPTIONS.find((s) => s.value === student.trangThaiDiemDanh)?.color || 'bg-white text-zinc-500'
                                                            }`}
                                                    >
                                                        <option value="" disabled>Chọn trạng thái</option>
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <option key={status.value} value={status.value}>
                                                                {status.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <input
                                                        value={student.ghiChu || ''}
                                                        onChange={(e) => updateStudent(
                                                            student.maHocVien,
                                                            'ghiChu',
                                                            e.target.value,
                                                        )}
                                                        placeholder="Nhập ghi chú..."
                                                        className="w-48 rounded-lg border border-zinc-300 px-3 py-2 text-xs outline-none focus:border-red-600"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-zinc-500">
                                Kết quả sẽ được lưu vào hệ thống khi bạn nhấn nút bên cạnh.
                            </p>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || loadingStudents || students.length === 0}
                                className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 inline h-4 w-4" />
                                        Lưu điểm danh
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
