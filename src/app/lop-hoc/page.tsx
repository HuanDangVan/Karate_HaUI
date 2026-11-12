'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  UserCheck,
  Users,
  RefreshCw,
  X,
  UserPlus,
  Flame,
} from 'lucide-react';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ClassItem, ClassStatus } from '@/types/class';

interface CoachOption {
  maHuanLuyenVien: number;
  hoTen: string;
}
interface ClassStudent {
  maHocVien: number;
  maSoHocVien: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  ngayDangKy: string | null;
  trangThaiDangKy: string;
}
const STATUS_LABEL: Record<ClassStatus, string> = {
  hoat_dong: 'Hoạt động',
  tam_dung: 'Tạm dừng',
  ngung_hoat_dong: 'Ngừng hoạt động',
};

const STATUS_STYLE: Record<ClassStatus, string> = {
  hoat_dong: 'border border-emerald-300 bg-emerald-100 text-emerald-700',
  tam_dung: 'border border-amber-300 bg-amber-100 text-amber-700',
  ngung_hoat_dong: 'border border-red-300 bg-red-100 text-red-700',
};

const EMPTY_FORM = {
  maSoLop: '',
  tenLop: '',
  maHuanLuyenVien: '',
  moTa: '',
  capDo: '',
  siSoToiDa: '30',
  donGiaMoiBuoi: '50000',
  trangThai: 'hoat_dong' as ClassStatus,
};

