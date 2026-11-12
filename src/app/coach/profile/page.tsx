'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    Award,
    BriefcaseBusiness,
    Clock,
    Pencil,
    Save,
    X,
    RefreshCw,
    ShieldCheck,
} from 'lucide-react';

interface UserProfile {
    userId: number;
    hoTen: string;
    email: string;
    vaiTro: string;
    trangThai: string;
    anhDaiDien: string | null;
    soDienThoai: string | null;
    diaChi: string | null;
    ngaySinh: string | null;
    gioiTinh: string | null;
}

interface CoachProfile {
    maHuanLuyenVien: number;
    maSoHuanLuyenVien: string;
    chuyenMon: string | null;
    soNamKinhNghiem: number | null;
    ngayBatDau: string | null;
    trangThai: string;
}

interface ProfileForm {
    hoTen: string;
    email: string;
    soDienThoai: string;
    diaChi: string;
    ngaySinh: string;
    gioiTinh: string;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return 'Chưa cập nhật';

    const date = new Date(value);

    if (isNaN(date.getTime())) return 'Chưa cập nhật';

    return date.toLocaleDateString('vi-VN');
}

function toDateInput(value: string | null | undefined): string {
    if (!value) return '';

    return value.substring(0, 10);
}

export default function CoachProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [coach, setCoach] = useState<CoachProfile | null>(null);

    const [form, setForm] = useState<ProfileForm>({
        hoTen: '',
        email: '',
        soDienThoai: '',
        diaChi: '',
        ngaySinh: '',
        gioiTinh: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const [userResponse, coachResponse] = await Promise.all([
                fetch('/api/auth/profile', { cache: 'no-store' }),
                fetch('/api/coach/profile', { cache: 'no-store' }),
            ]);

            const userData = await userResponse.json();
            const coachData = await coachResponse.json();

            if (!userResponse.ok || !userData.success) {
                throw new Error(
                    userData.message || 'Không thể tải thông tin tài khoản.'
                );
            }

            if (!coachResponse.ok || !coachData.success) {
                throw new Error(
                    coachData.message || 'Không thể tải hồ sơ huấn luyện viên.'
                );
            }

            const userInfo: UserProfile = userData.user;
            const coachInfo: CoachProfile = coachData.coach;

            setUser(userInfo);
            setCoach(coachInfo);

            setForm({
                hoTen: userInfo.hoTen || '',
                email: userInfo.email || '',
                soDienThoai: userInfo.soDienThoai || '',
                diaChi: userInfo.diaChi || '',
                ngaySinh: toDateInput(userInfo.ngaySinh),
                gioiTinh: userInfo.gioiTinh || '',
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải hồ sơ.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleChange = (
        field: keyof ProfileForm,
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleCancel = () => {
        if (user) {
            setForm({
                hoTen: user.hoTen || '',
                email: user.email || '',
                soDienThoai: user.soDienThoai || '',
                diaChi: user.diaChi || '',
                ngaySinh: toDateInput(user.ngaySinh),
                gioiTinh: user.gioiTinh || '',
            });
        }

        setEditing(false);
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');

        if (!form.hoTen.trim() || !form.email.trim()) {
            setError('Họ tên và email không được để trống.');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || 'Không thể cập nhật thông tin.'
                );
            }

            setSuccess('Cập nhật thông tin cá nhân thành công.');
            setEditing(false);

            await loadProfile();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi cập nhật.'
            );
        } finally {
            setSaving(false);
        }
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-zinc-100 disabled:text-zinc-500';

    const renderField = (
        label: string,
        field: keyof ProfileForm,
        type: string = 'text',
        placeholder: string = ''
    ) => (
        <div>
            <label className="text-sm font-semibold text-zinc-700">
                {label}
            </label>
            <input
                type={type}
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                disabled={!editing}
                placeholder={placeholder}
                className={inputClass}
            />
        </div>
    );

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-3 text-zinc-500">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Đang tải thông tin cá nhân...</span>
                </div>
            </div>
        );
    }

    if (!user || !coach) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="font-semibold text-red-700">
                    {error || 'Không thể tải hồ sơ huấn luyện viên.'}
                </p>
                <button
                    onClick={loadProfile}
                    className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                    Thử tải lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tiêu đề */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Thông tin cá nhân
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Xem và cập nhật thông tin tài khoản huấn luyện viên.
                    </p>
                </div>

                {!editing ? (
                    <button
                        onClick={() => {
                            setEditing(true);
                            setSuccess('');
                            setError('');
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
                    >
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa thông tin
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                            <X className="h-4 w-4" />
                            Hủy
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                        >
                            {saving ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                </div>
            )}

            {/* Thẻ hồ sơ */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-red-900 to-red-700 px-6 py-8 sm:px-8">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/40 bg-white text-red-800 shadow-lg">
                            {user.anhDaiDien ? (
                                <img
                                    src={user.anhDaiDien}
                                    alt="Ảnh đại diện"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserRound className="h-10 w-10" />
                            )}
                        </div>

                        <div className="text-center text-white sm:text-left">
                            <h2 className="text-2xl font-bold">
                                {user.hoTen}
                            </h2>
                            <p className="mt-1 text-sm text-red-100">
                                Huấn luyện viên CLB Karate HaUI
                            </p>
                            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                                <ShieldCheck className="h-4 w-4" />
                                {coach.maSoHuanLuyenVien}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-zinc-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Award className="h-4 w-4 text-red-700" />
                            Chuyên môn
                        </div>
                        <p className="mt-2 font-semibold text-zinc-800">
                            {coach.chuyenMon || 'Chưa cập nhật'}
                        </p>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <BriefcaseBusiness className="h-4 w-4 text-red-700" />
                            Kinh nghiệm
                        </div>
                        <p className="mt-2 font-semibold text-zinc-800">
                            {coach.soNamKinhNghiem !== null
                                ? `${coach.soNamKinhNghiem} năm`
                                : 'Chưa cập nhật'}
                        </p>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <CalendarDays className="h-4 w-4 text-red-700" />
                            Ngày bắt đầu
                        </div>
                        <p className="mt-2 font-semibold text-zinc-800">
                            {formatDate(coach.ngayBatDau)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Thông tin tài khoản */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-zinc-100 pb-4">
                    <div className="rounded-xl bg-red-50 p-2.5 text-red-700">
                        <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900">
                            Thông tin tài khoản
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Các thông tin HLV có thể tự cập nhật.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    {renderField('Họ và tên', 'hoTen', 'text', 'Nhập họ tên')}
                    {renderField('Email', 'email', 'email', 'Nhập email')}
                    {renderField('Số điện thoại', 'soDienThoai', 'tel', 'Nhập số điện thoại')}
                    {renderField('Ngày sinh', 'ngaySinh', 'date')}

                    <div>
                        <label className="text-sm font-semibold text-zinc-700">
                            Giới tính
                        </label>
                        <select
                            value={form.gioiTinh}
                            onChange={(e) => handleChange('gioiTinh', e.target.value)}
                            disabled={!editing}
                            className={inputClass}
                        >
                            <option value="">Chưa cập nhật</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-zinc-700">
                            Địa chỉ
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-5 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                value={form.diaChi}
                                onChange={(e) => handleChange('diaChi', e.target.value)}
                                disabled={!editing}
                                placeholder="Nhập địa chỉ"
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông tin nghề nghiệp */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-zinc-100 pb-4">
                    <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                        <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900">
                            Hồ sơ huấn luyện viên
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Thông tin do quản trị viên quản lý.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-semibold text-zinc-700">
                            Mã huấn luyện viên
                        </label>
                        <input
                            value={coach.maSoHuanLuyenVien}
                            disabled
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-zinc-700">
                            Trạng thái
                        </label>
                        <input
                            value={coach.trangThai === 'hoat_dong' ? 'Đang hoạt động' : coach.trangThai}
                            disabled
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {!editing && (
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                        Bạn có thể tự cập nhật họ tên, email, số điện thoại,
                        ngày sinh, giới tính và địa chỉ. Mã HLV, chuyên môn,
                        kinh nghiệm và trạng thái do quản trị viên quản lý.
                    </p>
                </div>
            )}
        </div>
    );
}