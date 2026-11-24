'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { CreateStudentInput } from '@/types/student';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  suggestedCode?: string;
}

export function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
  suggestedCode = '',
}: AddStudentModalProps) {
  const [formData, setFormData] = useState<CreateStudentInput>({
    hoTen: '',
    email: '',
    matKhau: '123456',
    maSoHocVien: '',
    soDienThoai: '',
    diaChi: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    ngayThamGia: new Date().toISOString().split('T')[0],
    ghiChu: '',
    trangThai: 'hoat_dong',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        maSoHocVien: suggestedCode || prev.maSoHocVien || 'HV26001',
        ngayThamGia: new Date().toISOString().split('T')[0],
      }));
      setErrorMessage('');
    }
  }, [isOpen, suggestedCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.hoTen.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên học viên.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!formData.maSoHocVien.trim()) {
      setErrorMessage('Vui lòng nhập mã số học viên.');
      return;
    }
    if (!formData.matKhau || formData.matKhau.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Thêm học viên thất bại.');
        setIsSubmitting(false);
        return;
      }

      // Thành công
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
        {/* Top Header Accent */}
        <div className="h-2 w-full bg-white   " />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-blue-600 ring-1 ring-gray-200">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Thêm Học Viên Mới — Karate-HaUI
                </h3>
                <p className="text-xs text-slate-500">
                  Khởi tạo tài khoản hệ thống và hồ sơ học viên CLB Karate-HaUI
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

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Họ và tên học viên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn An"
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
                  placeholder="Ví dụ: HV26001"
                  value={formData.maSoHocVien}
                  onChange={(e) =>
                    setFormData({ ...formData, maSoHocVien: e.target.value.toUpperCase() })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm font-semibold tracking-wider text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Email đăng nhập <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="hocvien@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                />
              </div>

              {/* Mật khẩu khởi tạo */}
              <div>
                <label className="block text-xs font-bold text-zinc-700">
                  Mật khẩu khởi tạo <span className="text-red-600">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mặc định: 123456"
                    value={formData.matKhau}
                    onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 pr-10 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-xs font-bold text-zinc-700">
                Địa chỉ / Ký túc xá HaUI
              </label>
              <input
                type="text"
                placeholder="Ví dụ: KTX Nhà A2, ĐH Công nghiệp Hà Nội hoặc Số 123 Cầu Diễn"
                value={formData.diaChi || ''}
                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 text-sm text-zinc-900 focus:border-red-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-bold text-zinc-700">
                Ghi chú học viên (Cấp đai ban đầu, mục tiêu rèn luyện...)
              </label>
              <textarea
                rows={2}
                placeholder="Ghi chú thêm về học viên..."
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
                    <span>Đang lưu SQL...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Lưu học viên</span>
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
