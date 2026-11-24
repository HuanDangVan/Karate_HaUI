
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { CoachItem, UpdateCoachInput, CoachStatus } from '@/types/coach';

interface EditCoachModalProps {
    isOpen: boolean;
    coach: CoachItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditCoachModal({
    isOpen,
    coach,
    onClose,
    onSuccess,
}: EditCoachModalProps) {
    const [form, setForm] = useState({
        hoTen: '',
        maSoHuanLuyenVien: '',
        soDienThoai: '',
        diaChi: '',
        ngaySinh: '',
        gioiTinh: '',
        chuyenMon: '',
        soNamKinhNghiem: '',
        ngayBatDau: '',
        trangThai: 'hoat_dong' as CoachStatus,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && coach) {
            setForm({
                hoTen: coach.hoTen || '',
                maSoHuanLuyenVien: coach.maSoHuanLuyenVien || '',
                soDienThoai: coach.soDienThoai || '',
                diaChi: coach.diaChi || '',
                ngaySinh: coach.ngaySinh?.slice(0, 10) || '',
                gioiTinh: coach.gioiTinh || '',
                chuyenMon: coach.chuyenMon || '',
                soNamKinhNghiem:
                    coach.soNamKinhNghiem !== null &&
                        coach.soNamKinhNghiem !== undefined
                        ? String(coach.soNamKinhNghiem)
                        : '',
                ngayBatDau: coach.ngayBatDau?.slice(0, 10) || '',
                trangThai: coach.trangThai,
            });

            setError('');
        }
    }, [isOpen, coach]);

    if (!isOpen || !coach) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (
            form.soNamKinhNghiem !== '' &&
            (!Number.isInteger(Number(form.soNamKinhNghiem)) ||
                Number(form.soNamKinhNghiem) < 0)
        ) {
            setError('Số năm kinh nghiệm phải là số nguyên không âm.');
            return;
        }

        const data: UpdateCoachInput = {
            hoTen: form.hoTen.trim(),
            maSoHuanLuyenVien: form.maSoHuanLuyenVien.trim().toUpperCase(),
            soDienThoai: form.soDienThoai.trim() || undefined,
            diaChi: form.diaChi.trim() || undefined,
            ngaySinh: form.ngaySinh || undefined,
            gioiTinh: form.gioiTinh || undefined,
            chuyenMon: form.chuyenMon.trim() || undefined,
            soNamKinhNghiem:
                form.soNamKinhNghiem !== ''
                    ? Number(form.soNamKinhNghiem)
                    : undefined,
            ngayBatDau: form.ngayBatDau || undefined,
            trangThai: form.trangThai,
        };

        try {
            setLoading(true);

            const response = await fetch(`/api/coaches/${coach.maHuanLuyenVien}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể cập nhật huấn luyện viên.');
            }

            alert('Cập nhật thông tin thành công!');
            onSuccess();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi cập nhật thông tin.'
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs';

    const labelClass = 'mb-1.5 block text-sm font-medium text-zinc-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Chỉnh sửa huấn luyện viên
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            Mã: {coach.maSoHuanLuyenVien}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5">
                    <div className="space-y-6">
                        <section>
                            <h3 className="mb-4 border-b border-zinc-100 pb-2 text-sm font-semibold text-blue-700">
                                1. Thông tin cá nhân
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Họ và tên *</label>
                                    <input
                                        name="hoTen"
                                        value={form.hoTen}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Mã huấn luyện viên *</label>
                                    <input
                                        name="maSoHuanLuyenVien"
                                        value={form.maSoHuanLuyenVien}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Số điện thoại</label>
                                    <input
                                        name="soDienThoai"
                                        value={form.soDienThoai}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Ngày sinh</label>
                                    <input
                                        type="date"
                                        name="ngaySinh"
                                        value={form.ngaySinh}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Giới tính</label>
                                    <select
                                        name="gioiTinh"
                                        value={form.gioiTinh}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Địa chỉ</label>
                                    <input
                                        name="diaChi"
                                        value={form.diaChi}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="mb-4 border-b border-zinc-100 pb-2 text-sm font-semibold text-blue-700">
                                2. Thông tin huấn luyện
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Chuyên môn</label>
                                    <input
                                        name="chuyenMon"
                                        value={form.chuyenMon}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Số năm kinh nghiệm</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="soNamKinhNghiem"
                                        value={form.soNamKinhNghiem}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Ngày bắt đầu công tác</label>
                                    <input
                                        type="date"
                                        name="ngayBatDau"
                                        value={form.ngayBatDau}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Trạng thái</label>
                                    <select
                                        name="trangThai"
                                        value={form.trangThai}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="hoat_dong">Hoạt động</option>
                                        <option value="tam_dung">Tạm dừng</option>
                                        <option value="ngung_hoat_dong">Ngừng hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-zinc-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
