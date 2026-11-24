'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserRound,
  BookOpen,
  CalendarDays,
  UserPlus,
  CalendarPlus,
  MapPin,
  Clock,
  Megaphone,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Flame,
  Sparkles,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface DashboardData {
  tongQuan: {
    tongHocVien: number;
    tongHuanLuyenVien: number;
    tongLopHoc: number;
    tongLichTap: number;
  };
  hocVienTheoLop: {
    maLop: number;
    maSoLop: string;
    tenLop: string;
    soHocVien: number;
    siSoToiDa: number;
  }[];
  diemDanhTheoNgay: {
    ngay: string;
    tongLuotDiemDanh: number;
    soLuotCoMat: number;
  }[];
  lichTapSapToi: {
    maLichTap: number;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string;
    noiDung: string;
    tenLop: string;
    tenHuanLuyenVien: string | null;
  }[];
  thongBaoGanDay: {
    maThongBao: number;
    tieuDe: string;
    noiDung: string;
    ngayTao: string;
    nguoiTao: string | null;
  }[];
}

function formatDate(value: string) {
  const datePart = value.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {value.toLocaleString('vi-VN')}
          </p>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/dashboard', {
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Không thể tải dữ liệu trang chủ.'
        );
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi tải dữ liệu.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <AdminLayout pageTitle="Tổng quan hệ thống">
      <div className="space-y-6">
        {/* Banner */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
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

              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Hệ Thống Quản Lý Câu Lạc Bộ Karate-HaUI
              </h2>

              <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
                Theo dõi tình hình học viên, huấn luyện viên, lớp học và điểm
                danh hoạt động của câu lạc bộ tại một nơi tập trung và chuẩn xác.
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                <span>Địa chỉ: Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/hoc-vien"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
              >
                <UserPlus className="h-4 w-4" />
                Tiếp nhận học viên
              </Link>

              <Link
                href="/lich-tap"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 active:scale-98"
              >
                <CalendarPlus className="h-4 w-4 text-gray-500" />
                Quản lý lịch tập
              </Link>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-12 text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Đang tải dữ liệu...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="font-medium text-red-700">{error}</p>
            <button
              onClick={fetchDashboard}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Thử tải lại
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Stat cards */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thống kê tổng quan
                </h3>
                <button
                  onClick={fetchDashboard}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Làm mới
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Tổng học viên"
                  value={data.tongQuan.tongHocVien}
                  description="Học viên đang học"
                  icon={Users}
                />
                <StatCard
                  title="Huấn luyện viên"
                  value={data.tongQuan.tongHuanLuyenVien}
                  description="HLV đang giảng dạy"
                  icon={UserRound}
                />
                <StatCard
                  title="Lớp học"
                  value={data.tongQuan.tongLopHoc}
                  description="Lớp đang hoạt động"
                  icon={BookOpen}
                />
                <StatCard
                  title="Lịch tập sắp tới"
                  value={data.tongQuan.tongLichTap}
                  description="Buổi tập từ hôm nay trở đi"
                  icon={CalendarDays}
                />
              </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Students by class */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Sĩ số học viên theo lớp
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Số học viên đang sinh hoạt tại từng lớp
                    </p>
                  </div>
                </div>

                {data.hocVienTheoLop.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.hocVienTheoLop}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="maSoLop"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value) => [
                          `${value} học viên`,
                          'Sĩ số',
                        ]}
                      />
                      <Bar
                        dataKey="soHocVien"
                        name="Số học viên"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-16 text-center text-sm text-gray-400">
                    Chưa có dữ liệu lớp học.
                  </p>
                )}
              </div>

              {/* Attendance */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Tình hình điểm danh
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Lượt điểm danh trong 7 ngày gần nhất
                    </p>
                  </div>
                </div>

                {data.diemDanhTheoNgay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.diemDanhTheoNgay.map((item) => ({
                        ...item,
                        ngayHienThi: formatDate(item.ngay).slice(0, 5),
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="ngayHienThi"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar
                        dataKey="soLuotCoMat"
                        name="Có mặt"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-16 text-center text-sm text-gray-400">
                    Chưa có dữ liệu điểm danh trong 7 ngày gần nhất.
                  </p>
                )}
              </div>
            </section>

            {/* Schedule & Announcements */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Upcoming schedule */}
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Lịch tập sắp tới
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Các buổi tập chuẩn bị diễn ra
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>

                {data.lichTapSapToi.length > 0 ? (
                  <div className="space-y-3">
                    {data.lichTapSapToi.map((item) => (
                      <div
                        key={item.maLichTap}
                        className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {item.tenLop}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.noiDung || 'Nội dung kỹ thuật theo giáo trình'}
                            </p>
                          </div>
                          <span className="w-fit rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {formatDate(item.ngayTap)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {item.gioBatDau} - {item.gioKetThuc}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.diaDiem || 'Chùa Tu Hoàng'}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                          HLV: <span className="font-medium text-gray-700">{item.tenHuanLuyenVien || 'Chưa phân công'}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-gray-400">
                    Hiện chưa có lịch tập sắp tới.
                  </p>
                )}

                <Link
                  href="/lich-tap"
                  className="mt-4 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Xem tất cả lịch tập <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Recent announcements */}
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Thông báo gần đây
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Những bản tin mới nhất từ Ban quản trị
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-2 text-green-600">
                    <Megaphone className="h-5 w-5" />
                  </div>
                </div>

                {data.thongBaoGanDay.length > 0 ? (
                  <div className="space-y-3">
                    {data.thongBaoGanDay.map((item) => (
                      <div
                        key={item.maThongBao}
                        className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                      >
                        <p className="font-medium text-gray-900 text-sm">
                          {item.tieuDe}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {item.noiDung}
                        </p>
                        <p className="mt-2 text-[11px] text-gray-400">
                          {formatDateTime(item.ngayTao)}
                          {' · '}
                          {item.nguoiTao || 'Ban Quản Trị'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-gray-400">
                    Chưa có thông báo nào.
                  </p>
                )}

                <Link
                  href="/thong-bao"
                  className="mt-4 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Quản lý thông báo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
