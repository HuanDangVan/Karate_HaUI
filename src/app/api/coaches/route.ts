
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getAllCoaches,
    createCoach,
    generateNextCoachCode,
} from '@/lib/coach-service';
import { CreateCoachInput } from '@/types/coach';

/**
 * GET /api/coaches
 * Lấy danh sách huấn luyện viên (chỉ dành cho Quản trị viên)
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

        const coaches = await getAllCoaches({ search, status });
        const nextCode = await generateNextCoachCode();

        return NextResponse.json({
            success: true,
            data: coaches,
            total: coaches.length,
            suggestedCode: nextCode,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách huấn luyện viên:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Lỗi máy chủ khi lấy danh sách huấn luyện viên.',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/coaches
 * Thêm mới huấn luyện viên (chỉ dành cho Quản trị viên)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Yêu cầu quyền Quản trị viên để thêm huấn luyện viên.' },
                { status: 403 }
            );
        }

        const body = await request.json();

        const {
            hoTen,
            email,
            matKhau,
            maSoHuanLuyenVien,
            soDienThoai,
            diaChi,
            ngaySinh,
            gioiTinh,
            chuyenMon,
            soNamKinhNghiem,
            ngayBatDau,
            trangThai,
        } = body;

        if (!hoTen?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Họ và tên huấn luyện viên không được để trống.' },
                { status: 400 }
            );
        }

        if (!email?.trim() || !email.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Email huấn luyện viên không hợp lệ.' },
                { status: 400 }
            );
        }

        if (!matKhau || matKhau.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu khởi tạo phải có ít nhất 6 ký tự.' },
                { status: 400 }
            );
        }

        if (!maSoHuanLuyenVien?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Mã số huấn luyện viên không được để trống.' },
                { status: 400 }
            );
        }

        if (
            soNamKinhNghiem !== undefined &&
            soNamKinhNghiem !== null &&
            (!Number.isInteger(Number(soNamKinhNghiem)) ||
                Number(soNamKinhNghiem) < 0)
        ) {
            return NextResponse.json(
                { success: false, message: 'Số năm kinh nghiệm không hợp lệ.' },
                { status: 400 }
            );
        }

        const inputData: CreateCoachInput = {
            hoTen: hoTen.trim(),
            email: email.trim(),
            matKhau,
            maSoHuanLuyenVien: maSoHuanLuyenVien.trim().toUpperCase(),
            soDienThoai: soDienThoai?.trim() || undefined,
            diaChi: diaChi?.trim() || undefined,
            ngaySinh: ngaySinh || undefined,
            gioiTinh: gioiTinh?.trim() || undefined,
            chuyenMon: chuyenMon?.trim() || undefined,
            soNamKinhNghiem:
                soNamKinhNghiem !== undefined && soNamKinhNghiem !== null
                    ? Number(soNamKinhNghiem)
                    : undefined,
            ngayBatDau: ngayBatDau || undefined,
            trangThai: trangThai || 'hoat_dong',
        };

        const newCoach = await createCoach(inputData);

        return NextResponse.json(
            {
                success: true,
                message: 'Thêm huấn luyện viên mới thành công!',
                data: newCoach,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Lỗi khi thêm huấn luyện viên:', error);

        const errorMessage =
            error instanceof Error ? error.message : 'Lỗi hệ thống';

        const isConflict =
            errorMessage.includes('đã được sử dụng') ||
            errorMessage.includes('đã tồn tại');

        return NextResponse.json(
            {
                success: false,
                message: errorMessage,
            },
            { status: isConflict ? 409 : 500 }
        );
    }
}
