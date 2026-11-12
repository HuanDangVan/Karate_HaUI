'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
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
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
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

const BAR_COLORS = [
  '#e11d48', // Martial Red
  '#f472b6', // Pastel Pink
  '#38bdf8', // Pastel Sky Blue
  '#a855f7', // Pastel Purple
  '#fb923c', // Pastel Orange
  '#34d399', // Pastel Emerald
  '#06b6d4', // Pastel Cyan
  '#f43f5e', // Rose
];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'pink',
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
  variant?: 'pink' | 'blue' | 'purple' | 'amber';
}) {
  const styles = {
    pink: {
      card: 'bg-gradient-to-br from-pink-200/90 via-rose-100/90 to-red-100/80 border-2 border-rose-300 text-rose-950',
      iconBg: 'bg-red-600 text-white shadow-md shadow-red-500/30 ring-2 ring-red-300',
      badge: 'bg-red-600 text-white',
      topBar: 'from-red-600 via-rose-500 to-pink-500',
      valueColor: 'text-red-900',
    },
    blue: {
      card: 'bg-gradient-to-br from-sky-200/90 via-blue-100/90 to-cyan-100/80 border-2 border-sky-300 text-sky-950',
      iconBg: 'bg-sky-500 text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-300',
      badge: 'bg-sky-600 text-white',
      topBar: 'from-sky-500 via-blue-400 to-indigo-500',
      valueColor: 'text-sky-950',
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-200/90 via-fuchsia-100/90 to-pink-100/80 border-2 border-purple-300 text-purple-950',
      iconBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/30 ring-2 ring-purple-300',
      badge: 'bg-purple-600 text-white',
      topBar: 'from-purple-500 via-fuchsia-400 to-pink-500',
      valueColor: 'text-purple-950',
    },
    amber: {
      card: 'bg-gradient-to-br from-amber-200/90 via-orange-100/90 to-rose-100/80 border-2 border-amber-300 text-amber-950',
      iconBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-300',
      badge: 'bg-amber-600 text-white',
      topBar: 'from-amber-500 via-orange-400 to-red-500',
      valueColor: 'text-amber-950',
    },
  }[variant];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-5.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${styles.card}`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${styles.topBar}`}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black tracking-wider uppercase opacity-80">
            {title}
          </p>
          <p className={`mt-2 text-3xl font-black ${styles.valueColor}`}>
            {value.toLocaleString('vi-VN')}
          </p>
          <p className="mt-2 text-xs font-semibold opacity-75">{description}</p>
        </div>
        <div className={`rounded-2xl p-3.5 transition-transform duration-300 group-hover:scale-110 ${styles.iconBg}`}>
          <Icon className="h-6 w-6" />
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
        {/* Banner chào mừng: Pastel nhạt, chi tiết đỏ võ đạo */}
        <section className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-100 via-pink-100 via-sky-100 to-blue-100 p-6 text-slate-700 shadow-lg shadow-rose-200/40 sm:p-8">
          {/* Ambient glowing circles nhạt */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-rose-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3.5">
              {/* Badges: Tên CLB & Đơn vị trực thuộc */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1 text-xs font-black text-white shadow-md uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5 text-yellow-300" />
                  Karate-HaUI
                </span>
                <span className="rounded-full bg-sky-500/90 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm">
                  Đại học Công Nghiệp Hà Nội
                </span>
              </div>

              <h2 className="text-2xl font-black sm:text-3xl tracking-tight text-slate-800">
                Hệ Thống Quản Lý Câu Lạc Bộ{' '}
                <span className="text-red-600">Karate-HaUI</span>
              </h2>

              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 font-medium">
                Theo dõi tình hình học viên, huấn luyện viên, lớp học và điểm danh hoạt động của câu lạc bộ tại một nơi tập trung, chuẩn xác và đậm đà tinh thần võ đạo.
              </p>

              {/* Địa chỉ nổi bật */}
              <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-2 text-xs font-bold text-slate-700 backdrop-blur-md ring-1 ring-rose-200 w-fit shadow-sm">
                <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                <span>
                  <strong>Địa chỉ:</strong> Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m
                </span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/hoc-vien"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-red-300/40 transition-all hover:from-red-600 hover:to-rose-600 hover:scale-105 active:scale-95"
              >
                <UserPlus className="h-4 w-4 text-yellow-200" />
                Tiếp nhận học viên
              </Link>

              <Link
                href="/lich-tap"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-sky-300/40 transition-all hover:from-sky-600 hover:to-blue-600 hover:scale-105 active:scale-95"
              >
                <CalendarPlus className="h-4 w-4 text-sky-100" />
                Quản lý lịch tập
              </Link>
            </div>
          </div>

          {/* Kanji Decorative Watermark */}
          <div className="pointer-events-none absolute -bottom-8 -right-4 select-none font-serif text-9xl font-black text-rose-300/30">
            空手
          </div>
        </section>

        {/* Trạng thái tải dữ liệu */}
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-3xl border-2 border-pink-200 bg-pink-100/90 p-12 text-slate-700 font-bold shadow-xs">
            <RefreshCw className="h-5 w-5 animate-spin text-red-600" />
            Đang tải dữ liệu từ hệ thống Karate-HaUI...
          </div>
        )}

        {/* Lỗi tải dữ liệu */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-red-300 bg-red-100/90 p-8 text-center shadow-xs">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="font-bold text-red-900">{error}</p>
            <button
              onClick={fetchDashboard}
              className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/30 hover:from-red-700 hover:to-sky-600 transition-all"
            >
              Thử tải lại
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* 4 Thẻ Thống Kê Tổng Quan (Ít trắng, nhiều màu sắc: Hồng, Xanh, Tím, Cam) */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-600" />
                    Thống kê tổng quan
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">
                    Số liệu hoạt động thực tế của CLB Karate-HaUI
                  </p>
                </div>
                <button
                  onClick={fetchDashboard}
                  className="flex items-center gap-2 rounded-2xl border-2 border-pink-200 bg-pink-100/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-red-600" />
                  Làm mới
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Tổng học viên"
                  value={data.tongQuan.tongHocVien}
                  description="Học viên đang học"
                  icon={Users}
                  variant="pink"
                />
                <StatCard
                  title="Huấn luyện viên"
                  value={data.tongQuan.tongHuanLuyenVien}
                  description="HLV đang giảng dạy"
                  icon={UserRound}
                  variant="blue"
                />
                <StatCard
                  title="Lớp học"
                  value={data.tongQuan.tongLopHoc}
                  description="Lớp đang hoạt động"
                  icon={BookOpen}
                  variant="purple"
                />
                <StatCard
                  title="Lịch tập sắp tới"
                  value={data.tongQuan.tongLichTap}
                  description="Buổi tập từ hôm nay trở đi"
                  icon={CalendarDays}
                  variant="amber"
                />
              </div>
            </section>

            {/* Khối Biểu Đồ Phong Phú Màu Sắc (Ít trắng) */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Sĩ số học viên theo lớp: Nền pastel hồng tím rực rỡ */}
              <div className="rounded-3xl border-2 border-pink-300 bg-gradient-to-br from-pink-100/95 via-rose-100/85 to-purple-100/90 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                      Sĩ số học viên theo lớp
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Số học viên đang sinh hoạt tại từng lớp Karate-HaUI
                    </p>
                  </div>
                  <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white shadow-xs">
                    Sĩ số
                  </span>
                </div>

                {data.hocVienTheoLop.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.hocVienTheoLop}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#fbcfe8"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="maSoLop"
                        tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff1f5',
                          borderRadius: '1rem',
                          border: '2px solid #f43f5e',
                          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.2)',
                          fontWeight: 700,
                        }}
                        formatter={(value) => [
                          `${value} học viên`,
                          'Sĩ số',
                        ]}
                      />
                      <Bar
                        dataKey="soHocVien"
                        name="Số học viên"
                        radius={[8, 8, 0, 0]}
                      >
                        {data.hocVienTheoLop.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-16 text-center text-sm font-semibold text-slate-500">
                    Chưa có dữ liệu lớp học.
                  </p>
                )}
              </div>

              {/* Tình hình điểm danh: Nền pastel xanh dương ngọc rực rỡ */}
              <div className="rounded-3xl border-2 border-sky-300 bg-gradient-to-br from-sky-100/95 via-blue-100/85 to-teal-100/90 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                      Tình hình điểm danh
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Lượt điểm danh trong 7 ngày gần nhất
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-black text-white shadow-xs">
                    Điểm danh
                  </span>
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
                        stroke="#bae6fd"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="ngayHienThi"
                        tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f0f9ff',
                          borderRadius: '1rem',
                          border: '2px solid #0284c7',
                          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)',
                          fontWeight: 700,
                        }}
                      />
                      <Bar
                        dataKey="soLuotCoMat"
                        name="Có mặt"
                        fill="#0284c7"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-16 text-center text-sm font-semibold text-slate-500">
                    Chưa có dữ liệu điểm danh trong 7 ngày gần nhất.
                  </p>
                )}
              </div>
            </section>

            {/* Lịch tập và thông báo: Nền màu sắc pastel đậm đà (Ít trắng) */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Lịch tập sắp tới */}
              <div className="rounded-3xl border-2 border-rose-300 bg-gradient-to-br from-rose-100/95 via-pink-100/85 to-purple-100/90 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-600" />
                      Lịch tập sắp tới
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Các buổi tập chuẩn bị diễn ra tại Chùa Tu Hoàng & HaUI
                    </p>
                  </div>
                  <div className="rounded-2xl bg-red-600 p-2.5 text-white shadow-xs">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>

                {data.lichTapSapToi.length > 0 ? (
                  <div className="space-y-3">
                    {data.lichTapSapToi.map((item) => (
                      <div
                        key={item.maLichTap}
                        className="rounded-2xl border-2 border-pink-200 bg-white/75 p-4 transition-all hover:border-red-400 hover:bg-white shadow-xs"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-black text-slate-800 text-sm">
                              {item.tenLop}
                            </p>
                            <p className="mt-1 text-xs text-slate-600 font-medium">
                              {item.noiDung || 'Nội dung kỹ thuật theo giáo trình'}
                            </p>
                          </div>
                          <span className="w-fit rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-xs">
                            {formatDate(item.ngayTap)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                          <span className="flex items-center gap-1.5 text-sky-800 font-bold bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                            <Clock className="h-3.5 w-3.5 text-sky-600" />
                            {item.gioBatDau} - {item.gioKetThuc}
                          </span>
                          <span className="flex items-center gap-1.5 text-red-800 font-bold bg-red-100/80 px-2.5 py-0.5 rounded-full">
                            <MapPin className="h-3.5 w-3.5 text-red-600" />
                            {item.diaDiem || 'Chùa Tu Hoàng, cách ĐH Công Nghiệp 900m'}
                          </span>
                        </div>

                        <p className="mt-2.5 text-xs text-slate-600 font-medium">
                          Huấn luyện viên: <strong className="text-red-700">{item.tenHuanLuyenVien || 'Chưa phân công'}</strong>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm font-semibold text-slate-500">
                    Hiện chưa có lịch tập sắp tới.
                  </p>
                )}

                <Link
                  href="/lich-tap"
                  className="mt-4 flex items-center justify-center gap-1 text-center text-xs font-black text-red-700 hover:text-red-800 bg-white/50 py-2 rounded-2xl border border-pink-200"
                >
                  Xem tất cả lịch tập <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Thông báo gần đây */}
              <div className="rounded-3xl border-2 border-sky-300 bg-gradient-to-br from-sky-100/95 via-blue-100/85 to-indigo-100/90 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      Thông báo gần đây
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">
                      Những bản tin mới nhất từ Ban chủ nhiệm Karate-HaUI
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sky-600 p-2.5 text-white shadow-xs">
                    <Megaphone className="h-5 w-5" />
                  </div>
                </div>

                {data.thongBaoGanDay.length > 0 ? (
                  <div className="space-y-4">
                    {data.thongBaoGanDay.map((item) => (
                      <div
                        key={item.maThongBao}
                        className="rounded-2xl border-2 border-sky-200 bg-white/75 p-4 transition-all hover:border-sky-400 hover:bg-white shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-2.5 text-white shadow-xs shrink-0">
                            <Megaphone className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-slate-800 text-sm">
                              {item.tieuDe}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium">
                              {item.noiDung}
                            </p>
                            <p className="mt-2 text-[11px] text-slate-500 font-semibold">
                              {formatDateTime(item.ngayTao)}
                              {' · '}
                              <span className="font-bold text-red-700">
                                {item.nguoiTao || 'Ban Quản Trị Karate-HaUI'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm font-semibold text-slate-500">
                    Chưa có thông báo nào.
                  </p>
                )}

                <Link
                  href="/thong-bao"
                  className="mt-4 flex items-center justify-center gap-1 text-center text-xs font-black text-sky-800 hover:text-sky-900 bg-white/50 py-2 rounded-2xl border border-sky-200"
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
