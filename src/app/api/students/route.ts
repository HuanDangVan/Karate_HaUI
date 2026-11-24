import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
  getAllStudents,
  createStudent,
  generateNextMaSoHocVien,
} from '@/lib/student-service';
import { CreateStudentInput } from '@/types/student';

/**
 * GET /api/students
 * Lấy danh sách học viên (chỉ dành cho Quản trị viên)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'quan_tri_vien') {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu quyền Quản trị viên để truy cập.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const students = await getAllStudents({ search, status });
    const nextCode = await generateNextMaSoHocVien();

    return NextResponse.json({
      success: true,
      data: students,
      total: students.length,
      suggestedCode: nextCode,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách học viên:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách học viên.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Thêm mới học viên (chỉ dành cho Quản trị viên)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'quan_tri_vien') {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu quyền Quản trị viên để thêm học viên.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      hoTen,
      email,
      matKhau,
      maSoHocVien,
      soDienThoai,
      diaChi,
      ngaySinh,
      gioiTinh,
      ngayThamGia,
      ghiChu,
      trangThai,
    } = body;

    // Validate bắt buộc
    if (!hoTen?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Họ và tên học viên không được để trống.' },
        { status: 400 }
      );
    }

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email học viên không hợp lệ.' },
        { status: 400 }
      );
    }

    if (!matKhau || matKhau.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu khởi tạo phải có ít nhất 6 ký tự.' },
        { status: 400 }
      );
    }

    if (!maSoHocVien?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Mã số học viên không được để trống.' },
        { status: 400 }
      );
    }

    const inputData: CreateStudentInput = {
      hoTen: hoTen.trim(),
      email: email.trim(),
      matKhau,
      maSoHocVien: maSoHocVien.trim().toUpperCase(),
      soDienThoai: soDienThoai?.trim() || undefined,
      diaChi: diaChi?.trim() || undefined,
      ngaySinh: ngaySinh || undefined,
      gioiTinh: gioiTinh?.trim() || undefined,
      ngayThamGia: ngayThamGia || undefined,
      ghiChu: ghiChu?.trim() || undefined,
      trangThai: trangThai || 'hoat_dong',
    };

    const newStudent = await createStudent(inputData);

    return NextResponse.json(
      {
        success: true,
        message: 'Thêm học viên mới thành công!',
        data: newStudent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lỗi khi thêm học viên:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi hệ thống';
    const isConflict = errorMessage.includes('đã được sử dụng') || errorMessage.includes('đã tồn tại');

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}
