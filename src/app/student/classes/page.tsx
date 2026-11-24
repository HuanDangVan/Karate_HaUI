
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Users,
    UserRound,
    Search,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowLeft,
} from 'lucide-react';

interface StudentClass {
    maLop: number;
    maSoLop: string;
    tenLop: string;
    moTa: string | null;
    capDo: string | null;
    siSoToiDa: number;
    siSoHienTai: number;
    donGiaMoiBuoi: number;
    tenHuanLuyenVien: string | null;
    trangThaiDangKy: string | null;
    ngayDangKy: string | null;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ';

const statusInfo: Record<string, { label: string; color: string }> = {
    cho_duyet: {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-700',
    },
    dang_hoc: {
        label: 'Đang học',
        color: 'bg-green-100 text-green-700',
    },
    tu_choi: {
        label: 'Bị từ chối',
        color: 'bg-red-100 text-red-700',
    },
};

export default function StudentClassesPage() {
    const [classes, setClasses] = useState<StudentClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [registeringId, setRegisteringId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const fetchClasses = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/student/classes');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể tải danh sách lớp học.');
            }

            setClasses(result.data || []);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi khi tải danh sách lớp.'
            );
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleRegister = async (maLop: number) => {
        const confirmed = window.confirm(
            'Bạn có chắc chắn muốn gửi yêu cầu đăng ký lớp học này không?'
        );

        if (!confirmed) return;

        try {
            setRegisteringId(maLop);
            setMessage('');

            const response = await fetch('/api/student/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ maLop }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Đăng ký lớp học thất bại.');
            }

            setMessage(result.message || 'Đăng ký lớp thành công.');
            setMessageType('success');

            await fetchClasses();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi khi đăng ký.'
            );
            setMessageType('error');
        } finally {
            setRegisteringId(null);
        }
    };

    const filteredClasses = classes.filter((item) => {
        const keyword = search.trim().toLowerCase();

        return (
            item.tenLop?.toLowerCase().includes(keyword) ||
            item.maSoLop?.toLowerCase().includes(keyword) ||
            item.capDo?.toLowerCase().includes(keyword) ||
            item.tenHuanLuyenVien?.toLowerCase().includes(keyword)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-700 p-2.5 text-white">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                Đăng ký lớp học
                            </h1>
                            <p className="text-xs text-gray-500">
                                Câu lạc bộ Karate HaUI
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/student"
                        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        <ArrowLeft size={16} />
                        Quay lại
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Các lớp học đang hoạt động
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Chọn lớp học phù hợp và gửi yêu cầu đăng ký.
                        Bạn cần chờ quản trị viên phê duyệt trước khi tham gia lớp.
                    </p>
                </div>

                {message && (
                    <div
                        className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${messageType === 'success'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                    >
                        {messageType === 'success' ? (
                            <CheckCircle2 size={20} />
                        ) : (
                            <AlertCircle size={20} />
                        )}
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên lớp, mã lớp, cấp độ..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    <button
                        onClick={fetchClasses}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? 'animate-spin' : ''}
                        />
                        Làm mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <RefreshCw size={30} className="mb-3 animate-spin" />
                        <p className="text-sm">Đang tải danh sách lớp học...</p>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <BookOpen
                            size={42}
                            className="mx-auto mb-4 text-gray-300"
                        />
                        <h3 className="font-semibold text-gray-700">
                            {classes.length === 0
                                ? 'Hiện chưa có lớp học nào hoạt động'
                                : 'Không tìm thấy lớp học phù hợp'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Bạn có thể thử lại sau hoặc thay đổi từ khóa tìm kiếm.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-gray-500">
                            Tìm thấy <strong className="text-gray-900">{filteredClasses.length}</strong> lớp học
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredClasses.map((item) => {
                                const status = item.trangThaiDangKy
                                    ? statusInfo[item.trangThaiDangKy] || {
                                        label: item.trangThaiDangKy,
                                        color: 'bg-gray-100 text-gray-700',
                                    }
                                    : null;

                                const isFull =
                                    item.siSoHienTai >= item.siSoToiDa;

                                return (
                                    <div
                                        key={item.maLop}
                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="bg-gradient-to-r from-red-800 to-red-600 px-5 py-5 text-white">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold">
                                                    {item.maSoLop}
                                                </span>

                                                {item.capDo && (
                                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                                                        {item.capDo}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold">
                                                {item.tenLop}
                                            </h3>
                                        </div>

                                        <div className="space-y-4 p-5">
                                            <p className="min-h-10 text-sm leading-relaxed text-gray-500">
                                                {item.moTa || 'Chưa có mô tả cho lớp học này.'}
                                            </p>

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <UserRound
                                                    size={18}
                                                    className="text-red-600"
                                                />
                                                <span>
                                                    Huấn luyện viên:{' '}
                                                    <strong className="text-gray-900">
                                                        {item.tenHuanLuyenVien || 'Chưa phân công'}
                                                    </strong>
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Users
                                                    size={18}
                                                    className="text-red-600"
                                                />
                                                <span>
                                                    Sĩ số:{' '}
                                                    <strong className="text-gray-900">
                                                        {item.siSoHienTai}/{item.siSoToiDa}
                                                    </strong>
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                <span className="text-sm text-gray-500">
                                                    Học phí mỗi buổi
                                                </span>
                                                <strong className="text-base text-red-700">
                                                    {formatCurrency(item.donGiaMoiBuoi)}
                                                </strong>
                                            </div>

                                            {status ? (
                                                <div className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${status.color}`}>
                                                    {item.trangThaiDangKy === 'cho_duyet' ? (
                                                        <Clock size={17} />
                                                    ) : (
                                                        <CheckCircle2 size={17} />
                                                    )}
                                                    {status.label}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegister(item.maLop)}
                                                    disabled={isFull || registeringId !== null}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                                >
                                                    {registeringId === item.maLop ? (
                                                        <>
                                                            <RefreshCw size={17} className="animate-spin" />
                                                            Đang gửi yêu cầu...
                                                        </>
                                                    ) : isFull ? (
                                                        'Lớp đã đủ sĩ số'
                                                    ) : (
                                                        'Đăng ký lớp học'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
