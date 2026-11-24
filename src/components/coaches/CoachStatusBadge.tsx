
import React from 'react';
import { CoachStatus } from '@/types/coach';

interface CoachStatusBadgeProps {
    status: CoachStatus;
}

const statusConfig: Record<
    CoachStatus,
    { label: string; className: string }
> = {
    hoat_dong: {
        label: 'Hoạt động',
        className: 'bg-green-100 text-green-700',
    },
    tam_dung: {
        label: 'Tạm dừng',
        className: 'bg-yellow-100 text-yellow-700',
    },
    ngung_hoat_dong: {
        label: 'Ngừng hoạt động',
        className: 'bg-red-100 text-red-700',
    },
};

export default function CoachStatusBadge({
    status,
}: CoachStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.ngung_hoat_dong;

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {config.label}
        </span>
    );
}
