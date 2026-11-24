
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserRound,
  RefreshCw,
} from 'lucide-react';

import { AdminLayout } from '@/components/layout/AdminLayout';
import CoachStatusBadge from '@/components/coaches/CoachStatusBadge';
import AddCoachModal from '@/components/coaches/AddCoachModal';
import EditCoachModal from '@/components/coaches/EditCoachModal';
import CoachDetailModal from '@/components/coaches/CoachDetailModal';

import { CoachItem, CoachStatus } from '@/types/coach';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedCoach, setSelectedCoach] = useState<CoachItem | null>(null);

  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);

      const response = await fetch(`/api/coaches?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể tải danh sách huấn luyện viên.');
      }

      setCoaches(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi tải dữ liệu.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoaches();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchCoaches]);

  const handleAddSuccess = () => {
    fetchCoaches();
  };

  const handleEditSuccess = () => {
    fetchCoaches();
  };

  const handleView = (coach: CoachItem) => {
    setSelectedCoach(coach);
    setIsDetailOpen(true);
  };

  const handleEdit = (coach: CoachItem) => {
    setSelectedCoach(coach);
    setIsEditOpen(true);
  };

  const handleDelete = async (coach: CoachItem) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ngừng hoạt động huấn luyện viên "${coach.hoTen}" không?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/coaches/${coach.maHuanLuyenVien}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trangThai: 'ngung_hoat_dong',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể cập nhật trạng thái.');
      }

      alert('Đã cập nhật trạng thái huấn luyện viên!');
      fetchCoaches();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi cập nhật trạng thái.'
      );
    }
  };

  const handleStatusChange = async (
    coach: CoachItem,
    newStatus: CoachStatus
  ) => {
    try {
      const response = await fetch(
        `/api/coaches/${coach.maHuanLuyenVien}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trangThai: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể cập nhật trạng thái.');
      }

      fetchCoaches();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi cập nhật trạng thái.'
      );
    }
  };

  const totalCoaches = coaches.length;
  const activeCoaches = coaches.filter(
    (coach) => coach.trangThai === 'hoat_dong'
  ).length;
  const pausedCoaches = coaches.filter(
    (coach) => coach.trangThai === 'tam_dung'
  ).length;
  const inactiveCoaches = coaches.filter(
    (coach) => coach.trangThai === 'ngung_hoat_dong'
  ).length;

  return (
    <AdminLayout pageTitle="Quản lý huấn luyện viên">
      <div className="space-y-6 rounded-3xl border border-gray-200 bg-white    p-4 shadow-inner sm:p-6">
        {/* Tiêu đề trang */}
        <div className="relative overflow-hidden flex flex-col justify-between gap-4 rounded-3xl border-2 border-gray-200 bg-white    p-5 shadow-md shadow-sm sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Quản lý huấn luyện viên
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Quản lý thông tin và trạng thái đội ngũ huấn luyện viên CLB Karate-HaUI — Đại học Công Nghiệp Hà Nội.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 shadow-md shadow-red-300/40 transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
          >
            <Plus size={18} />
            Thêm huấn luyện viên
          </button>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border-2 border-gray-300 bg-white    p-5 shadow-sm shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Tổng huấn luyện viên</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {totalCoaches}
                </p>
              </div>
              <div className="rounded-xl bg-white   p-3 text-blue-600">
                <Users size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-sky-300 bg-white   to-teal-100 p-5 shadow-sm shadow-sky-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Đang hoạt động</p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {activeCoaches}
                </p>
              </div>
              <div className="rounded-xl bg-white from-emerald-100 to-teal-100 p-3 text-emerald-600">
                <UserCheck size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-violet-300 bg-white    p-5 shadow-sm shadow-violet-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Tạm dừng</p>
                <p className="mt-2 text-2xl font-bold text-yellow-600">
                  {pausedCoaches}
                </p>
              </div>
              <div className="rounded-xl bg-white from-amber-100 to-orange-100 p-3 text-amber-600">
                <UserRound size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-amber-300 bg-white from-amber-100 via-orange-100 to-yellow-100 p-5 shadow-sm shadow-amber-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Ngừng hoạt động</p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {inactiveCoaches}
                </p>
              </div>
              <div className="rounded-xl bg-white   p-3 text-blue-600">
                <UserRound size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách huấn luyện viên */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white from-white   shadow-md shadow-sm">
          <div className="border-b-2 border-gray-200 bg-white    p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-zinc-900">
                  Danh sách huấn luyện viên
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Tìm kiếm, xem và quản lý thông tin huấn luyện viên.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm tên, email, mã số..."
                    className="w-full rounded-xl border-2 border-sky-200 bg-white/90 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 sm:w-64"
                  />
                </div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-xl border-2 border-violet-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="tam_dung">Tạm dừng</option>
                  <option value="ngung_hoat_dong">Ngừng hoạt động</option>
                </select>

                <button
                  onClick={fetchCoaches}
                  disabled={loading}
                  title="Làm mới danh sách"
                  className="flex items-center justify-center rounded-xl border-2 border-sky-300 bg-sky-100 px-3 py-2.5 text-sky-700 shadow-sm transition hover:bg-sky-200 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={loading ? 'animate-spin' : ''}
                  />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-2xl border-2 border-red-300 bg-white   px-4 py-3 text-sm font-semibold text-red-800">
              {error}
              <button
                onClick={fetchCoaches}
                className="ml-2 font-semibold underline"
              >
                Thử lại
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white    text-xs font-black uppercase text-slate-700">
                <tr>
                  <th className="px-5 py-4 font-semibold">Huấn luyện viên</th>
                  <th className="px-5 py-4 font-semibold">Mã số</th>
                  <th className="px-5 py-4 font-semibold">Chuyên môn</th>
                  <th className="px-5 py-4 font-semibold">Kinh nghiệm</th>
                  <th className="px-5 py-4 font-semibold">Trạng thái</th>
                  <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-gray-100 bg-white/65">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                      <RefreshCw size={22} className="mx-auto mb-2 animate-spin" />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : coaches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                      <Users size={32} className="mx-auto mb-2 text-zinc-300" />
                      Không tìm thấy huấn luyện viên nào.
                    </td>
                  </tr>
                ) : (
                  coaches.map((coach) => (
                    <tr
                      key={coach.maHuanLuyenVien}
                      className="transition-all hover:bg-white hover:bg-blue-700 hover:"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white  to-violet-100 text-sky-700">
                            {coach.anhDaiDien ? (
                              <img
                                src={coach.anhDaiDien}
                                alt={coach.hoTen}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound size={20} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-zinc-900">
                              {coach.hoTen}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {coach.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-zinc-700">
                        {coach.maSoHuanLuyenVien}
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {coach.chuyenMon || 'Chưa cập nhật'}
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {coach.soNamKinhNghiem !== null &&
                          coach.soNamKinhNghiem !== undefined
                          ? `${coach.soNamKinhNghiem} năm`
                          : 'Chưa cập nhật'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <CoachStatusBadge status={coach.trangThai} />

                          <select
                            value={coach.trangThai}
                            onChange={(e) =>
                              handleStatusChange(
                                coach,
                                e.target.value as CoachStatus
                              )
                            }
                            className="max-w-[150px] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-zinc-600 outline-none focus:border-blue-500"
                            aria-label={`Đổi trạng thái ${coach.hoTen}`}
                          >
                            <option value="hoat_dong">Hoạt động</option>
                            <option value="tam_dung">Tạm dừng</option>
                            <option value="ngung_hoat_dong">Ngừng hoạt động</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleView(coach)}
                            title="Xem chi tiết"
                            className="rounded-xl bg-sky-100 p-2 text-sky-700 shadow-sm transition hover:scale-110 hover:bg-sky-200"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() => handleEdit(coach)}
                            title="Chỉnh sửa"
                            className="rounded-xl bg-amber-100 p-2 text-amber-700 shadow-sm transition hover:scale-110 hover:bg-amber-200"
                          >
                            <Pencil size={17} />
                          </button>

                          {coach.trangThai !== 'ngung_hoat_dong' && (
                            <button
                              onClick={() => handleDelete(coach)}
                              title="Ngừng hoạt động"
                              className="rounded-xl bg-gray-100 p-2 text-gray-900 shadow-sm transition hover:scale-110 hover:bg-gray-200"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t-2 border-gray-200 bg-white    px-5 py-3 text-xs font-bold text-slate-600">
            Hiển thị {coaches.length} huấn luyện viên
          </div>
        </div>
      </div>

      {/* Các cửa sổ chức năng */}
      <AddCoachModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditCoachModal
        isOpen={isEditOpen}
        coach={selectedCoach}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <CoachDetailModal
        isOpen={isDetailOpen}
        coach={selectedCoach}
        onClose={() => setIsDetailOpen(false)}
      />
    </AdminLayout>
  );
}
