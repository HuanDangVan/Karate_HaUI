'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { StudentItem, UpdateStudentInput, StudentStatus } from '@/types/student';

interface EditStudentModalProps {
  isOpen: boolean;
  student: StudentItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStudentModal({
  isOpen,
  student,
  onClose,
  onSuccess,
}: EditStudentModalProps) {
  const [formData, setFormData] = useState<UpdateStudentInput>({
    hoTen: '',
    maSoHocVien: '',
    soDienThoai: '',
    diaChi: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    ngayThamGia: '',
    ghiChu: '',
    trangThai: 'hoat_dong',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        hoTen: student.hoTen || '',
        maSoHocVien: student.maSoHocVien || '',
        soDienThoai: student.soDienThoai || '',
        diaChi: student.diaChi || '',
        ngaySinh: student.ngaySinh || '',
        gioiTinh: student.gioiTinh || 'Nam',
        ngayThamGia: student.ngayThamGia || '',
        ghiChu: student.ghiChu || '',
        trangThai: student.trangThai || 'hoat_dong',
      });
      setErrorMessage('');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.hoTen.trim()) {
      setErrorMessage('Họ và tên không được để trống.');
      return;
    }
    if (!formData.maSoHocVien.trim()) {
      setErrorMessage('Mã số học viên không được để trống.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/students/${student.maHocVien}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Cập nhật học viên thất bại.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl my-8">
        <div className="h-2 w-full bg-white   " />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-blue-600 ring-1 ring-gray-200">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">
                  Cập Nhật Thông Tin Học Viên
                </h3>
                <p className="text-xs text-zinc-500">
                  Mã học viên ID: #{student.maHocVien} • Mã tài khoản: #{student.maTaiKhoan}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* System Security Notice */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 text-xs text-zinc-600 border border-zinc-200/80">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Mã tài khoản và vai trò (<strong className="text-zinc-800">hoc_vien</strong>) được khóa cố định theo chính sách bảo mật hệ thống.
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Họ và tên học viên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                />
              </div>

              {/* Mã số học viên */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Mã số học viên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.maSoHocVien}
                  onChange={(e) =>
                    setFormData({ ...formData, maSoHocVien: e.target.value.toUpperCase() })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm font-semibold tracking-wider text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                />
              </div>

              {/* Email (Khóa không sửa trực tiếp để bảo vệ khóa ngoại và tài khoản) */}
              <div>
                <label className="block text-xs font-bold text-zinc-500">
                  Email đăng nhập (Cố định)
                </label>
                <input
                  type="email"
                  disabled
                  value={student.email}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2 text-sm text-zinc-500 cursor-not-allowed select-none"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  placeholder="0987654321"
                  value={formData.soDienThoai || ''}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                />
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={formData.ngaySinh || ''}
                  onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Giới tính
                </label>
                <select
                  value={formData.gioiTinh || 'Nam'}
                  onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Ngày tham gia */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Ngày nhập môn CLB
                </label>
                <input
                  type="date"
                  value={formData.ngayThamGia || ''}
                  onChange={(e) => setFormData({ ...formData, ngayThamGia: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                />
              </div>

              {/* Trạng thái học viên */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Trạng thái học tập
                </label>
                <select
                  value={formData.trangThai || 'hoat_dong'}
                  onChange={(e) =>
                    setFormData({ ...formData, trangThai: e.target.value as StudentStatus })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                >
                  <option value="hoat_dong">Đang học (Hoạt động)</option>
                  <option value="tam_dung">Tạm dừng (Bảo lưu)</option>
                  <option value="ngung_hoat_dong">Ngừng hoạt động (Đã nghỉ học)</option>
                </select>
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-xs font-bold text-zinc-700">
                Địa chỉ / Nơi ở
              </label>
              <input
                type="text"
                value={formData.diaChi || ''}
                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-bold text-zinc-700">
                Ghi chú học viên
              </label>
              <textarea
                rows={2}
                value={formData.ghiChu || ''}
                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
              />
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
