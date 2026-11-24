'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type {
  AttendanceSessionOption,
  AttendanceStudentItem,
  AttendanceStatus,
} from '@/types/attendance';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Flame,
  UserCheck,
  UserX,
  AlarmClock,
  FileCheck2,
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
  card: string;
  bar: string;
  iconBg: string;
  icon: typeof Users;
  labelColor: string;
  numColor: string;
}[] = [
    {
      value: 'co_mat',
      label: 'Có mặt',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      card: 'border-emerald-200 bg-white',
      bar: 'bg-emerald-500',
      iconBg: 'bg-emerald-500 text-white',
      icon: UserCheck,
      labelColor: 'text-emerald-800',
      numColor: 'text-emerald-950',
    },
    {
      value: 'vang',
      label: 'Vắng',
      color: 'bg-red-100 text-red-700 border-red-300',
      card: 'border-red-200 bg-white',
      bar: 'bg-red-500',
      iconBg: 'bg-red-500 text-white',
      icon: UserX,
      labelColor: 'text-red-800',
      numColor: 'text-red-950',
    },
    {
      value: 'di_muon',
      label: 'Đi muộn',
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      card: 'border-amber-200 bg-white',
      bar: 'bg-amber-500',
      iconBg: 'bg-amber-500 text-white',
      icon: AlarmClock,
      labelColor: 'text-amber-800',
      numColor: 'text-amber-950',
    },
    {
      value: 'co_phep',
      label: 'Có phép',
      color: 'bg-sky-100 text-sky-700 border-sky-300',
      card: 'border-sky-200 bg-white',
      bar: 'bg-sky-500',
      iconBg: 'bg-sky-500 text-white',
      icon: FileCheck2,
      labelColor: 'text-sky-800',
      numColor: 'text-sky-950',
    },
  ];

