
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getClassById,
    updateClass,
    updateClassStatus,
} from '@/lib/class-service';
import { UpdateClassInput, ClassStatus } from '@/types/class';

type RouteContext = {
    params: Promise<{ id: string }>;
};

const VALID_STATUSES: ClassStatus[] = [
    'hoat_dong',
    'tam_dung',
    'ngung_hoat_dong',
];

function parseId(id: string): number | null {
    const value = Number(id);
    return Number.isInteger(value) && value > 0 ? value : null;
}

/**
 * GET /api/classes/[id]
 * Xem chi tiết lớp học
 */
export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Yêu cầu quyền Quản trị viên để truy cập.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const maLop = parseId(id);

        if (!maLop) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const classItem = await getClassById(maLop);

        if (!classItem) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy lớp học.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: classItem,
        });
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết lớp học:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Lỗi máy chủ khi lấy chi tiết lớp học.',
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/classes/[id]
 * Cập nhật thông tin lớp học
 */
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Yêu cầu quyền Quản trị viên để sửa lớp học.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const maLop = parseId(id);

        if (!maLop) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const existing = await getClassById(maLop);

        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy lớp học.' },
                { status: 404 }
            );
        }

        const body = await request.json();

        const {
            maSoLop,
            tenLop,
            maHuanLuyenVien,
            moTa,
            capDo,
            siSoToiDa,
            trangThai,
            donGiaMoiBuoi,
        } = body;

        if (
            typeof maSoLop !== 'string' ||
            !maSoLop.trim() ||
            typeof tenLop !== 'string' ||
            !tenLop.trim()
        ) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp và tên lớp không được để trống.' },
                { status: 400 }
            );
        }

        if (
            siSoToiDa === undefined ||
            !Number.isInteger(Number(siSoToiDa)) ||
            Number(siSoToiDa) < 1
        ) {
            return NextResponse.json(
                { success: false, message: 'Sĩ số tối đa phải là số nguyên lớn hơn 0.' },
                { status: 400 }
            );
        }

        const donGia = Number(donGiaMoiBuoi);

        if (
            donGiaMoiBuoi === undefined ||
            donGiaMoiBuoi === null ||
            donGiaMoiBuoi === '' ||
            !Number.isFinite(donGia) ||
            donGia < 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Đơn giá mỗi buổi phải là số không âm.',
                },
                { status: 400 }
            );
        }

        if (
            maHuanLuyenVien !== undefined &&
            maHuanLuyenVien !== null &&
            (!Number.isInteger(Number(maHuanLuyenVien)) ||
                Number(maHuanLuyenVien) < 1)
        ) {
            return NextResponse.json(
                { success: false, message: 'Mã huấn luyện viên không hợp lệ.' },
                { status: 400 }
            );
        }

        if (trangThai && !VALID_STATUSES.includes(trangThai)) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái lớp học không hợp lệ.' },
                { status: 400 }
            );
        }

        const inputData: UpdateClassInput = {
            maSoLop: maSoLop.trim().toUpperCase(),
            tenLop: tenLop.trim(),
            maHuanLuyenVien:
                maHuanLuyenVien == null ? null : Number(maHuanLuyenVien),
            moTa: typeof moTa === 'string' ? moTa.trim() || undefined : undefined,
            capDo: typeof capDo === 'string' ? capDo.trim() || undefined : undefined,
            siSoToiDa: Number(siSoToiDa),
            donGiaMoiBuoi: donGia,
            trangThai: trangThai || existing.trangThai,
        };

        const updatedClass = await updateClass(maLop, inputData);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật lớp học thành công!',
            data: updatedClass,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật lớp học:', error);

        const errorMessage =
            error instanceof Error ? error.message : 'Lỗi hệ thống';

        const isConflict =
            errorMessage.includes('đã được sử dụng') ||
            errorMessage.includes('đã tồn tại');

        const isBadRequest =
            errorMessage.includes('không được để trống') ||
            errorMessage.includes('không tồn tại') ||
            errorMessage.includes('không hoạt động') ||
            errorMessage.includes('phải là số nguyên') ||
            errorMessage.includes('không được nhỏ hơn') ||
            errorMessage.includes('Đơn giá mỗi buổi');

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: isConflict ? 409 : isBadRequest ? 400 : 500 }
        );
    }
}

/**
 * PATCH /api/classes/[id]
 * Cập nhật trạng thái lớp học
 */
export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Yêu cầu quyền Quản trị viên để đổi trạng thái lớp học.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const maLop = parseId(id);

        if (!maLop) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { trangThai } = body;

        if (!VALID_STATUSES.includes(trangThai)) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái lớp học không hợp lệ.' },
                { status: 400 }
            );
        }

        const updatedClass = await updateClassStatus(
            maLop,
            trangThai
        );

        return NextResponse.json({
            success: true,
            message: 'Cập nhật trạng thái lớp học thành công!',
            data: updatedClass,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái lớp học:', error);

        const errorMessage =
            error instanceof Error ? error.message : 'Lỗi hệ thống';

        return NextResponse.json(
            {
                success: false,
                message: errorMessage,
            },
            { status: errorMessage.includes('không tồn tại') ? 404 : 500 }
        );
    }
}
