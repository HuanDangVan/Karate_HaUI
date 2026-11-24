'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit3,
  Users,
  UserCheck,
  UserX,
  PauseCircle,
  AlertCircle,
  Trash2,
  Flame,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { StudentItem, StudentStatus } from '@/types/student';
import { AddStudentModal } from '@/components/students/AddStudentModal';
import { EditStudentModal } from '@/components/students/EditStudentModal';
import { StudentDetailModal } from '@/components/students/StudentDetailModal';
import { StudentStatusBadge } from '@/components/students/StudentStatusBadge';

type StatusFilter = '' | StudentStatus;

interface StudentsResponse {
  success: boolean;
  data?: StudentItem[];
  total?: number;
  suggestedCode?: string;
  message?: string;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';

  const datePart = value.split('T')[0];
  const parts = datePart.split('-');

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

export default function StudentsPage() {
  const handleDelete = async (student: StudentItem) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ngừng hoạt động học viên "${student.hoTen}" không?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/students/${student.maHocVien}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trangThai: 'ngung_hoat_dong',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Không thể xóa học viên.');
      }

      alert('Đã chuyển học viên sang trạng thái ngừng hoạt động.');
      fetchStudents();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra.');
    }
  };
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [suggestedCode, setSuggestedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set('search', search.trim());
      }

      if (status) {
        params.set('status', status);
      }

      const response = await fetch(`/api/students?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const result: StudentsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể tải danh sách học viên.');
      }

      setStudents(result.data || []);
      setSuggestedCode(result.suggestedCode || '');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi tải danh sách học viên.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddSuccess = () => {
    fetchStudents();
  };

  const handleEdit = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const handleStatusChange = async (
    student: StudentItem,
    newStatus: StudentStatus
  ) => {
    if (student.trangThai === newStatus) return;

    const statusNames: Record<StudentStatus, string> = {
      hoat_dong: 'Đang học',
      tam_dung: 'Tạm dừng',
      ngung_hoat_dong: 'Đã nghỉ học',
    };

    const confirmed = window.confirm(
      `Bạn có chắc muốn chuyển học viên "${student.hoTen}" sang trạng thái "${statusNames[newStatus]}" không?`
    );

    if (!confirmed) {
      fetchStudents();
      return;
    }

    try {
      const response = await fetch(`/api/students/${student.maHocVien}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trangThai: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể cập nhật trạng thái.');
      }

      await fetchStudents();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : 'Có lỗi xảy ra khi cập nhật trạng thái học viên.'
      );

      await fetchStudents();
    }
  };

  const activeCount = students.filter(
    (student) => student.trangThai === 'hoat_dong'
  ).length;

  const pausedCount = students.filter(
    (student) => student.trangThai === 'tam_dung'
  ).length;

  const stoppedCount = students.filter(
    (student) => student.trangThai === 'ngung_hoat_dong'
  ).length;

  return (
    <AdminLayout pageTitle="Quản lý học viên">
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-xs">
                  <Flame className="h-3.5 w-3.5 text-yellow-300" />
                  Karate-HaUI
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  Đại học Công Nghiệp Hà Nội
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Quản Lý Học Viên
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                Quản lý hồ sơ, thông tin liên hệ và tình trạng tham gia của học viên trong câu lạc bộ.
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Thêm học viên
            </button>
          </div>
        </section>

        {/* Thống kê */}
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">
            Thống kê học viên
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Tổng học viên',
              value: students.length,
              icon: Users,
              iconColor: 'text-blue-600',
              iconBg: 'bg-blue-50',
            },
            {
              label: 'Đang học',
              value: activeCount,
              icon: UserCheck,
              iconColor: 'text-emerald-600',
              iconBg: 'bg-emerald-50',
            },
            {
              label: 'Tạm dừng',
              value: pausedCount,
              icon: PauseCircle,
              iconColor: 'text-amber-600',
              iconBg: 'bg-amber-50',
            },
            {
              label: 'Đã nghỉ học',
              value: stoppedCount,
              icon: UserX,
              iconColor: 'text-gray-500',
              iconBg: 'bg-gray-100',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-2.5 ${item.iconBg} ${item.iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Danh sách học viên */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="border-b border-gray-200 bg-gray-50/50 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Danh sách học viên
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Dữ liệu được cập nhật từ hệ thống câu lạc bộ.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm tên, email, mã học viên..."
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
                  />
                </div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="hoat_dong">Đang học</option>
                  <option value="tam_dung">Tạm dừng</option>
                  <option value="ngung_hoat_dong">Đã nghỉ học</option>
                </select>

                <button
                  onClick={fetchStudents}
                  disabled={loading}
                  title="Tải lại danh sách"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3.5 py-2.5 text-blue-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Lỗi tải dữ liệu */}
          {error && (
            <div className="m-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-white   p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Không thể tải danh sách học viên</p>
                <p className="mt-1">{error}</p>
                <button
                  onClick={fetchStudents}
                  className="mt-2 font-semibold underline"
                >
                  Thử tải lại
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wider text-gray-900">
                <tr>
                  <th className="px-5 py-4 font-extrabold">Học viên</th>
                  <th className="px-5 py-4 font-extrabold">Mã học viên</th>
                  <th className="px-5 py-4 font-extrabold">Liên hệ</th>
                  <th className="px-5 py-4 font-extrabold">Ngày tham gia</th>
                  <th className="px-5 py-4 font-extrabold">Chuyên cần</th>
                  <th className="px-5 py-4 font-extrabold">Trạng thái</th>
                  <th className="px-5 py-4 text-center font-extrabold">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                      <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />
                      Đang tải dữ liệu học viên...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-zinc-400">
                      Không có dữ liệu để hiển thị.
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <Users className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                      <p className="font-semibold text-zinc-700">
                        Chưa tìm thấy học viên
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Hãy thử thay đổi từ khóa hoặc thêm học viên mới.
                      </p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.maHocVien}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {student.hoTen}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          ID: #{student.maHocVien}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-900">
                          {student.maSoHocVien}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{student.email}</span>
                          </div>
                          {student.soDienThoai && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span>{student.soDienThoai}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{formatDate(student.ngayThamGia)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Có mặt:</span>
                            <span className="font-bold">{student.tongBuoiThamGia ?? 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 w-fit">
                            <XCircle className="h-3 w-3 text-rose-600" />
                            <span>Vắng:</span>
                            <span className="font-bold">{student.tongBuoiVang ?? 0}</span>
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <StudentStatusBadge status={student.trangThai} />

                          <select
                            aria-label={`Đổi trạng thái của ${student.hoTen}`}
                            value={student.trangThai}
                            onChange={(e) =>
                              handleStatusChange(
                                student,
                                e.target.value as StudentStatus
                              )
                            }
                            className="max-w-36 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-zinc-600 outline-none focus:border-blue-500"
                          >
                            <option value="hoat_dong">Đang học</option>
                            <option value="tam_dung">Tạm dừng</option>
                            <option value="ngung_hoat_dong">Đã nghỉ học</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Xem chi tiết */}
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDetailOpen(true);
                            }}
                            title="Xem chi tiết"
                            className="rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-600 transition hover:bg-sky-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Chỉnh sửa */}
                          <button
                            onClick={() => handleEdit(student)}
                            title="Chỉnh sửa"
                            className="rounded-full border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={() => handleDelete(student)}
                            title="Ngừng hoạt động học viên"
                            className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 bg-white   px-5 py-3 text-xs font-medium text-gray-900">
            Hiển thị {students.length} học viên
          </div>
        </div>

        {/* Các cửa sổ chức năng */}
        <AddStudentModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={handleAddSuccess}
          suggestedCode={suggestedCode}
        />

        <EditStudentModal
          isOpen={isEditOpen}
          student={selectedStudent}
          onClose={() => setIsEditOpen(false)}
          onSuccess={fetchStudents}
        />

        <StudentDetailModal
          isOpen={isDetailOpen}
          student={selectedStudent}
          onClose={() => setIsDetailOpen(false)}
          onEdit={handleEdit}
        />
      </div>
    </AdminLayout>
  );
}