export default function AttendancePage() {
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

  const statistics = useMemo(() => {
    return {
      total: students.length,
      co_mat: students.filter((s) => s.trangThaiDiemDanh === 'co_mat').length,
      vang: students.filter((s) => s.trangThaiDiemDanh === 'vang').length,
      di_muon: students.filter((s) => s.trangThaiDiemDanh === 'di_muon').length,
      co_phep: students.filter((s) => s.trangThaiDiemDanh === 'co_phep').length,
      chua_diem_danh: students.filter((s) => !s.trangThaiDiemDanh).length,
    };
  }, [students]);

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
    <AdminLayout pageTitle="Điểm danh học viên">
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white    p-6 shadow-lg shadow-sm sm:p-8">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-2 select-none text-[120px] font-black leading-none text-gray-300/30"
          >
            空手
          </span>

          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md shadow-red-300/50">
                <Flame className="h-3.5 w-3.5" />
                Karate-HaUI
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-sky-300/50">
                Đại học Công Nghiệp Hà Nội
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Điểm Danh Học Viên{' '}
              <span className="text-red-600">Karate-HaUI</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Quản lý và ghi nhận tình trạng tham gia các buổi tập của câu lạc
              bộ một cách chuẩn xác, đậm đà tinh thần võ đạo.
            </p>
          </div>
        </section>

        {/* Chọn buổi tập */}
        <section className="rounded-3xl border border-gray-200 bg-white   to-white p-5 shadow-md shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <CalendarDays className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Chọn buổi tập
            </h2>
          </div>

          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            disabled={loadingSessions}
            className="form-input w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              {loadingSessions ? 'Đang tải buổi tập...' : '-- Chọn buổi tập --'}
            </option>

            {sessions.map((session) => (
              <option
                key={session.maLichTap}
                value={session.maLichTap}
              >
                {session.maSoLop} - {session.tenLop} |{' '}
                {formatDate(session.ngayTap)} | {session.gioBatDau.slice(0, 5)}
              </option>
            ))}
          </select>

          {selectedSessionInfo && (
            <div className="mt-4 grid gap-3 rounded-2xl border border-sky-200 bg-white  to-cyan-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Lớp học
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {selectedSessionInfo.tenLop}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Thời gian
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock className="h-4 w-4 text-red-600" />
                  {formatDate(selectedSessionInfo.ngayTap)} |{' '}
                  {selectedSessionInfo.gioBatDau.slice(0, 5)} -{' '}
                  {selectedSessionInfo.gioKetThuc.slice(0, 5)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Địa điểm
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin className="h-4 w-4 text-red-600" />
                  {selectedSessionInfo.diaDiem || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          )}

          {!loadingSessions && sessions.length === 0 && (
            <p className="mt-3 text-sm font-medium text-amber-700">
              Chưa có buổi tập phù hợp để điểm danh.
            </p>
          )}
        </section>

        {/* Thống kê */}
        {selectedSession && (
          <>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-extrabold text-slate-900">
                Thống kê buổi tập
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {/* Tổng */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white   p-4 shadow-md shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-white  " />
                <div className="flex items-start justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                    Tổng học viên
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                    <Users className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-2 text-3xl font-black text-gray-900">
                  {statistics.total}
                </p>
              </div>

              {STATUS_OPTIONS.map((status) => {
                const Icon = status.icon;
                return (
                  <div
                    key={status.value}
                    className={`relative overflow-hidden rounded-3xl border-2 bg-white p-4 shadow-md ${status.card}`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1.5 bg-white ${status.bar}`}
                    />
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-xs font-extrabold uppercase tracking-wider ${status.labelColor}`}
                      >
                        {status.label}
                      </span>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${status.iconBg}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className={`mt-2 text-3xl font-black ${status.numColor}`}>
                      {statistics[status.value]}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                  <ClipboardCheck className="h-5 w-5 text-red-600" />
                  Danh sách điểm danh
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Còn {statistics.chua_diem_danh} học viên chưa được điểm danh.
                </p>
              </div>

              <button
                type="button"
                onClick={markAllPresent}
                disabled={students.length === 0 || loadingStudents}
                className="rounded-full border border-emerald-300 bg-white from-emerald-50 to-teal-50 px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:from-emerald-100 hover:to-teal-100 disabled:opacity-50"
              >
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                Tất cả có mặt
              </button>
            </div>

            {/* Thông báo */}
            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-white   p-3.5 text-sm font-medium text-red-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white from-emerald-50 to-teal-50 p-3.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            )}

            {/* Bảng học viên */}
            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white/90 shadow-lg shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-white   p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm tên hoặc mã học viên..."
                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <span className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-900">
                  Hiển thị {filteredStudents.length}/{students.length} học viên
                </span>
              </div>

              {loadingStudents ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Đang tải danh sách học viên...
                </div>
              ) : students.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 font-bold text-slate-700">
                    Lớp học chưa có học viên hoạt động.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Hãy kiểm tra danh sách đăng ký học viên của lớp.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-white   text-xs font-extrabold uppercase tracking-wider text-gray-900">
                      <tr>
                        <th className="px-4 py-3.5">STT</th>
                        <th className="px-4 py-3.5">Học viên</th>
                        <th className="px-4 py-3.5">Mã học viên</th>
                        <th className="px-4 py-3.5">Trạng thái</th>
                        <th className="px-4 py-3.5">Ghi chú</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((student, index) => (
                        <tr
                          key={student.maHocVien}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {student.anhDaiDien ? (
                                <img
                                  src={student.anhDaiDien}
                                  alt=""
                                  className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-200"
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-xs">
                                  {student.hoTen.charAt(0).toUpperCase()}
                                </div>
                              )}

                              <span className="font-bold text-slate-900">
                                {student.hoTen}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {student.maSoHocVien}
                          </td>

                          <td className="px-4 py-3">
                            <select
                              value={student.trangThaiDiemDanh || ''}
                              onChange={(e) =>
                                updateStudent(
                                  student.maHocVien,
                                  'trangThaiDiemDanh',
                                  e.target.value as AttendanceStatus,
                                )
                              }
                              className={`w-32 rounded-full border px-3 py-2 text-xs font-bold outline-none ${STATUS_OPTIONS.find(
                                (s) => s.value === student.trangThaiDiemDanh,
                              )?.color ||
                                'border-gray-200 bg-white text-slate-500'
                                }`}
                            >
                              <option value="" disabled>
                                Chọn trạng thái
                              </option>

                              {STATUS_OPTIONS.map((status) => (
                                <option
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              value={student.ghiChu || ''}
                              onChange={(e) =>
                                updateStudent(
                                  student.maHocVien,
                                  'ghiChu',
                                  e.target.value,
                                )
                              }
                              placeholder="Nhập ghi chú..."
                              className="w-48 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-gray-200 bg-white   p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Kết quả sẽ được lưu vào hệ thống khi bạn nhấn nút bên cạnh.
                </p>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loadingStudents || students.length === 0}
                  className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 shadow-lg shadow-red-300/50 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    </AdminLayout>
  );
}
