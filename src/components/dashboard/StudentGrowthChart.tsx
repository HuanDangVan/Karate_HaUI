'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Users, Award, TrendingUp } from 'lucide-react';
import { StudentGrowthData, BeltDistributionData } from '@/types/dashboard';

interface StudentGrowthChartProps {
  growthData: StudentGrowthData[];
  beltData: BeltDistributionData[];
}

export function StudentGrowthChart({ growthData, beltData }: StudentGrowthChartProps) {
  const [viewMode, setViewMode] = useState<'growth' | 'belts'>('growth');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-88 w-full items-center justify-center rounded-3xl border border-pink-100 bg-white p-6 shadow-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
          <p className="text-xs text-slate-400">Đang tải dữ liệu biểu đồ học viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-pink-100/90 bg-white/95 p-6 shadow-xs backdrop-blur-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-pink-50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <Users className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-800">
              Số Lượng & Phân Bố Học Viên
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Thống kê tiến độ phát triển môn sinh Karate-HaUI theo từng tháng & cấp bậc đai
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-2xl bg-pink-50/70 p-1 ring-1 ring-pink-100">
          <button
            onClick={() => setViewMode('growth')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'growth'
                ? 'bg-white text-pink-700 shadow-xs ring-1 ring-pink-200'
                : 'text-slate-600 hover:text-pink-600'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Tăng trưởng tháng
          </button>
          <button
            onClick={() => setViewMode('belts')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'belts'
                ? 'bg-white text-sky-700 shadow-xs ring-1 ring-sky-200'
                : 'text-slate-600 hover:text-sky-600'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            Phân bố cấp đai
          </button>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        {viewMode === 'growth' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="karatePinkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="karateSkyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fce7f3" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#fbcfe8' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 20', 'dataMax + 20']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-2xl border border-pink-200 bg-white p-3 text-xs text-slate-800 shadow-xl">
                        <p className="font-bold text-slate-800 mb-1">{label}</p>
                        <div className="flex items-center gap-2 text-pink-600">
                          <span className="h-2 w-2 rounded-full bg-pink-500" />
                          <span>Tổng học viên: <strong>{payload[0]?.value}</strong></span>
                        </div>
                        {payload[1] && (
                          <div className="flex items-center gap-2 text-sky-600 mt-1">
                            <span className="h-2 w-2 rounded-full bg-sky-400" />
                            <span>Học viên mới: <strong>+{payload[1]?.value}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="tongHocVien"
                name="Tổng học viên"
                stroke="#f472b6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#karatePinkGradient)"
              />
              <Area
                type="monotone"
                dataKey="hocVienMoi"
                name="Học viên mới"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#karateSkyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={beltData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fce7f3" />
              <XAxis
                dataKey="belt"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#fbcfe8' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-2xl border border-pink-200 bg-white p-3 text-xs text-slate-800 shadow-xl">
                        <p className="font-bold text-slate-800">{label}</p>
                        <p className="text-pink-600 mt-1">
                          Số lượng: <strong>{payload[0]?.value}</strong> học viên
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {beltData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.belt === 'Đai trắng' ? '#fce7f3' : entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-pink-50 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-400" />
            Tổng học viên: <strong className="text-slate-800">248</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            Môn sinh mới tháng này: <strong className="text-slate-800">+32</strong>
          </span>
        </div>
        <span className="text-[11px] text-pink-600 font-medium">
          * Điểm tập chính: Chùa Tu Hoàng, cách ĐH Công Nghiệp 900m
        </span>
      </div>
    </div>
  );
}
