'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  CalendarDays,
  Users,
  ClipboardCheck,
  LogOut,
  Clock,
  MapPin,
  Flame,
  RefreshCw,
} from 'lucide-react';

interface DashboardData {
  totalClasses: number;
  totalStudents: number;
  upcomingSessions: number;
  upcomingSchedules: {
    maLichTap: number;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string | null;
    noiDung: string | null;
  }[];
}

export default function CoachDashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState('Huấn luyện viên');
  const [userEmail, setUserEmail] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [userResponse, dashboardResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/coach/dashboard'),
      ]);

      const userData = await userResponse.json();
      const dashboardData = await dashboardResponse.json();

      if (userResponse.status === 401 || dashboardResponse.status === 401) {
        router.replace('/login');
        return;
      }

      if (!userData.success) {
        throw new Error(userData.message || 'Không thể tải thông tin tài khoản.');
      }

      if (!dashboardData.success) {
        throw new Error(dashboardData.message || 'Không thể tải dữ liệu tổng quan.');
      }

      setUserName(userData.user.name);
      setUserEmail(userData.user.email);
      setDashboard(dashboardData.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi tải dữ liệu.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';

    const [year, month, day] = date.split('-');

    return `${day}/${month}/${year}`;
  };

  const formatTime = (time: string) => time?.slice(0, 5) || '';

  return (
    <div className="min-h-screen bg-white  via-slate-50/60  font-sans text-slate-800">

      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                  Karate-HaUI • Khu vực chuyên môn
                </span>
                <span className="rounded-full bg-sky-900/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  Đại học Công Nghiệp Hà Nội
                </span>
              </div>

              <h1 className="text-2xl font-black sm:text-3xl">
                Chào mừng {userName}!
              </h1>


              <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-white/15 p-4 ring-1 ring-white/30">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
        </section>

        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <button
              onClick={loadDashboard}
              className="flex items-center gap-2 font-bold"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-zinc-500">
                Lớp phụ trách
              </span>
              <Users className="h-5 w-5 text-blue-700" />
            </div>
            <p className="mt-3 text-3xl font-black text-zinc-900">
              {loading ? '...' : dashboard?.totalClasses ?? 0}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Số lớp đang hoạt động được phân công
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-zinc-500">
                Học viên
              </span>
              <ClipboardCheck className="h-5 w-5 text-emerald-700" />
            </div>
            <p className="mt-3 text-3xl font-black text-zinc-900">
              {loading ? '...' : dashboard?.totalStudents ?? 0}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Học viên thuộc các lớp đang phụ trách
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-zinc-500">
                Buổi tập sắp tới
              </span>
              <CalendarDays className="h-5 w-5 text-red-700" />
            </div>
            <p className="mt-3 text-3xl font-black text-zinc-900">
              {loading ? '...' : dashboard?.upcomingSessions ?? 0}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Trong 7 ngày tiếp theo
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-700" />
              <h2 className="text-base font-bold text-zinc-900">
                Lịch tập sắp tới
              </h2>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              6 buổi gần nhất
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              Đang tải dữ liệu...
            </div>
          ) : dashboard?.upcomingSchedules.length ? (
            <div className="mt-4 space-y-3">
              {dashboard.upcomingSchedules.map((schedule) => (
                <div
                  key={schedule.maLichTap}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
                        {schedule.maSoLop}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-900">
                        {schedule.tenLop}
                      </h3>
                    </div>

                    {schedule.noiDung && (
                      <p className="text-xs text-zinc-600">
                        {schedule.noiDung}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-semibold text-red-800">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(schedule.gioBatDau)}
                        {' - '}
                        {formatTime(schedule.gioKetThuc)}
                      </span>

                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(schedule.ngayTap)}
                      </span>

                      {schedule.diaDiem && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {schedule.diaDiem}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-semibold text-zinc-600">
                Chưa có lịch tập sắp tới
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Lịch tập của các lớp bạn phụ trách sẽ hiển thị tại đây.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}