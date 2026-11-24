import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
  getStudentById,
  updateStudent,
  updateStudentStatus,
} from '@/lib/student-service';
import { UpdateStudentInput, StudentStatus } from '@/types/student';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/students/[id]
 * Xem chi tiết học viên
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'quan_tri_vien') {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu quyền Quản trị viên.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, message: 'Mã học viên không hợp lệ.' },
        { status: 400 }
      );
    }

    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy học viên.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin học viên:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi lấy thông tin học viên.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/students/[id]
 * Cập nhật thông tin học viên
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'quan_tri_vien') {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu quyền Quản trị viên.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, message: 'Mã học viên không hợp lệ.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      hoTen,
      maSoHocVien,
      soDienThoai,
      diaChi,
      ngaySinh,
      gioiTinh,
      ngayThamGia,
      ghiChu,
      trangThai,
    } = body;

    if (!hoTen?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Họ và tên không được để trống.' },
        { status: 400 }
      );
    }

    if (!maSoHocVien?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Mã số học viên không được để trống.' },
        { status: 400 }
      );
    }

    const updateData: UpdateStudentInput = {
      hoTen: hoTen.trim(),
      maSoHocVien: maSoHocVien.trim().toUpperCase(),
      soDienThoai: soDienThoai?.trim() || undefined,
      diaChi: diaChi?.trim() || undefined,
      ngaySinh: ngaySinh || undefined,
      gioiTinh: gioiTinh?.trim() || undefined,
      ngayThamGia: ngayThamGia || undefined,
      ghiChu: ghiChu?.trim() || undefined,
      trangThai: trangThai || undefined,
    };

    const updatedStudent = await updateStudent(studentId, updateData);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin học viên thành công!',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật học viên:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi hệ thống';
    const isConflict = errorMessage.includes('đã được dùng');

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}

/**
 * PATCH /api/students/[id]
 * Đổi trạng thái học viên
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'quan_tri_vien') {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu quyền Quản trị viên.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, message: 'Mã học viên không hợp lệ.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { trangThai } = body;

    const validStatuses: StudentStatus[] = ['hoat_dong', 'tam_dung', 'ngung_hoat_dong'];
    if (!trangThai || !validStatuses.includes(trangThai)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Trạng thái học viên không hợp lệ. Cho phép: hoat_dong, tam_dung, ngung_hoat_dong.',
        },
        { status: 400 }
      );
    }

    const updated = await updateStudentStatus(studentId, trangThai as StudentStatus);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái học viên thành công!',
      data: updated,
    });
  } catch (error) {
    console.error('Lỗi khi đổi trạng thái học viên:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi hệ thống khi cập nhật trạng thái.',
      },
      { status: 500 }
    );
  }
}
