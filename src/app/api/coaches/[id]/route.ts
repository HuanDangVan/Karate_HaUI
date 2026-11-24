
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getCoachById,
    updateCoach,
    updateCoachStatus,
} from '@/lib/coach-service';
import { UpdateCoachInput, CoachStatus } from '@/types/coach';

type RouteContext = {
    params: Promise<{ id: string }>;
};

const VALID_STATUSES: CoachStatus[] = [
    'hoat_dong',
    'tam_dung',
    'ngung_hoat_dong',
];

async function checkAdmin() {
    const session = await getCurrentSession();

    if (!session || session.role !== 'quan_tri_vien') {
        return false;
    }

    return true;
}

function getValidId(id: string): number | null {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return null;
    }

    return parsedId;
}

/**
 * GET /api/coaches/[id]
 * Lấy thông tin chi tiết huấn luyện viên
 */
export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        if (!(await checkAdmin())) {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const coachId = getValidId(id);

        if (!coachId) {
            return NextResponse.json(
                { success: false, message: 'Mã huấn luyện viên không hợp lệ.' },
                { status: 400 }
            );
        }

        const coach = await getCoachById(coachId);

        if (!coach) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy huấn luyện viên.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: coach,
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin huấn luyện viên:', error);

        return NextResponse.json(
            { success: false, message: 'Lỗi máy chủ.' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/coaches/[id]
 * Cập nhật thông tin huấn luyện viên
 */
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        if (!(await checkAdmin())) {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền chỉnh sửa.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const coachId = getValidId(id);

        if (!coachId) {
            return NextResponse.json(
                { success: false, message: 'Mã huấn luyện viên không hợp lệ.' },
                { status: 400 }
            );
        }

        const existingCoach = await getCoachById(coachId);

        if (!existingCoach) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy huấn luyện viên.' },
                { status: 404 }
            );
        }

        const body = await request.json();

        const {
            hoTen,
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
                { success: false, message: 'Họ và tên không được để trống.' },
                { status: 400 }
            );
        }

        if (!maSoHuanLuyenVien?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Mã huấn luyện viên không được để trống.' },
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

        if (trangThai && !VALID_STATUSES.includes(trangThai)) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái không hợp lệ.' },
                { status: 400 }
            );
        }

        const inputData: UpdateCoachInput = {
            hoTen: hoTen.trim(),
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
            trangThai: trangThai || existingCoach.trangThai,
        };

        const updatedCoach = await updateCoach(coachId, inputData);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật huấn luyện viên thành công!',
            data: updatedCoach,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật huấn luyện viên:', error);

        const message =
            error instanceof Error ? error.message : 'Lỗi hệ thống';

        const isConflict =
            message.includes('đã được sử dụng') ||
            message.includes('đã tồn tại');

        return NextResponse.json(
            { success: false, message },
            { status: isConflict ? 409 : 500 }
        );
    }
}

/**
 * PATCH /api/coaches/[id]
 * Cập nhật trạng thái huấn luyện viên
 */
export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        if (!(await checkAdmin())) {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const coachId = getValidId(id);

        if (!coachId) {
            return NextResponse.json(
                { success: false, message: 'Mã huấn luyện viên không hợp lệ.' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { trangThai } = body;

        if (!VALID_STATUSES.includes(trangThai)) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái không hợp lệ.' },
                { status: 400 }
            );
        }

        const existingCoach = await getCoachById(coachId);

        if (!existingCoach) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy huấn luyện viên.' },
                { status: 404 }
            );
        }

        await updateCoachStatus(coachId, trangThai);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật trạng thái huấn luyện viên thành công!',
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái huấn luyện viên:', error);

        return NextResponse.json(
            { success: false, message: 'Lỗi máy chủ khi cập nhật trạng thái.' },
            { status: 500 }
        );
    }
}