type ClassForm = typeof EMPTY_FORM;

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [modalType, setModalType] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<ClassForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // Quản lý học viên trong lớp
  const [managingClass, setManagingClass] = useState<ClassItem | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<ClassStudent[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentAction, setStudentAction] = useState(false);
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);

      const response = await fetch(`/api/classes?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể tải danh sách lớp học.');
      }

      setClasses(result.data || []);
      setCoaches(result.coaches || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => fetchClasses(), 300);
    return () => clearTimeout(timer);
  }, [fetchClasses]);

  const openAdd = () => {
    setSelectedClass(null);
    setForm(EMPTY_FORM);
    setModalType('add');
  };

  const openEdit = (item: ClassItem) => {
    setSelectedClass(item);
    setForm({
      maSoLop: item.maSoLop,
      tenLop: item.tenLop,
      maHuanLuyenVien: item.maHuanLuyenVien?.toString() || '',
      moTa: item.moTa || '',
      capDo: item.capDo || '',
      siSoToiDa: item.siSoToiDa.toString(),
      donGiaMoiBuoi: item.donGiaMoiBuoi.toString(),
      trangThai: item.trangThai,
    });
    setModalType('edit');
  };

  const openDetail = (item: ClassItem) => {
    setSelectedClass(item);
    setModalType('detail');
  };

  const closeModal = () => {
    if (saving) return;
    setModalType(null);
    setSelectedClass(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.maSoLop.trim() || !form.tenLop.trim()) {
      alert('Vui lòng nhập mã lớp và tên lớp.');
      return;
    }

    const capacity = Number(form.siSoToiDa);
    if (!Number.isInteger(capacity) || capacity < 1) {
      alert('Sĩ số tối đa phải là số nguyên lớn hơn 0.');
      return;
    }
    const donGia = Number(form.donGiaMoiBuoi);

    if (
      form.donGiaMoiBuoi.trim() === '' ||
      !Number.isFinite(donGia) ||
      donGia < 0
    ) {
      alert('Đơn giá mỗi buổi phải là số không âm.');
      return;
    }
    const payload = {
      maSoLop: form.maSoLop.trim(),
      tenLop: form.tenLop.trim(),
      maHuanLuyenVien: form.maHuanLuyenVien
        ? Number(form.maHuanLuyenVien)
        : null,
      moTa: form.moTa.trim(),
      capDo: form.capDo.trim(),
      siSoToiDa: capacity,
      donGiaMoiBuoi: donGia,
      trangThai: form.trangThai,
    };

    try {
      setSaving(true);

      const isEditing = modalType === 'edit';
      const url = isEditing
        ? `/api/classes/${selectedClass?.maLop}`
        : '/api/classes';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể lưu thông tin lớp học.');
      }

      alert(isEditing ? 'Cập nhật lớp học thành công!' : 'Thêm lớp học thành công!');
      setModalType(null);
      setSelectedClass(null);
      fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (item: ClassItem, newStatus: ClassStatus) => {
    try {
      const response = await fetch(`/api/classes/${item.maLop}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể cập nhật trạng thái.');
      }

      fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    }
  };

  const handleDelete = async (item: ClassItem) => {
    if (item.trangThai === 'ngung_hoat_dong') return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ngừng hoạt động lớp "${item.tenLop}" không?`
    );

    if (!confirmed) return;

    await handleStatusChange(item, 'ngung_hoat_dong');
  };
  // Tải danh sách học viên trong lớp và học viên có thể thêm
  const fetchClassStudents = async (maLop: number) => {
    try {
      setLoadingStudents(true);

      const [classResponse, availableResponse] = await Promise.all([
        fetch(`/api/classes/${maLop}/students`),
        fetch(
          `/api/classes/${maLop}/students?type=available&search=${encodeURIComponent(studentSearch)}`
        ),
      ]);

      const classResult = await classResponse.json();
      const availableResult = await availableResponse.json();

      if (!classResponse.ok || !classResult.success) {
        throw new Error(classResult.message || 'Không thể tải học viên trong lớp.');
      }

      if (!availableResponse.ok || !availableResult.success) {
        throw new Error(availableResult.message || 'Không thể tải danh sách học viên.');
      }

      setClassStudents(classResult.data || []);
      setAvailableStudents(availableResult.data || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi tải danh sách học viên.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Mở cửa sổ quản lý học viên
  const openManageStudents = (item: ClassItem) => {
    setManagingClass(item);
    setStudentSearch('');
    setClassStudents([]);
    setAvailableStudents([]);
    fetchClassStudents(item.maLop);
  };

  // Thêm học viên vào lớp
  const handleAddStudent = async (maHocVien: number) => {
    if (!managingClass) return;

    try {
      setStudentAction(true);

      const response = await fetch(
        `/api/classes/${managingClass.maLop}/students`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maHocVien }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể thêm học viên vào lớp.');
      }

      await fetchClassStudents(managingClass.maLop);
      await fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setStudentAction(false);
    }
  };

  // Duyệt hoặc từ chối yêu cầu đăng ký lớp
  const handleRegistrationAction = async (
    student: ClassStudent,
    action: 'approve' | 'reject'
  ) => {
    if (!managingClass) return;

    if (action === 'reject') {
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn từ chối yêu cầu đăng ký của "${student.hoTen}" không?`
      );

      if (!confirmed) return;
    }

    try {
      setStudentAction(true);

      const response = await fetch(
        `/api/classes/${managingClass.maLop}/students`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            maHocVien: student.maHocVien,
            action,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể xử lý yêu cầu đăng ký.');
      }

      alert(result.message);

      await fetchClassStudents(managingClass.maLop);
      await fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setStudentAction(false);
    }
  };

  // Xóa học viên khỏi lớp
  const handleRemoveStudent = async (student: ClassStudent) => {
    if (!managingClass) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa học viên "${student.hoTen}" khỏi lớp "${managingClass.tenLop}" không?`
    );

    if (!confirmed) return;

    try {
      setStudentAction(true);

      const response = await fetch(
        `/api/classes/${managingClass.maLop}/students`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maHocVien: student.maHocVien }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể xóa học viên khỏi lớp.');
      }

      await fetchClassStudents(managingClass.maLop);
      await fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setStudentAction(false);
    }
  };
  const totalClasses = classes.length;
  const activeClasses = classes.filter((item) => item.trangThai === 'hoat_dong').length;
  const pausedClasses = classes.filter((item) => item.trangThai === 'tam_dung').length;
  const totalStudents = classes.reduce((sum, item) => sum + item.siSoHienTai, 0);

  const updateForm = (field: keyof ClassForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <AdminLayout pageTitle="Quản lý lớp học">
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-pink-200/70 bg-gradient-to-br from-pink-50 via-rose-50 to-sky-100 p-6 shadow-lg shadow-pink-200/40 sm:p-8">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-2 select-none text-[120px] font-black leading-none text-rose-300/30"
          >
            空手
          </span>

          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md shadow-red-300/50">
                  <Flame className="h-3.5 w-3.5" />
                  Karate-HaUI
                </span>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-sky-300/50">
                  Đại học Công Nghiệp Hà Nội
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Quản Lý Lớp Học <span className="text-red-600">Karate-HaUI</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Quản lý thông tin, huấn luyện viên và sĩ số các lớp của câu lạc
                bộ một cách chuẩn xác, đậm đà tinh thần võ đạo.
              </p>
            </div>

            <button
              onClick={openAdd}
              className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-300/50 transition hover:from-red-700 hover:to-pink-600"
            >
              <Plus size={18} />
              Thêm lớp học
            </button>
          </div>
        </section>

        {/* Thống kê */}
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-extrabold text-slate-900">Thống kê lớp học</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng số lớp học" value={totalClasses} icon={<BookOpen size={22} />} color="red" />
          <StatCard title="Đang hoạt động" value={activeClasses} icon={<UserCheck size={22} />} color="sky" />
          <StatCard title="Tạm dừng" value={pausedClasses} icon={<BookOpen size={22} />} color="amber" />
          <StatCard title="Tổng học viên trong lớp" value={totalStudents} icon={<Users size={22} />} color="purple" />
        </div>

        {/* Danh sách */}
        <div className="overflow-hidden rounded-3xl border border-pink-200 bg-white/90 shadow-lg shadow-pink-200/40">
          <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-sky-50 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Danh sách lớp học</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Tìm kiếm và quản lý thông tin các lớp Karate.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm tên lớp, mã lớp, cấp độ..."
                    className="w-full rounded-full border border-pink-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 sm:w-72"
                  />
                </div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-full border border-pink-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="tam_dung">Tạm dừng</option>
                  <option value="ngung_hoat_dong">Ngừng hoạt động</option>
                </select>

                <button
                  onClick={fetchClasses}
                  disabled={loading}
                  title="Làm mới danh sách"
                  className="flex items-center justify-center rounded-full border border-pink-200 bg-white px-3.5 py-2.5 text-rose-600 transition hover:bg-pink-50 disabled:opacity-50"
                >
                  <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 text-sm text-red-700">
              {error}
              <button onClick={fetchClasses} className="ml-2 font-semibold underline">
                Thử lại
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-gradient-to-r from-rose-50 to-pink-50 text-xs uppercase tracking-wider text-rose-900">
                <tr>
                  <th className="px-5 py-4 font-extrabold">Lớp học</th>
                  <th className="px-5 py-4 font-extrabold">Cấp độ</th>
                  <th className="px-5 py-4 font-extrabold">Đơn giá/buổi</th>
                  <th className="px-5 py-4 font-extrabold">Huấn luyện viên</th>
                  <th className="px-5 py-4 font-extrabold">Sĩ số</th>
                  <th className="px-5 py-4 font-extrabold">Trạng thái</th>
                  <th className="px-5 py-4 text-center font-extrabold">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pink-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                      <RefreshCw size={22} className="mx-auto mb-2 animate-spin text-rose-500" />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                      <BookOpen size={32} className="mx-auto mb-2 text-pink-300" />
                      Không tìm thấy lớp học nào.
                    </td>
                  </tr>
                ) : (
                  classes.map((item) => (
                    <tr key={item.maLop} className="transition hover:bg-pink-50/70">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{item.tenLop}</p>
                        <p className="mt-1 text-xs text-zinc-500">{item.maSoLop}</p>
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {item.capDo || 'Chưa cập nhật'}
                      </td>
                      <td className="px-5 py-4 font-medium text-zinc-800">
                        {Number(item.donGiaMoiBuoi).toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-5 py-4 text-zinc-600">
                        {item.tenHuanLuyenVien || 'Chưa phân công'}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-zinc-800">{item.siSoHienTai}</span>
                        <span className="text-zinc-500"> / {item.siSoToiDa}</span>
                        <div className="mt-1.5 h-2 w-24 overflow-hidden rounded-full bg-pink-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-pink-500"
                            style={{
                              width: `${Math.min(100, (item.siSoHienTai / item.siSoToiDa) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[item.trangThai]}`}>
                            {STATUS_LABEL[item.trangThai]}
                          </span>

                          <select
                            value={item.trangThai}
                            onChange={(e) => handleStatusChange(item, e.target.value as ClassStatus)}
                            className="max-w-[155px] rounded-full border border-pink-200 bg-white px-2.5 py-1 text-xs text-zinc-600 outline-none focus:border-rose-500"
                            aria-label={`Đổi trạng thái lớp ${item.tenLop}`}
                          >
                            <option value="hoat_dong">Hoạt động</option>
                            <option value="tam_dung">Tạm dừng</option>
                            <option value="ngung_hoat_dong">Ngừng hoạt động</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openDetail(item)} title="Xem chi tiết" className="rounded-full p-2 text-sky-600 transition hover:bg-sky-100">
                            <Eye size={17} />
                          </button>
                          <button onClick={() => openEdit(item)} title="Chỉnh sửa" className="rounded-full p-2 text-amber-600 transition hover:bg-amber-100">
                            <Pencil size={17} />
                          </button>
                          {item.trangThai !== 'ngung_hoat_dong' && (
                            <button onClick={() => handleDelete(item)} title="Ngừng hoạt động" className="rounded-full p-2 text-red-600 transition hover:bg-red-100">
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => openManageStudents(item)}
                          title="Quản lý học viên"
                          className="rounded-full p-2 text-emerald-600 transition hover:bg-emerald-100"
                        >
                          <UserPlus size={17} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-pink-100 bg-gradient-to-r from-pink-50 to-sky-50 px-5 py-3 text-xs font-medium text-rose-800">
            Hiển thị {classes.length} lớp học
          </div>
        </div>
      </div>

      {/* Modal thêm / sửa */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-rose-950/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-3xl border border-pink-200 bg-white shadow-2xl shadow-pink-300/40">
            <div className="flex items-center justify-between rounded-t-3xl border-b border-pink-100 bg-gradient-to-r from-pink-50 to-sky-50 px-6 py-4">
              <h2 className="text-lg font-extrabold text-slate-900">
                {modalType === 'add' ? 'Thêm lớp học mới' : 'Chỉnh sửa lớp học'}
              </h2>
              <button onClick={closeModal} className="rounded-full p-2 text-rose-500 hover:bg-pink-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Mã lớp *">
                  <input required value={form.maSoLop} onChange={(e) => updateForm('maSoLop', e.target.value)} className="form-input" placeholder="VD: KARATE01" />
                </FormField>

                <FormField label="Tên lớp *">
                  <input required value={form.tenLop} onChange={(e) => updateForm('tenLop', e.target.value)} className="form-input" placeholder="VD: Karate cơ bản" />
                </FormField>

                <FormField label="Cấp độ">
                  <select value={form.capDo} onChange={(e) => updateForm('capDo', e.target.value)} className="form-input">
                    <option value="">Chọn cấp độ</option>
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                    <option value="Đội tuyển">Đội tuyển</option>
                  </select>
                </FormField>

                <FormField label="Huấn luyện viên">
                  <select value={form.maHuanLuyenVien} onChange={(e) => updateForm('maHuanLuyenVien', e.target.value)} className="form-input">
                    <option value="">Chưa phân công</option>
                    {coaches.map((coach) => (
                      <option key={coach.maHuanLuyenVien} value={coach.maHuanLuyenVien}>
                        {coach.hoTen}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Sĩ số tối đa *">
                  <input required type="number" min="1" value={form.siSoToiDa} onChange={(e) => updateForm('siSoToiDa', e.target.value)} className="form-input" />
                </FormField>
                <FormField label="Đơn giá mỗi buổi (VNĐ) *">
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={form.donGiaMoiBuoi}
                    onChange={(e) => updateForm('donGiaMoiBuoi', e.target.value)}
                    className="form-input"
                    placeholder="VD: 50000"
                  />
                </FormField>
                <FormField label="Trạng thái">
                  <select value={form.trangThai} onChange={(e) => updateForm('trangThai', e.target.value)} className="form-input">
                    <option value="hoat_dong">Hoạt động</option>
                    <option value="tam_dung">Tạm dừng</option>
                    <option value="ngung_hoat_dong">Ngừng hoạt động</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Mô tả">
                <textarea rows={3} value={form.moTa} onChange={(e) => updateForm('moTa', e.target.value)} className="form-input" placeholder="Thông tin giới thiệu về lớp học..." />
              </FormField>

              <div className="flex justify-end gap-3 border-t border-pink-100 pt-4">
                <button type="button" onClick={closeModal} disabled={saving} className="rounded-full border border-pink-200 px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-pink-50">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-red-600 to-pink-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-red-300/50 hover:from-red-700 hover:to-pink-600 disabled:opacity-50">
                  {saving ? 'Đang lưu...' : modalType === 'add' ? 'Thêm lớp học' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết */}
      {modalType === 'detail' && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-pink-200 bg-white shadow-2xl shadow-pink-300/40">
            <div className="flex items-center justify-between rounded-t-3xl border-b border-pink-100 bg-gradient-to-r from-pink-50 to-sky-50 px-6 py-4">
              <h2 className="text-lg font-extrabold text-slate-900">Thông tin lớp học</h2>
              <button onClick={closeModal} className="rounded-full p-2 text-rose-500 hover:bg-pink-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <DetailRow label="Mã lớp" value={selectedClass.maSoLop} />
              <DetailRow label="Tên lớp" value={selectedClass.tenLop} />
              <DetailRow label="Cấp độ" value={selectedClass.capDo || 'Chưa cập nhật'} />
              <DetailRow label="Huấn luyện viên" value={selectedClass.tenHuanLuyenVien || 'Chưa phân công'} />
              <DetailRow label="Sĩ số hiện tại" value={`${selectedClass.siSoHienTai} / ${selectedClass.siSoToiDa}`} />
              <DetailRow
                label="Đơn giá mỗi buổi"
                value={`${Number(selectedClass.donGiaMoiBuoi).toLocaleString('vi-VN')} VNĐ`}
              />
              <DetailRow label="Trạng thái" value={STATUS_LABEL[selectedClass.trangThai]} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Mô tả</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{selectedClass.moTa || 'Chưa có mô tả.'}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-pink-100 px-6 py-4">
              <button onClick={closeModal} className="rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-pink-200">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý học viên trong lớp */}
      {managingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-rose-950/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-4xl rounded-3xl border border-pink-200 bg-white shadow-2xl shadow-pink-300/40">
            <div className="flex items-center justify-between rounded-t-3xl border-b border-pink-100 bg-gradient-to-r from-pink-50 to-sky-50 px-6 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Quản lý học viên
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {managingClass.maSoLop} - {managingClass.tenLop}
                </p>
              </div>

              <button
                onClick={() => setManagingClass(null)}
                disabled={studentAction}
                className="rounded-full p-2 text-rose-500 hover:bg-pink-100"
              >
                <X size={20} />
              </button>
            </div>


            <div className="space-y-6 p-6">
              {/* Yêu cầu đăng ký đang chờ duyệt */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900">
                    Yêu cầu đăng ký chờ duyệt
                  </h3>
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {classStudents.filter(
                      (student) => student.trangThaiDangKy === 'cho_duyet'
                    ).length} yêu cầu
                  </span>
                </div>

                <div className="max-h-[250px] space-y-2 overflow-y-auto">
                  {loadingStudents ? (
                    <p className="py-5 text-center text-sm text-zinc-500">
                      Đang tải dữ liệu...
                    </p>
                  ) : classStudents.filter(
                    (student) => student.trangThaiDangKy === 'cho_duyet'
                  ).length === 0 ? (
                    <p className="rounded-2xl bg-pink-50/70 py-6 text-center text-sm text-zinc-500">
                      Không có yêu cầu đăng ký nào đang chờ duyệt.
                    </p>
                  ) : (
                    classStudents
                      .filter(
                        (student) => student.trangThaiDangKy === 'cho_duyet'
                      )
                      .map((student) => (
                        <div
                          key={student.maHocVien}
                          className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-900">
                              {student.hoTen}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {student.maSoHocVien} · {student.email}
                            </p>
                            <p className="mt-1 text-xs font-bold text-amber-700">
                              Đang chờ quản trị viên phê duyệt
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() =>
                                handleRegistrationAction(student, 'approve')
                              }
                              disabled={studentAction}
                              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-300/50 hover:opacity-90 disabled:opacity-50"
                            >
                              Duyệt
                            </button>

                            <button
                              onClick={() =>
                                handleRegistrationAction(student, 'reject')
                              }
                              disabled={studentAction}
                              className="rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-300/50 hover:opacity-90 disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>

              {/* Danh sách học viên và thêm học viên */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Học viên đang học */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900">
                      Học viên trong lớp
                    </h3>
                    <span className="rounded-full border border-pink-300 bg-pink-100 px-3 py-1 text-xs font-bold text-rose-700">
                      {classStudents.filter(
                        (student) => student.trangThaiDangKy === 'dang_hoc'
                      ).length}/{managingClass.siSoToiDa}
                    </span>
                  </div>

                  <div className="max-h-[350px] space-y-2 overflow-y-auto">
                    {loadingStudents ? (
                      <p className="py-8 text-center text-sm text-zinc-500">
                        Đang tải dữ liệu...
                      </p>
                    ) : classStudents.filter(
                      (student) => student.trangThaiDangKy === 'dang_hoc'
                    ).length === 0 ? (
                      <p className="rounded-2xl bg-pink-50/70 py-8 text-center text-sm text-zinc-500">
                        Lớp chưa có học viên đang học.
                      </p>
                    ) : (
                      classStudents
                        .filter(
                          (student) => student.trangThaiDangKy === 'dang_hoc'
                        )
                        .map((student) => (
                          <div
                            key={student.maHocVien}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-white p-3 transition hover:bg-pink-50/50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-900">
                                {student.hoTen}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {student.maSoHocVien}
                              </p>
                              <p className="mt-1 truncate text-xs text-zinc-500">
                                {student.email}
                              </p>
                              <span className="mt-2 inline-block rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                Đang học
                              </span>
                            </div>

                            <button
                              onClick={() => handleRemoveStudent(student)}
                              disabled={studentAction}
                              title="Xóa khỏi lớp"
                              className="shrink-0 rounded-full p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </section>

                {/* Thêm học viên vào lớp */}
                <section>
                  <h3 className="mb-4 font-extrabold text-slate-900">
                    Thêm học viên vào lớp
                  </h3>

                  <div className="relative mb-3">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400"
                    />
                    <input
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Tìm tên, mã học viên, email..."
                      className="w-full rounded-full border border-pink-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>

                  <button
                    onClick={() => fetchClassStudents(managingClass.maLop)}
                    disabled={loadingStudents}
                    className="mb-3 text-xs font-bold text-rose-600 hover:underline"
                  >
                    Tìm kiếm
                  </button>

                  <div className="max-h-[350px] space-y-2 overflow-y-auto">
                    {loadingStudents ? (
                      <p className="py-8 text-center text-sm text-zinc-500">
                        Đang tải dữ liệu...
                      </p>
                    ) : availableStudents.length === 0 ? (
                      <p className="rounded-2xl bg-pink-50/70 py-8 text-center text-sm text-zinc-500">
                        Không có học viên phù hợp.
                      </p>
                    ) : (
                      availableStudents.map((student) => (
                        <div
                          key={student.maHocVien}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-white p-3 transition hover:bg-pink-50/50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-900">
                              {student.hoTen}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {student.maSoHocVien}
                            </p>
                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {student.email}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddStudent(student.maHocVien)}
                            disabled={
                              studentAction ||
                              classStudents.filter(
                                (item) => item.trangThaiDangKy === 'dang_hoc'
                              ).length >= managingClass.siSoToiDa
                            }
                            title="Thêm vào lớp"
                            className="shrink-0 rounded-full bg-gradient-to-r from-red-600 to-pink-500 p-2 text-white shadow-md shadow-red-300/50 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={17} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {classStudents.filter(
                    (student) => student.trangThaiDangKy === 'dang_hoc'
                  ).length >= managingClass.siSoToiDa && (
                      <p className="mt-3 text-xs text-red-600">
                        Lớp đã đạt sĩ số tối đa, không thể thêm học viên.
                      </p>
                    )}
                </section>
              </div>
            </div>

            <div className="flex justify-between border-t border-pink-100 px-6 py-4">
              <p className="text-xs text-zinc-500">
                Sĩ số: {classStudents.filter(
                  (student) => student.trangThaiDangKy === 'dang_hoc'
                ).length}/{managingClass.siSoToiDa}
              </p>

              <button
                onClick={() => setManagingClass(null)}
                disabled={studentAction}
                className="rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-pink-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'sky' | 'amber' | 'purple';
}) {
  const styles = {
    red: {
      card: 'border-pink-200 from-pink-50 to-rose-100 shadow-pink-200/50',
      bar: 'from-red-600 to-pink-500',
      icon: 'from-red-600 to-rose-500 shadow-red-300/60',
      title: 'text-rose-900',
      num: 'text-rose-950',
    },
    sky: {
      card: 'border-sky-200 from-sky-50 to-cyan-100 shadow-sky-200/50',
      bar: 'from-blue-500 to-cyan-400',
      icon: 'from-sky-500 to-cyan-500 shadow-sky-300/60',
      title: 'text-sky-900',
      num: 'text-sky-950',
    },
    amber: {
      card: 'border-amber-200 from-amber-50 to-orange-100 shadow-amber-200/50',
      bar: 'from-red-500 via-orange-500 to-amber-400',
      icon: 'from-amber-500 to-orange-500 shadow-amber-300/60',
      title: 'text-amber-900',
      num: 'text-amber-950',
    },
    purple: {
      card: 'border-purple-200 from-fuchsia-50 to-purple-100 shadow-purple-200/50',
      bar: 'from-pink-500 to-purple-600',
      icon: 'from-purple-500 to-fuchsia-600 shadow-purple-300/60',
      title: 'text-purple-900',
      num: 'text-purple-950',
    },
  }[color];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br p-5 shadow-md ${styles.card}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${styles.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-extrabold uppercase tracking-wider ${styles.title}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-black ${styles.num}`}>{value}</p>
        </div>
        <div
          className={`rounded-xl bg-gradient-to-br p-3 text-white shadow-lg ${styles.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-rose-900">{label}</span>
      {children}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-pink-100 pb-3 sm:flex-row sm:justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-rose-700">{label}</span>
      <span className="text-sm font-semibold text-slate-900 sm:text-right">{value}</span>
    </div>
  );
}
