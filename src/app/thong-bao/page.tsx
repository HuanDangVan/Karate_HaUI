'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
    Bell,
    Plus,
    Search,
    Eye,
    X,
    Users,
    CheckCheck,
    Clock,
    Send,
    RefreshCw,
    MessageSquare,
    Pencil,
    Trash2,
    MapPin,
    Flame,
    Sparkles,
} from 'lucide-react';

interface NotificationItem {
    maThongBao: number;
    tieuDe: string;
    noiDung: string;
    nguoiTao: number;
    tenNguoiTao: string;
    ngayTao: string;
    tongNguoiNhan: number;
    soNguoiDaDoc: number;
    soNguoiChuaDoc: number;
}

interface NotificationRecipient {
    maTaiKhoan: number;
    hoTen: string;
    email: string;
    vaiTro: string;
    daDoc: boolean;
    thoiGianDoc: string | null;
}

interface NotificationDetail {
    thongBao: NotificationItem;
    nguoiNhan: NotificationRecipient[];
}

const formatDate = (value: string | null) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('vi-VN');
};

const roleLabel = (role: string) => {
    switch (role) {
        case 'quan_tri_vien':
            return 'Quản trị viên';
        case 'huan_luyen_vien':
            return 'Huấn luyện viên';
        case 'hoc_vien':
            return 'Học viên';
        default:
            return role;
    }
};

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedNotification, setSelectedNotification] =
        useState<NotificationDetail | null>(null);

    const [formData, setFormData] = useState({
        tieuDe: '',
        noiDung: '',
        loaiNguoiNhan: 'hoc_vien',
    });

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/notifications');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tải danh sách thông báo.');
            }

            setNotifications(Array.isArray(result.data) ? result.data : []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải thông báo.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const filteredNotifications = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return notifications;

        return notifications.filter(
            (item) =>
                item.tieuDe.toLowerCase().includes(keyword) ||
                item.noiDung.toLowerCase().includes(keyword)
        );
    }, [notifications, search]);

    const statistics = useMemo(() => {
        return {
            total: notifications.length,
            recipients: notifications.reduce(
                (sum, item) => sum + Number(item.tongNguoiNhan || 0),
                0
            ),
            read: notifications.reduce(
                (sum, item) => sum + Number(item.soNguoiDaDoc || 0),
                0
            ),
            unread: notifications.reduce(
                (sum, item) => sum + Number(item.soNguoiChuaDoc || 0),
                0
            ),
        };
    }, [notifications]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            tieuDe: '',
            noiDung: '',
            loaiNguoiNhan: 'hoc_vien',
        });
        setShowCreateModal(true);
    };

    const handleOpenEdit = (item: NotificationItem) => {
        setEditingId(item.maThongBao);
        setFormData({
            tieuDe: item.tieuDe,
            noiDung: item.noiDung,
            loaiNguoiNhan: 'hoc_vien',
        });
        setShowCreateModal(true);
    };

    const handleSaveNotification = async () => {
        if (!formData.tieuDe.trim() || !formData.noiDung.trim()) {
            alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
            return;
        }

        try {
            setSubmitting(true);

            const isEditing = editingId !== null;

            const response = await fetch(
                isEditing
                    ? `/api/notifications/${editingId}`
                    : '/api/notifications',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        isEditing
                            ? {
                                tieuDe: formData.tieuDe.trim(),
                                noiDung: formData.noiDung.trim(),
                            }
                            : {
                                tieuDe: formData.tieuDe.trim(),
                                noiDung: formData.noiDung.trim(),
                                loaiNguoiNhan: formData.loaiNguoiNhan,
                            }
                    ),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    (isEditing
                        ? 'Không thể cập nhật thông báo.'
                        : 'Không thể tạo thông báo.')
                );
            }

            alert(
                isEditing
                    ? 'Cập nhật thông báo thành công!'
                    : 'Tạo và gửi thông báo thành công!'
            );

            setShowCreateModal(false);
            setEditingId(null);
            setFormData({
                tieuDe: '',
                noiDung: '',
                loaiNguoiNhan: 'hoc_vien',
            });

            await fetchNotifications();
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi lưu thông báo.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNotification = async (id: number) => {
        const confirmed = window.confirm(
            'Bạn có chắc chắn muốn xóa thông báo này? Danh sách người nhận liên quan cũng sẽ bị xóa.'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể xóa thông báo.');
            }

            alert('Xóa thông báo thành công!');

            if (selectedNotification?.thongBao.maThongBao === id) {
                setShowDetailModal(false);
                setSelectedNotification(null);
            }

            await fetchNotifications();
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi xóa thông báo.'
            );
        }
    };

    const handleViewDetail = async (id: number) => {
        try {
            const response = await fetch(`/api/notifications/${id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tải chi tiết thông báo.');
            }

            setSelectedNotification(result.data);
            setShowDetailModal(true);
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi tải chi tiết.'
            );
        }
    };

    return (
        <AdminLayout pageTitle="Quản lý thông báo">
            <div className="space-y-6 text-slate-800">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white    p-6 shadow-[0_12px_40px_rgba(219,39,119,0.08)] sm:p-8">
                    <div className="pointer-events-none absolute -bottom-16 -right-8 select-none text-[180px] font-black leading-none text-white/40">
                        空手
                    </div>
                    <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                                    <Flame size={13} />
                                    Karate-HaUI
                                </span>
                                <span className="rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                                    Đại học Công Nghiệp Hà Nội
                                </span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                Quản lý thông báo{' '}
                                <span className="bg-white   bg-clip-text text-transparent">
                                    câu lạc bộ
                                </span>
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                                Tạo và theo dõi thông tin gửi đến học viên, huấn luyện viên và thành viên CLB Karate-HaUI.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/75 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm">
                                <MapPin size={14} className="text-blue-600" />
                                Chùa Thủ Hoàng, Đại học Công Nghiệp Hà Nội
                            </div>
                        </div>

                        <div className="relative flex shrink-0 flex-wrap gap-2">
                            <button
                                onClick={fetchNotifications}
                                className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                            >
                                <RefreshCw size={16} />
                                Làm mới
                            </button>
                            <button
                                onClick={handleOpenCreate}
                                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
                            >
                                <Plus size={18} />
                                Tạo thông báo
                            </button>
                        </div>
                    </div>
                </section>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[22px] border border-gray-200 bg-white   p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Tổng thông báo</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">
                                    {statistics.total}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">Thông báo đã tạo</p>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
                                <Bell size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[22px] border border-sky-200 bg-white  to-cyan-100/80 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Lượt nhận thông báo</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">
                                    {statistics.recipients}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">Tổng thành viên nhận</p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
                                <Users size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[22px] border border-purple-200 bg-white   p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-purple-800">Đã đọc</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">
                                    {statistics.read}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">Lượt xem thông báo</p>
                            </div>
                            <div className="rounded-xl bg-purple-50 p-3.5 text-purple-600">
                                <CheckCheck size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[22px] border border-amber-200 bg-white from-amber-50 to-orange-100/80 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Chưa đọc</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">
                                    {statistics.unread}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">Đang chờ thành viên xem</p>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-3.5 text-amber-600">
                                <Clock size={22} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification list */}
                <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                    <div className="flex flex-col justify-between gap-4 border-b border-gray-200 bg-white    p-5 sm:flex-row sm:items-center sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-xl bg-gray-100 p-2.5 text-blue-600">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Danh sách thông báo
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Theo dõi nội dung và tình trạng tiếp nhận thông báo.
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm theo tiêu đề, nội dung..."
                                className="w-full rounded-xl border border-gray-200 bg-white/90 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-16 text-center text-sm text-slate-500">
                            Đang tải danh sách thông báo...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-16 text-center">
                            <MessageSquare
                                size={40}
                                className="mx-auto mb-3 text-gray-400"
                            />
                            <p className="font-semibold text-slate-700">
                                {search
                                    ? 'Không tìm thấy thông báo phù hợp.'
                                    : 'Chưa có thông báo nào.'}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                {search
                                    ? 'Thử tìm kiếm với từ khóa khác.'
                                    : 'Nhấn Tạo thông báo để gửi thông tin đến thành viên.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white   text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Thông báo</th>
                                        <th className="px-5 py-4 font-semibold">Người tạo</th>
                                        <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                                        <th className="px-5 py-4 text-center font-semibold">
                                            Người nhận
                                        </th>
                                        <th className="px-5 py-4 text-center font-semibold">
                                            Đã đọc
                                        </th>
                                        <th className="px-5 py-4 text-center font-semibold">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredNotifications.map((item) => (
                                        <tr
                                            key={item.maThongBao}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="max-w-md px-5 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {item.tieuDe}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                                    {item.noiDung}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {item.tenNguoiTao}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                                {formatDate(item.ngayTao)}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-700">
                                                    {item.tongNguoiNhan}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="font-semibold text-emerald-600">
                                                    {item.soNguoiDaDoc}
                                                </span>
                                                <span className="text-slate-400">
                                                    {' / '}
                                                    {item.tongNguoiNhan}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleViewDetail(item.maThongBao)}
                                                        title="Xem chi tiết"
                                                        className="rounded-xl p-2 text-sky-600 transition hover:bg-sky-50"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        title="Sửa thông báo"
                                                        className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteNotification(item.maThongBao)}
                                                        title="Xóa thông báo"
                                                        className="rounded-xl p-2 text-blue-600 transition hover:bg-gray-50"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-t border-gray-200 bg-white   px-5 py-3 text-xs text-slate-500">
                        Hiển thị {filteredNotifications.length} / {notifications.length}{' '}
                        thông báo
                    </div>
                </div>
            </div>

            {/* Create notification modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="my-8 w-full max-w-xl overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-2xl shadow-slate-900/20">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-white   px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {editingId !== null ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {editingId !== null
                                        ? 'Cập nhật tiêu đề và nội dung thông báo.'
                                        : 'Thông báo sẽ được gửi ngay sau khi xác nhận.'}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingId(null);
                                }}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-blue-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Tiêu đề thông báo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={100}
                                    value={formData.tieuDe}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tieuDe: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập tiêu đề thông báo..."
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <p className="mt-1 text-right text-xs text-slate-400">
                                    {formData.tieuDe.length}/100
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={6}
                                    value={formData.noiDung}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            noiDung: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập nội dung thông báo..."
                                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                            {editingId === null && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Đối tượng nhận <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.loaiNguoiNhan}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                loaiNguoiNhan: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    >
                                        <option value="hoc_vien">Tất cả học viên</option>
                                        <option value="huan_luyen_vien">
                                            Tất cả huấn luyện viên
                                        </option>
                                        <option value="tat_ca">Tất cả thành viên</option>
                                    </select>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Chỉ những tài khoản đang hoạt động mới nhận được thông báo.
                                    </p>
                                </div>)}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingId(null);
                                }}
                                disabled={submitting}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleSaveNotification}
                                disabled={submitting}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {editingId !== null ? <Pencil size={16} /> : <Send size={16} />}
                                {submitting
                                    ? 'Đang lưu...'
                                    : editingId !== null
                                        ? 'Lưu thay đổi'
                                        : 'Tạo và gửi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification detail modal */}
            {showDetailModal && selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="my-8 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-2xl shadow-slate-900/20">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-white   px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Chi tiết thông báo
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Mã thông báo: #{selectedNotification.thongBao.maThongBao}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-blue-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-75px)] space-y-6 overflow-y-auto p-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {selectedNotification.thongBao.tieuDe}
                                </h3>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                    {selectedNotification.thongBao.noiDung}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                                    <span>
                                        Người tạo:{' '}
                                        <strong className="font-semibold text-slate-700">
                                            {selectedNotification.thongBao.tenNguoiTao}
                                        </strong>
                                    </span>
                                    <span>
                                        Ngày tạo:{' '}
                                        <strong className="font-semibold text-slate-700">
                                            {formatDate(selectedNotification.thongBao.ngayTao)}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800">
                                        Danh sách người nhận
                                    </h3>
                                    <span className="text-sm text-slate-500">
                                        {selectedNotification.nguoiNhan.length} người
                                    </span>
                                </div>

                                {selectedNotification.nguoiNhan.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-slate-500">
                                        Chưa có dữ liệu người nhận.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white   text-xs text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Họ và tên
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">Email</th>
                                                    <th className="px-4 py-3 font-semibold">Vai trò</th>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Trạng thái
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Thời gian đọc
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100">
                                                {selectedNotification.nguoiNhan.map((recipient) => (
                                                    <tr key={recipient.maTaiKhoan}>
                                                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                                                            {recipient.hoTen}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500">
                                                            {recipient.email}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                                            {roleLabel(recipient.vaiTro)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3">
                                                            {recipient.daDoc ? (
                                                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                                                    Đã đọc
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                                                                    Chưa đọc
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                                                            {formatDate(recipient.thoiGianDoc)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}