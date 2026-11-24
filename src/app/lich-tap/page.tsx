'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type {
  ScheduleItem,
  ScheduleClassOption,
  ScheduleStatus,
} from '@/types/schedule';
import { ScheduleStatusBadge } from '@/components/schedules/ScheduleStatusBadge';
import { AddScheduleModal } from '@/components/schedules/AddScheduleModal';
import { EditScheduleModal } from '@/components/schedules/EditScheduleModal';
import { ScheduleDetailModal } from '@/components/schedules/ScheduleDetailModal';
import {
  CalendarDays,
  CheckCheck,
  Eye,
  Filter,
  Flame,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [classes, setClasses] = useState<ScheduleClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleItem | null>(null);
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleItem | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      if (search.trim()) params.set('search', search.trim());
      if (statusFilter) params.set('status', statusFilter);
      if (classFilter) params.set('maLop', classFilter);

      const response = await fetch(`/api/schedules?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách lịch tập.');
      }

      setSchedules(data.data || []);
      setClasses(data.classes || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu.',
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, classFilter]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const updateStatus = async (
    schedule: ScheduleItem,
    newStatus: ScheduleStatus,
  ) => {
    const statusLabels: Record<ScheduleStatus, string> = {
      da_len_lich: 'Đã lên lịch',
      da_hoan_thanh: 'Đã hoàn thành',
      da_huy: 'Đã hủy',
    };

    if (
      !window.confirm(
        `Bạn có chắc muốn chuyển lịch tập này sang trạng thái "${statusLabels[newStatus]}"?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/schedules/${schedule.maLichTap}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trangThai: newStatus }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật trạng thái.');
      }

      await fetchSchedules();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi.',
      );
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '—';

    const [year, month, day] = date.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time: string) => {
    return time ? time.slice(0, 5) : '—';
  };

  const totalSchedules = schedules.length;
  const plannedSchedules = schedules.filter(
    (item) => item.trangThai === 'da_len_lich',
  ).length;
  const completedSchedules = schedules.filter(
    (item) => item.trangThai === 'da_hoan_thanh',
  ).length;
  const cancelledSchedules = schedules.filter(
    (item) => item.trangThai === 'da_huy',
  ).length;

  return (
    <AdminLayout pageTitle="Quản lý lịch tập">
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
                Quản lý lịch tập{' '}
                <span className="bg-white   bg-clip-text text-transparent">
                  câu lạc bộ
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Sắp xếp lịch luyện tập, địa điểm và trạng thái các buổi tập của CLB Karate-HaUI.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/75 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm">
                <MapPin size={14} className="text-blue-600" />
                Chùa Tu Hoàng, Đại học Công Nghiệp Hà Nội
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="relative inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 lg:self-auto"
            >
              <Plus size={18} />
              Thêm lịch tập
            </button>
          </div>
        </section>

        {/* Thống kê */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-gray-200 bg-white   p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Tổng số lịch tập</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalSchedules}</p>
                <p className="mt-1 text-xs text-slate-500">Tất cả buổi tập</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
                <CalendarDays size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-sky-200 bg-white  to-cyan-100/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Đã lên lịch</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{plannedSchedules}</p>
                <p className="mt-1 text-xs text-slate-500">Buổi sắp diễn ra</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
                <CalendarDays size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-purple-200 bg-white   p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-purple-800">Đã hoàn thành</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{completedSchedules}</p>
                <p className="mt-1 text-xs text-slate-500">Buổi tập đã kết thúc</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3.5 text-purple-600">
                <CheckCheck size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-amber-200 bg-white from-amber-50 to-orange-100/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Đã hủy</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{cancelledSchedules}</p>
                <p className="mt-1 text-xs text-slate-500">Buổi tập đã hủy</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3.5 text-amber-600">
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="rounded-[26px] border border-gray-200 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-2.5 text-blue-600">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Bộ lọc lịch tập</h2>
              <p className="mt-0.5 text-xs text-slate-500">Tìm nhanh theo lớp và trạng thái buổi tập.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên lớp, mã lớp..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Lọc theo lớp
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Tất cả lớp học</option>
                {classes.map((item) => (
                  <option key={item.maLop} value={item.maLop}>
                    {item.maSoLop} - {item.tenLop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="da_len_lich">Đã lên lịch</option>
                <option value="da_hoan_thanh">Đã hoàn thành</option>
                <option value="da_huy">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách lịch tập */}
        <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 bg-white    p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-gray-100 p-2.5 text-blue-600">
                <CalendarDays size={18} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Danh sách lịch tập</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {schedules.length} buổi tập phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            </div>

            <button
              onClick={fetchSchedules}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/80 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-blue-600" />
              Đang tải dữ liệu...
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays size={40} className="mx-auto mb-3 text-gray-400" />
              <p className="font-semibold text-slate-700">
                Không tìm thấy lịch tập nào.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Bạn có thể thêm lịch tập mới bằng nút phía trên.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-white   text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Lớp học</th>
                    <th className="px-5 py-4 font-medium">Ngày tập</th>
                    <th className="px-5 py-4 font-medium">Thời gian</th>
                    <th className="px-5 py-4 font-medium">Địa điểm</th>
                    <th className="px-5 py-4 font-medium">Trạng thái</th>
                    <th className="px-5 py-4 text-center font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule.maLichTap}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {schedule.tenLop}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {schedule.maSoLop}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700">
                        {formatDate(schedule.ngayTap)}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {formatTime(schedule.gioBatDau)} -{' '}
                        {formatTime(schedule.gioKetThuc)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {schedule.diaDiem || 'Chưa cập nhật'}
                      </td>

                      <td className="px-5 py-4">
                        <ScheduleStatusBadge status={schedule.trangThai} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSchedule(schedule)}
                            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                            Xem
                          </button>

                          <button
                            onClick={() => setEditingSchedule(schedule)}
                            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={14} />
                            Sửa
                          </button>

                          <select
                            value={schedule.trangThai}
                            onChange={(e) =>
                              updateStatus(
                                schedule,
                                e.target.value as ScheduleStatus,
                              )
                            }
                            className="max-w-[145px] rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            title="Thay đổi trạng thái"
                          >
                            <option value="da_len_lich">Đã lên lịch</option>
                            <option value="da_hoan_thanh">
                              Đã hoàn thành
                            </option>
                            <option value="da_huy">Đã hủy</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="border-t border-gray-200 bg-white   px-5 py-3 text-sm text-slate-500">
              Hiển thị {schedules.length} lịch tập
            </div>
          )}
        </div>
      </div>

      {/* Các hộp thoại */}
      {showAddModal && (
        <AddScheduleModal
          classes={classes}
          onClose={() => setShowAddModal(false)}
          onCreated={fetchSchedules}
        />
      )}

      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          classes={classes}
          onClose={() => setEditingSchedule(null)}
          onUpdated={fetchSchedules}
        />
      )}

      {selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </AdminLayout>
  );
}