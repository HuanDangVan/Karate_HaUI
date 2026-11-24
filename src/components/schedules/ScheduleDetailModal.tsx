import type { ScheduleItem } from '@/types/schedule';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';

interface ScheduleDetailModalProps {
    schedule: ScheduleItem;
    onClose: () => void;
}

export function ScheduleDetailModal({
    schedule,
    onClose,
}: ScheduleDetailModalProps) {
    const formatDate = (date: string) => {
        if (!date) return '—';

        const [year, month, day] = date.slice(0, 10).split('-');
        return `${day}/${month}/${year}`;
    };

    const formatTime = (time: string) => {
        return time ? time.slice(0, 5) : '—';
    };

    const details = [
        { label: 'Mã lớp', value: schedule.maSoLop },
        { label: 'Tên lớp', value: schedule.tenLop },
        { label: 'Ngày tập', value: formatDate(schedule.ngayTap) },
        {
            label: 'Thời gian',
            value: `${formatTime(schedule.gioBatDau)} - ${formatTime(schedule.gioKetThuc)}`,
        },
        { label: 'Địa điểm', value: schedule.diaDiem || 'Chưa cập nhật' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Chi tiết lịch tập
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl text-gray-400 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {details.map((item) => (
                        <div
                            key={item.label}
                            className="grid grid-cols-3 gap-3 border-b border-gray-100 pb-3"
                        >
                            <span className="text-sm text-gray-500">{item.label}</span>
                            <span className="col-span-2 text-sm font-medium text-gray-800">
                                {item.value}
                            </span>
                        </div>
                    ))}

                    <div className="border-b border-gray-100 pb-3">
                        <p className="mb-2 text-sm text-gray-500">Trạng thái</p>
                        <ScheduleStatusBadge status={schedule.trangThai} />
                    </div>

                    <div>
                        <p className="mb-2 text-sm text-gray-500">
                            Nội dung buổi tập
                        </p>
                        <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                            {schedule.noiDung || 'Chưa có nội dung'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end border-t pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}