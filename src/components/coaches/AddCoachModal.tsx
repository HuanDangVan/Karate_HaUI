
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { CreateCoachInput, CoachStatus } from '@/types/coach';

interface AddCoachModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const initialForm = {
    hoTen: '',
    email: '',
    matKhau: '',
    maSoHuanLuyenVien: '',
    soDienThoai: '',
    diaChi: '',
    ngaySinh: '',
    gioiTinh: '',
    chuyenMon: '',
    soNamKinhNghiem: '',
    ngayBatDau: '',
    trangThai: 'hoat_dong' as CoachStatus,
};

export default function AddCoachModal({
    isOpen,
    onClose,
    onSuccess,
}: AddCoachModalProps) {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm(initialForm);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (form.matKhau.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (
            form.soNamKinhNghiem !== '' &&
            (!Number.isInteger(Number(form.soNamKinhNghiem)) ||
                Number(form.soNamKinhNghiem) < 0)
        ) {
            setError('Số năm kinh nghiệm phải là số nguyên không âm.');
            return;
        }

        const data: CreateCoachInput = {
            hoTen: form.hoTen.trim(),
            email: form.email.trim(),
            matKhau: form.matKhau,
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

            const response = await fetch('/api/coaches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể thêm huấn luyện viên.');
            }

            alert('Thêm huấn luyện viên thành công!');
            onSuccess();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Đã xảy ra lỗi khi thêm huấn luyện viên.'
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full rounded-2xl border border-pink-200/80 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 shadow-xs';

    const labelClass = 'mb-1.5 block text-sm font-medium text-zinc-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                            <UserPlus size={21} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900">
                                Thêm huấn luyện viên
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Nhập thông tin huấn luyện viên mới
                            </p>
                        </div>
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
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="example@gmail.com"
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
                                        placeholder="Nhập số điện thoại"
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
                                        placeholder="Nhập địa chỉ"
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
                                    <label className={labelClass}>Mã huấn luyện viên *</label>
                                    <input
                                        name="maSoHuanLuyenVien"
                                        value={form.maSoHuanLuyenVien}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="VD: HLV26001"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Chuyên môn</label>
                                    <input
                                        name="chuyenMon"
                                        value={form.chuyenMon}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="VD: Karate, Kata, Kumite"
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
                                        placeholder="VD: 5"
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
                            </div>
                        </section>

                        <section>
                            <h3 className="mb-4 border-b border-zinc-100 pb-2 text-sm font-semibold text-blue-700">
                                3. Tài khoản đăng nhập
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Mật khẩu khởi tạo *</label>
                                    <input
                                        type="password"
                                        name="matKhau"
                                        value={form.matKhau}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Ít nhất 6 ký tự"
                                        minLength={6}
                                        required
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
                            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-sky-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-200/50 hover:from-pink-500 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Thêm huấn luyện viên
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
