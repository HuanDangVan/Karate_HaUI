'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ClipboardCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { AttendanceDayData } from '@/types/dashboard';

interface AttendanceChartProps {
  attendanceData: AttendanceDayData[];
}

export function AttendanceChart({ attendanceData }: AttendanceChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const averageRate = (
    attendanceData.reduce((acc, curr) => acc + curr.tyLe, 0) / attendanceData.length
  ).toFixed(1);

  if (!isMounted) {
    return (
      <div className="flex h-88 w-full items-center justify-center rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-transparent" />
          <p className="text-xs text-slate-400">Đang tải biểu đồ điểm danh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200/90 bg-white/95 p-6 shadow-xs backdrop-blur-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-100 text-blue-600">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-800">
              Tình Hình Điểm Danh Trong Tuần
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Theo dõi số lượng học viên Karate-HaUI có mặt và vắng mặt tại các ca tập
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3.5 py-1.5 ring-1 ring-gray-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-800">
            Tỷ lệ trung bình: <strong className="text-blue-600">{averageRate}%</strong>
          </span>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={attendanceData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fce7f3" />
            <XAxis
              dataKey="day"
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
                  const data = payload[0].payload as AttendanceDayData;
                  return (
                    <div className="rounded-2xl border border-gray-200 bg-white p-3 text-xs text-slate-800 shadow-xl min-w-[170px]">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2">
                        <p className="font-bold text-slate-800">{label} ({data.date})</p>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-900">
                          {data.tyLe}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          Có mặt:
                        </span>
                        <strong className="text-blue-600">{data.coMat} học viên</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 mt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-sky-300" />
                          Vắng mặt:
                        </span>
                        <strong className="text-sky-600">{data.vangMat} người</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Bar
              dataKey="coMat"
              name="Có mặt đi tập"
              fill="#60a5fa"
              radius={[8, 8, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="vangMat"
              name="Vắng mặt"
              fill="#bae6fd"
              radius={[8, 8, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1 text-blue-600 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" /> Ca tập Thứ 4 và Thứ 7 đạt tỷ lệ chuyên cần cao nhất (&gt;92%)
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-sky-600 font-medium">
          <AlertCircle className="h-3.5 w-3.5" /> Địa điểm: Chùa Tu Hoàng, cách ĐH Công Nghiệp 900m
        </span>
      </div>
    </div>
  );
}
