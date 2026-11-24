'use client';

import { useState } from 'react';
import type {
    CreateScheduleInput,
    ScheduleClassOption,
    ScheduleStatus,
} from '@/types/schedule';

interface AddScheduleModalProps {
    classes: ScheduleClassOption[];
    onClose: () => void;
    onCreated: () => void;
}

export function AddScheduleModal({
    classes,
    onClose,
    onCreated,
}: AddScheduleModalProps) {
    const [form, setForm] = useState<CreateScheduleInput>({
        maLop: 0,
        ngayTap: '',
        gioBatDau: '',
        gioKetThuc: '',
        diaDiem: '',
        noiDung: '',
        trangThai: 'da_len_lich',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (
        field: keyof CreateScheduleInput,
        value: string | number | ScheduleStatus,
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!form.maLop) {
            setError('Vui lòng chọn lớp học.');
            return;
        }

        if (form.gioKetThuc <= form.gioBatDau) {
            setError('Giờ kết thúc phải sau giờ bắt đầu.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tạo lịch tập.');
            }

            onCreated();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Đã xảy ra lỗi.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Thêm lịch tập
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl text-gray-400 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lớp học <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={form.maLop || ''}
                            onChange={(e) =>
                                handleChange('maLop', Number(e.target.value))
                            }
                            className="form-input w-full"
                        >
                            <option value="">-- Chọn lớp học --</option>
                            {classes.map((item) => (
                                <option key={item.maLop} value={item.maLop}>
                                    {item.maSoLop} - {item.tenLop}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Ngày tập <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={form.ngayTap}
                            onChange={(e) => handleChange('ngayTap', e.target.value)}
                            className="form-input w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Giờ bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                required
                                value={form.gioBatDau}
                                onChange={(e) =>
                                    handleChange('gioBatDau', e.target.value)
                                }
                                className="form-input w-full"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Giờ kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                required
                                value={form.gioKetThuc}
                                onChange={(e) =>
                                    handleChange('gioKetThuc', e.target.value)
                                }
                                className="form-input w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Địa điểm
                        </label>
                        <input
                            type="text"
                            maxLength={200}
                            value={form.diaDiem || ''}
                            onChange={(e) => handleChange('diaDiem', e.target.value)}
                            placeholder="Ví dụ: Nhà thi đấu A1"
                            className="form-input w-full"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nội dung buổi tập
                        </label>
                        <textarea
                            rows={3}
                            value={form.noiDung || ''}
                            onChange={(e) => handleChange('noiDung', e.target.value)}
                            placeholder="Nhập nội dung buổi tập..."
                            className="form-input w-full"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Trạng thái
                        </label>
                        <select
                            value={form.trangThai}
                            onChange={(e) =>
                                handleChange(
                                    'trangThai',
                                    e.target.value as ScheduleStatus,
                                )
                            }
                            className="form-input w-full"
                        >
                            <option value="da_len_lich">Đã lên lịch</option>
                            <option value="da_hoan_thanh">Đã hoàn thành</option>
                            <option value="da_huy">Đã hủy</option>
                        </select>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : 'Thêm lịch tập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}