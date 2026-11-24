import type { ScheduleStatus } from '@/types/schedule';

interface ScheduleStatusBadgeProps {
    status: ScheduleStatus;
}

const STATUS_CONFIG: Record<
    ScheduleStatus,
    { label: string; className: string }
> = {
    da_len_lich: {
        label: 'Đã lên lịch',
        className: 'bg-blue-100 text-blue-700',
    },
    da_hoan_thanh: {
        label: 'Đã hoàn thành',
        className: 'bg-green-100 text-green-700',
    },
    da_huy: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-700',
    },
};

export function ScheduleStatusBadge({
    status,
}: ScheduleStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}
