
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Users,
    GraduationCap,
    Wallet,
    Search,
    RefreshCw,
    Mail,
    Phone,
    CalendarDays,
    AlertCircle,
    UserRound,
    CheckCircle2,
} from 'lucide-react';
import type { ClassItem } from '@/types/class';
import type { CoachClassStudent } from '@/lib/coach-class-service';

export default function CoachClassDetailPage() {
    const params = useParams();
    const router = useRouter();

    const maLop = params.id;

    const [classInfo, setClassInfo] = useState<ClassItem | null>(null);
    const [students, setStudents] = useState<CoachClassStudent[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const [classResponse, studentResponse] = await Promise.all([
                fetch(`/api/coach/classes/${maLop}`),
                fetch(`/api/coach/classes/${maLop}/students`),
            ]);

            if (
                classResponse.status === 401 ||
                studentResponse.status === 401
            ) {
                router.replace('/login');
                return;
            }

            const classResult = await classResponse.json();
            const studentResult = await studentResponse.json();

            if (!classResponse.ok || !classResult.success) {
                throw new Error(
                    classResult.message || 'Không thể tải thông tin lớp học.',
                );
            }

            if (!studentResponse.ok || !studentResult.success) {
                throw new Error(
                    studentResult.message || 'Không thể tải danh sách học viên.',
                );
            }

            setClassInfo(classResult.data);
            setStudents(studentResult.data || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải dữ liệu.',
            );
        } finally {
            setLoading(false);
        }
    }, [maLop, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return students;

        return students.filter((student) =>
            student.hoTen.toLowerCase().includes(keyword) ||
            student.maSoHocVien.toLowerCase().includes(keyword) ||
            student.email.toLowerCase().includes(keyword)
        );
    }, [students, search]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('vi-VN').format(value) + ' đ';

    const formatDate = (date: string | null) => {
        if (!date) return 'Chưa cập nhật';

        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    const statusConfig: Record<string, string> = {
        hoat_dong: 'Đang hoạt động',
        tam_dung: 'Tạm dừng',
        ngung_hoat_dong: 'Ngừng hoạt động',
    };

    const percentage = classInfo && classInfo.siSoToiDa > 0
        ? Math.min(100, classInfo.siSoHienTai / classInfo.siSoToiDa * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-100 p-6">
                <div className="mx-auto max-w-6xl animate-pulse space-y-5">
                    <div className="h-32 rounded-2xl bg-zinc-200" />
                    <div className="h-36 rounded-2xl bg-white" />
                    <div className="h-80 rounded-2xl bg-white" />
                </div>
            </div>
        );
    }

    if (error || !classInfo) {
        return (
            <div className="min-h-screen bg-zinc-100 p-6">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h2 className="mt-4 text-lg font-bold">
                        Không thể tải thông tin lớp học
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        {error || 'Không tìm thấy lớp học.'}
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            onClick={loadData}
                            className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white"
                        >
                            Thử lại
                        </button>
                        <Link
                            href="/coach/classes"
                            className="rounded-xl border px-5 py-2.5 text-sm font-bold"
                        >
                            Quay lại
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-6 bg-zinc-100 p-4 text-zinc-900 sm:p-6 lg:p-8">

            {/* HEADER */}
            <section className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
                <Link
                    href="/coach/classes"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Danh sách lớp học
                </Link>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300">
                            {classInfo.maSoLop}
                        </span>

                        <h1 className="mt-3 text-2xl font-black sm:text-3xl">
                            {classInfo.tenLop}
                        </h1>

                        <p className="mt-2 text-sm text-zinc-300">
                            {classInfo.capDo || 'Chưa cập nhật cấp độ'}
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-bold ring-1 ring-white/20">
                        {statusConfig[classInfo.trangThai] || classInfo.trangThai}
                    </span>
                </div>
            </section>

            {/* CLASS INFORMATION */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
                        <Users className="h-5 w-5 text-blue-700" />
                        Sĩ số hiện tại
                    </div>
                    <p className="mt-3 text-3xl font-black">
                        {classInfo.siSoHienTai}
                        <span className="ml-2 text-base font-medium text-zinc-400">
                            / {classInfo.siSoToiDa} học viên
                        </span>
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                        {percentage.toFixed(0)}% sức chứa
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
                        <Wallet className="h-5 w-5 text-emerald-700" />
                        Học phí mỗi buổi
                    </div>
                    <p className="mt-3 text-2xl font-black text-zinc-900">
                        {formatCurrency(classInfo.donGiaMoiBuoi)}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                        Đơn giá áp dụng cho một buổi tập
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
                        <GraduationCap className="h-5 w-5 text-violet-700" />
                        Huấn luyện viên
                    </div>
                    <p className="mt-3 text-lg font-black">
                        {classInfo.tenHuanLuyenVien || 'Chưa cập nhật'}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                        Người phụ trách lớp học
                    </p>
                </div>
            </section>

            {/* DESCRIPTION */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-700" />
                    <h2 className="font-bold">Thông tin giới thiệu lớp</h2>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                    {classInfo.moTa || 'Lớp học chưa có mô tả.'}
                </p>
            </section>

            {/* STUDENTS */}
            <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                <div className="border-b border-zinc-100 p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-bold">
                                <Users className="h-5 w-5 text-blue-700" />
                                Danh sách học viên
                            </h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                {students.length} học viên đang theo học lớp này
                            </p>
                        </div>

                        <button
                            onClick={loadData}
                            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-zinc-50"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Làm mới
                        </button>
                    </div>

                    <div className="relative mt-5">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo mã học viên, họ tên hoặc email..."
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <UserRound className="mx-auto h-12 w-12 text-zinc-300" />
                        <p className="mt-3 font-semibold text-zinc-700">
                            {students.length === 0
                                ? 'Lớp học chưa có học viên'
                                : 'Không tìm thấy học viên'}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            {students.length === 0
                                ? 'Học viên đăng ký lớp sẽ xuất hiện tại đây.'
                                : 'Thử tìm kiếm với từ khóa khác.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                                    <tr>
                                        <th className="px-6 py-4">Học viên</th>
                                        <th className="px-6 py-4">Mã học viên</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Số điện thoại</th>
                                        <th className="px-6 py-4">Ngày đăng ký</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredStudents.map((student) => (
                                        <tr
                                            key={student.maHocVien}
                                            className="transition hover:bg-zinc-50"
                                        >
                                            <td className="px-6 py-4 font-semibold">
                                                {student.hoTen}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">
                                                {student.maSoHocVien}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">
                                                {student.email}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">
                                                {student.soDienThoai || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">
                                                {formatDate(student.ngayDangKy)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Đang học
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-3 p-4 md:hidden">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.maHocVien}
                                    className="rounded-xl border border-zinc-200 p-4"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-bold">{student.hoTen}</p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {student.maSoHocVien}
                                            </p>
                                        </div>
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    </div>

                                    <div className="mt-4 space-y-2 text-xs text-zinc-500">
                                        <p className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5" />
                                            {student.email}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5" />
                                            {student.soDienThoai || 'Chưa cập nhật'}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Ngày đăng ký: {formatDate(student.ngayDangKy)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 text-xs text-zinc-500">
                    Đang hiển thị {filteredStudents.length}/{students.length} học viên.
                </div>
            </section>
        </div>
    );
}
