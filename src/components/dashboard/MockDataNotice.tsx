'use client';

import React, { useState } from 'react';
import { AlertCircle, X, Sparkles, MapPin } from 'lucide-react';

export function MockDataNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white    p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2 text-blue-600 ring-1 ring-gray-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                CLB Karate-HaUI
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Đại học Công Nghiệp Hà Nội • Chùa Tu Hoàng, cách ĐHCN 900m
              </h4>
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Hệ thống quản lý nội bộ CLB Karate-HaUI với giao diện bảng điều khiển hiện đại, tông màu hồng nhạt và xanh dương pastel nhẹ nhàng, thanh lịch.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-blue-600 rounded-lg p-1 hover:bg-gray-100/50 transition-colors"
          title="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
