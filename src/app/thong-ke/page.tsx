'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  Users,
  UserRound,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Overview {
  tongHocVien: number;
  tongHuanLuyenVien: number;
  tongLopHoc: number;
  tongLichTap: number;
  tongLuotCoMat: number;
}

interface ClassStatistic {
  maLop: number;
  maSoLop: string;
  tenLop: string;
  soHocVien: number;
  siSoToiDa: number;
}

interface StatisticsData {
  tongQuan: Overview;
  hocVienTheoLop: ClassStatistic[];
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/statistics');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Không thể tải dữ liệu thống kê.'
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
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const overview = data?.tongQuan;

  const statisticCards = [
    {
      title: 'Tổng học viên',
      value: overview?.tongHocVien ?? 0,
      icon: Users,
      color: 'text-blue-600',
      background: 'bg-blue-50',
    },
    {
      title: 'Huấn luyện viên',
      value: overview?.tongHuanLuyenVien ?? 0,
      icon: UserRound,
      color: 'text-green-600',
      background: 'bg-green-50',
    },
    {
      title: 'Lớp học hoạt động',
      value: overview?.tongLopHoc ?? 0,
      icon: GraduationCap,
      color: 'text-purple-600',
      background: 'bg-purple-50',
    },
    {
      title: 'Lịch tập đã lên lịch',
      value: overview?.tongLichTap ?? 0,
      icon: CalendarDays,
      color: 'text-orange-600',
      background: 'bg-orange-50',
    },
  ];

  return (
    <AdminLayout pageTitle="Báo cáo & Thống kê">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Báo cáo & Thống kê
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tổng quan tình hình hoạt động của CLB Karate-HaUI — Đại học Công Nghiệp Hà Nội (Chùa Tu Hoàng, cách ĐHCN 900m).
            </p>
          </div>

          <button
            onClick={fetchStatistics}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Làm mới dữ liệu
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Overview cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statisticCards.map((item) => {
            const Icon = item.icon;
            const gradients: Record<string, string> = {
              'text-blue-600':   'bg-gradient-to-br from-sky-100 to-blue-200 border-sky-200',
              'text-green-600':  'bg-gradient-to-br from-emerald-100 to-teal-200 border-emerald-200',
              'text-purple-600': 'bg-gradient-to-br from-purple-100 to-violet-200 border-purple-200',
              'text-orange-600': 'bg-gradient-to-br from-amber-100 to-orange-200 border-amber-200',
            };
            const iconBgs: Record<string, string> = {
              'text-blue-600':   'bg-blue-500 text-white',
              'text-green-600':  'bg-emerald-500 text-white',
              'text-purple-600': 'bg-violet-500 text-white',
              'text-orange-600': 'bg-amber-500 text-white',
            };
            const textColors: Record<string, string> = {
              'text-blue-600':   'text-blue-800',
              'text-green-600':  'text-emerald-800',
              'text-purple-600': 'text-violet-800',
              'text-orange-600': 'text-amber-800',
            };

            return (
              <div
                key={item.title}
                className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${gradients[item.color] ?? 'bg-white border-zinc-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {item.title}
                    </p>
                    <p className={`mt-2 text-3xl font-black ${textColors[item.color] ?? 'text-slate-800'}`}>
                      {loading ? '—' : item.value.toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className={`rounded-2xl p-3 ${iconBgs[item.color] ?? 'bg-slate-100'}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Attendance statistic */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500 p-3 text-white">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <p className="text-sm font-medium text-emerald-700">
                Tổng lượt điểm danh có mặt
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-900">
                {loading
                  ? '—'
                  : (overview?.tongLuotCoMat ?? 0).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Class chart */}
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-100 p-5 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500 p-3 text-white">
              <BarChart3 size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-blue-900">
                Số lượng học viên theo lớp
              </h2>
              <p className="mt-1 text-xs text-blue-700">
                Thống kê học viên đang hoạt động và đang học tại từng lớp.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-80 items-center justify-center text-sm text-zinc-500">
              Đang tải dữ liệu biểu đồ...
            </div>
          ) : data?.hocVienTheoLop.length ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.hocVienTheoLop}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="maSoLop"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      name === 'soHocVien'
                        ? 'Số học viên'
                        : 'Sĩ số tối đa',
                    ]}
                    labelFormatter={(label) => `Mã lớp: ${label}`}
                  />

                  <Bar
                    dataKey="soHocVien"
                    name="Số học viên"
                    fill="#f472b6"
                    radius={[8, 8, 0, 0]}
                  />

                  <Bar
                    dataKey="siSoToiDa"
                    name="Sĩ số tối đa"
                    fill="#D4D4D8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
              <BarChart3 size={40} className="mb-3" />
              <p className="text-sm">
                Chưa có dữ liệu lớp học để thống kê.
              </p>
            </div>
          )}
        </div>

        {/* Class detail table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 p-5">
            <h2 className="font-semibold text-zinc-800">
              Chi tiết số lượng học viên
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Danh sách các lớp đang hoạt động.
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              Đang tải dữ liệu...
            </div>
          ) : data?.hocVienTheoLop.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Mã lớp</th>
                    <th className="px-5 py-4 font-semibold">Tên lớp</th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Số học viên
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Sĩ số tối đa
                    </th>
                    <th className="px-5 py-4 font-semibold">Tình trạng</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {data.hocVienTheoLop.map((item) => (
                    <tr
                      key={item.maLop}
                      className="hover:bg-zinc-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-700">
                        {item.maSoLop}
                      </td>

                      <td className="px-5 py-4 text-zinc-700">
                        {item.tenLop}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-blue-600">
                        {item.soHocVien}
                      </td>

                      <td className="px-5 py-4 text-center text-zinc-600">
                        {item.siSoToiDa}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          Đang hoạt động
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-zinc-500">
              Chưa có lớp học nào đang hoạt động.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}