
'use client';

import { X, UserRound, Mail, Phone, MapPin, Calendar, Award, Briefcase } from 'lucide-react';
import { CoachItem } from '@/types/coach';
import CoachStatusBadge from './CoachStatusBadge';

interface CoachDetailModalProps {
    isOpen: boolean;
    coach: CoachItem | null;
    onClose: () => void;
}

export default function CoachDetailModal({
    isOpen,
    coach,
    onClose,
}: CoachDetailModalProps) {
    if (!isOpen || !coach) return null;

    const formatDate = (date: string | null) => {
        if (!date) return 'Chưa cập nhật';

        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return 'Chưa cập nhật';

        return parsed.toLocaleDateString('vi-VN');
    };

    const infoClass = 'rounded-lg bg-zinc-50 p-3';

    const InfoItem = ({
        label,
        value,
        icon,
    }: {
        label: string;
        value: string;
        icon: React.ReactNode;
    }) => (
        <div className={infoClass}>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                {icon}
                {label}
            </div>
            <p className="break-words text-sm font-medium text-zinc-800">
                {value || 'Chưa cập nhật'}
            </p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Thông tin huấn luyện viên
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            Mã: {coach.maSoHuanLuyenVien}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 flex flex-col items-center gap-3 border-b border-zinc-100 pb-6 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-600">
                            {coach.anhDaiDien ? (
                                <img
                                    src={coach.anhDaiDien}
                                    alt={coach.hoTen}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserRound size={36} />
                            )}
                        </div>

                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-bold text-zinc-900">
                                {coach.hoTen}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500">
                                Huấn luyện viên Karate
                            </p>
                            <div className="mt-2">
                                <CoachStatusBadge status={coach.trangThai} />
                            </div>
                        </div>
                    </div>

                    <section className="mb-6">
                        <h3 className="mb-3 text-sm font-semibold text-blue-700">
                            Thông tin cá nhân
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <InfoItem
                                label="Email"
                                value={coach.email}
                                icon={<Mail size={14} />}
                            />

                            <InfoItem
                                label="Số điện thoại"
                                value={coach.soDienThoai || ''}
                                icon={<Phone size={14} />}
                            />

                            <InfoItem
                                label="Ngày sinh"
                                value={formatDate(coach.ngaySinh)}
                                icon={<Calendar size={14} />}
                            />

                            <InfoItem
                                label="Giới tính"
                                value={coach.gioiTinh || ''}
                                icon={<UserRound size={14} />}
                            />

                            <div className="sm:col-span-2">
                                <InfoItem
                                    label="Địa chỉ"
                                    value={coach.diaChi || ''}
                                    icon={<MapPin size={14} />}
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-blue-700">
                            Thông tin huấn luyện
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <InfoItem
                                label="Mã huấn luyện viên"
                                value={coach.maSoHuanLuyenVien}
                                icon={<Award size={14} />}
                            />

                            <InfoItem
                                label="Chuyên môn"
                                value={coach.chuyenMon || ''}
                                icon={<Briefcase size={14} />}
                            />

                            <InfoItem
                                label="Số năm kinh nghiệm"
                                value={
                                    coach.soNamKinhNghiem !== null &&
                                        coach.soNamKinhNghiem !== undefined
                                        ? `${coach.soNamKinhNghiem} năm`
                                        : ''
                                }
                                icon={<Award size={14} />}
                            />

                            <InfoItem
                                label="Ngày bắt đầu công tác"
                                value={formatDate(coach.ngayBatDau)}
                                icon={<Calendar size={14} />}
                            />
                        </div>
                    </section>

                    <div className="mt-6 flex justify-end border-t border-zinc-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
