import React from 'react';
import { StudentStatus } from '@/types/student';
import { CheckCircle2, PauseCircle, XCircle } from 'lucide-react';

interface StudentStatusBadgeProps {
  status: StudentStatus;
  showIcon?: boolean;
}

export function StudentStatusBadge({ status, showIcon = true }: StudentStatusBadgeProps) {
  switch (status) {
    case 'hoat_dong':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
          {showIcon && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
          <span>Đang học</span>
        </span>
      );
    case 'tam_dung':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-600/20">
          {showIcon && <PauseCircle className="h-3.5 w-3.5 text-amber-600" />}
          <span>Tạm dừng</span>
        </span>
      );
    case 'ngung_hoat_dong':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-600 ring-1 ring-zinc-300">
          {showIcon && <XCircle className="h-3.5 w-3.5 text-zinc-500" />}
          <span>Đã nghỉ học</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {status}
        </span>
      );
  }
}
