
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  BookOpen,
  ClipboardCheck,
  Wallet,
  Users,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface StudentDashboardData {
  student: {
    maHocVien: number;
    maSoHocVien: string;
    hoTen: string;
    email: string;
    ngayThamGia: string;
  };
  attendance: {
    tongSoBuoi: number;
    soBuoiDaThamGia: number;
    soBuoiCoMat: number;
    soBuoiDiMuon: number;
    soBuoiVang: number;
    soBuoiCoPhep: number;
    tyLeChuyenCan: number;
  };
  classes: {
    maLop: number;
    maSoLop: string;
    tenLop: string;
  }[];
  totalClasses: number;
  nextSchedule: {
    maLichTap: number;
    maSoLop: string;
    tenLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string | null;
    noiDung: string | null;
  } | null;
}

function formatDate(value: string) {
  if (!value) return '';

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(value: string) {
  return value ? value.slice(0, 5) : '';
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/student/dashboard', {
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Không thể tải dữ liệu tổng quan.'
          );
        }

        if (!cancelled) {
          setData(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Đã xảy ra lỗi khi tải dữ liệu.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const quickLinks = [
    {
      title: 'Lớp học',
      description: 'Xem các lớp học và đăng ký tham gia.',
      href: '/student/classes',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Lớp đã đăng ký',
      description: 'Theo dõi trạng thái đăng ký lớp học.',
      href: '/student/my-classes',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Lịch tập',
      description: 'Theo dõi lịch tập của các lớp đã được duyệt.',
      href: '/student/schedule',
      icon: Calendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Lịch sử điểm danh',
      description: 'Xem tình trạng tham gia các buổi tập.',
      href: '/student/attendance',
      icon: ClipboardCheck,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Học phí',
      description: 'Theo dõi học phí và tình trạng thanh toán.',
      href: '/student/tuition',
      icon: Wallet,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      title: 'Thông báo',
      description: 'Đọc thông báo từ câu lạc bộ và huấn luyện viên.',
      href: '/student/notifications',
      icon: Bell,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <RefreshCw className="h-8 w-8 animate-spin text-red-700" />
          <p className="text-sm font-medium">
            Đang tải dữ liệu tổng quan...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-red-700">
          {error || 'Không có dữ liệu học viên.'}
        </p>
        <button
          onClick={() => setReloadKey((prev) => prev + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          <RefreshCw className="h-4 w-4" />
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-400 via-rose-300 to-sky-400 p-6 text-white shadow-xl shadow-pink-200/40 sm:p-8 border border-pink-200">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-md ring-1 ring-white/30">
                Học viên Karate-HaUI
              </span>
              <span className="rounded-full bg-sky-900/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                Đại học Công Nghiệp Hà Nội
              </span>
            </div>

            <h1 className="text-2xl font-black sm:text-3xl">
              Xin chào, {data.student.hoTen}!
            </h1>

            <p className="max-w-xl text-xs leading-relaxed text-pink-50 sm:text-sm font-medium">
              Chào mừng bạn đến với hệ thống quản lý CLB Karate-HaUI. Hãy theo dõi quá trình rèn luyện và lịch tập của mình tại đây.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="rounded-xl bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/30">
                Mã học viên: {data.student.maSoHocVien}
              </span>
              <div className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/30">
                <MapPin className="h-3.5 w-3.5 text-sky-100 shrink-0" />
                <span>Chùa Tu Hoàng, cách ĐH Công Nghiệp 900m</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-white/15 p-4 ring-1 ring-white/30">
            <Shield className="h-12 w-12 text-white" />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase text-zinc-500">
              Lớp đang tham gia
            </span>
            <Award className="h-5 w-5" />
          </div>

          <p className="mt-2 text-2xl font-black text-zinc-900">
            {data.totalClasses}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Lớp học đã được duyệt
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase text-zinc-500">
              Số buổi đã tập
            </span>
            <Calendar className="h-5 w-5" />
          </div>

          <p className="mt-2 text-2xl font-black text-zinc-900">
            {data.attendance.soBuoiDaThamGia} buổi
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Có mặt: {data.attendance.soBuoiCoMat} · Đi muộn:{' '}
            {data.attendance.soBuoiDiMuon}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold uppercase text-zinc-500">
              Tỷ lệ chuyên cần
            </span>
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <p className="mt-2 text-2xl font-black text-zinc-900">
            {data.attendance.tyLeChuyenCan}%
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Tổng {data.attendance.tongSoBuoi} buổi đã điểm danh
          </p>
        </div>
      </div>

      {/* Attendance Details */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900">
          Thống kê điểm danh
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: 'Có mặt',
              value: data.attendance.soBuoiCoMat,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Đi muộn',
              value: data.attendance.soBuoiDiMuon,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
            },
            {
              label: 'Vắng',
              value: data.attendance.soBuoiVang,
              color: 'text-red-700',
              bg: 'bg-red-50',
            },
            {
              label: 'Có phép',
              value: data.attendance.soBuoiCoPhep,
              color: 'text-blue-700',
              bg: 'bg-blue-50',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl p-4 ${item.bg}`}
            >
              <p className="text-xs font-medium text-zinc-600">
                {item.label}
              </p>
              <p className={`mt-1 text-2xl font-black ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Enrolled Classes */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-700" />
            <h2 className="text-base font-bold text-zinc-900">
              Lớp học của bạn
            </h2>
          </div>

          <Link
            href="/student/my-classes"
            className="text-xs font-semibold text-red-700 hover:underline"
          >
            Xem chi tiết
          </Link>
        </div>

        {data.classes.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.classes.map((item) => (
              <div
                key={item.maLop}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                  {item.maSoLop}
                </span>
                <h3 className="mt-2 font-bold text-zinc-900">
                  {item.tenLop}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-zinc-50 p-5 text-center text-sm text-zinc-500">
            Bạn chưa có lớp học nào được duyệt.
          </p>
        )}
      </div>

      {/* Next Schedule */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-700" />
            <h2 className="text-base font-bold text-zinc-900">
              Lịch tập tiếp theo của bạn
            </h2>
          </div>

          <Link
            href="/student/schedule"
            className="text-xs font-semibold text-red-700 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {data.nextSchedule ? (
          <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <div className="space-y-2">
              <span className="inline-block rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                {data.nextSchedule.maSoLop}
              </span>

              <h3 className="text-sm font-bold text-zinc-900">
                {data.nextSchedule.tenLop}
              </h3>

              <p className="text-sm text-zinc-700">
                {data.nextSchedule.noiDung || 'Buổi tập định kỳ'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1 font-semibold text-red-800">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(data.nextSchedule.ngayTap)},{' '}
                  {formatTime(data.nextSchedule.gioBatDau)} -{' '}
                  {formatTime(data.nextSchedule.gioKetThuc)}
                </span>

                {data.nextSchedule.diaDiem && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {data.nextSchedule.diaDiem}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-zinc-50 p-5 text-center text-sm text-zinc-500">
            Hiện chưa có lịch tập sắp tới cho các lớp bạn đã đăng ký.
          </p>
        )}
      </div>

      {/* Quick Access */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">
            Truy cập nhanh
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Các chức năng dành cho học viên CLB Karate HaUI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-red-600" />
                </div>

                <h3 className="mt-4 font-bold text-zinc-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
