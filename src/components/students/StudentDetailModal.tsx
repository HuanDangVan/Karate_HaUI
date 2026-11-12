'use client';

import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  FileText,
  Edit3,
} from 'lucide-react';
import { StudentItem } from '@/types/student';
import { StudentStatusBadge } from './StudentStatusBadge';

interface StudentDetailModalProps {
  isOpen: boolean;
  student: StudentItem | null;
  onClose: () => void;
  onEdit: (student: StudentItem) => void;
}

export function StudentDetailModal({
  isOpen,
  student,
  onClose,
  onEdit,
}: StudentDetailModalProps) {
  if (!isOpen || !student) return null;

  const initials = student.hoTen
    ? student.hoTen
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase()
    : 'HV';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl my-8">
        {/* Top Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-rose-300 to-sky-400" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-pink-50 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-300 to-sky-400 font-bold text-lg text-white shadow-md ring-2 ring-pink-100">
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800">{student.hoTen}</h3>
                  <StudentStatusBadge status={student.trangThai} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-pink-100 px-2.5 py-0.5 font-bold text-pink-700">
                    Mã số: {student.maSoHocVien}
                  </span>
                  <span>•</span>
                  <span>Mã HV: #{student.maHocVien}</span>
                  <span>•</span>
                  <span>Mã TK: #{student.maTaiKhoan}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Details Grid */}
          <div className="mt-6 space-y-6">
            {/* Group 1: Thông tin liên hệ & tài khoản */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Thông tin tài khoản &amp; Liên hệ
              </h4>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                  <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="text-xs">
                    <p className="text-zinc-400">Email đăng nhập</p>
                    <p className="font-semibold text-zinc-800 break-all">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                  <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="text-xs">
                    <p className="text-zinc-400">Số điện thoại</p>
                    <p className="font-semibold text-zinc-800">
                      {student.soDienThoai || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                  <User className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="text-xs">
                    <p className="text-zinc-400">Giới tính &amp; Ngày sinh</p>
                    <p className="font-semibold text-zinc-800">
                      {student.gioiTinh || 'Chưa rõ'} • {student.ngaySinh || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                  <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="text-xs">
                    <p className="text-zinc-400">Địa chỉ cư trú</p>
                    <p className="font-semibold text-zinc-800 truncate" title={student.diaChi || ''}>
                      {student.diaChi || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2: Thông tin CLB & Tập luyện */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Thông tin học viên &amp; CLB Karate HaUI
              </h4>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                  <Calendar className="h-4 w-4 text-red-700 shrink-0" />
                  <div className="text-xs">
                    <p className="text-zinc-400">Ngày nhập môn</p>
                    <p className="font-semibold text-zinc-800">
                      {student.ngayThamGia || 'Chưa ghi nhận'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                  <Shield className="h-4 w-4 text-red-700 shrink-0" />
                  <div className="text-xs">
                    <p className="text-zinc-400">Vai trò hệ thống</p>
                    <p className="font-semibold text-zinc-800">
                      Học viên học viên (hoc_vien)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 sm:col-span-2">
                  <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="text-xs">
                    <p className="text-zinc-400">Thời gian tạo hồ sơ</p>
                    <p className="font-semibold text-zinc-800">
                      {student.ngayTao || 'Hệ thống SQL Server'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 3: Ghi chú */}
            {student.ghiChu && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Ghi chú chuyên môn
                </h4>
                <div className="mt-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-700 leading-relaxed">
                  {student.ghiChu}
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-sky-400 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-200/50 hover:from-pink-500 hover:to-sky-500 transition-all cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
