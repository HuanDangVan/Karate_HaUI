
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getAllClasses,
    getAvailableCoaches,
    createClass,
} from '@/lib/class-service';
import { CreateClassInput, ClassStatus } from '@/types/class';

const VALID_STATUSES: ClassStatus[] = [
    'hoat_dong',
    'tam_dung',
    'ngung_hoat_dong',
];

/**
 * GET /api/classes
 * Lấy danh sách lớp học và huấn luyện viên
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

        const [classes, coaches] = await Promise.all([
            getAllClasses({ search, status }),
            getAvailableCoaches(),
        ]);

        return NextResponse.json({
            success: true,
            data: classes,
            coaches,
            total: classes.length,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Lỗi máy chủ khi lấy danh sách lớp học.',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/classes
 * Thêm lớp học mới
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Yêu cầu quyền Quản trị viên để thêm lớp học.' },
                { status: 403 }
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
            donGiaMoiBuoi,
            trangThai,
        } = body;

        if (typeof maSoLop !== 'string' || !maSoLop.trim()) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không được để trống.' },
                { status: 400 }
            );
        }

        if (typeof tenLop !== 'string' || !tenLop.trim()) {
            return NextResponse.json(
                { success: false, message: 'Tên lớp không được để trống.' },
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
                { success: false, message: 'Đơn giá mỗi buổi phải là số không âm.' },
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

        const inputData: CreateClassInput = {
            maSoLop: maSoLop.trim().toUpperCase(),
            tenLop: tenLop.trim(),
            maHuanLuyenVien:
                maHuanLuyenVien == null ? null : Number(maHuanLuyenVien),
            moTa: typeof moTa === 'string' ? moTa.trim() || undefined : undefined,
            capDo: typeof capDo === 'string' ? capDo.trim() || undefined : undefined,
            siSoToiDa: Number(siSoToiDa),
            donGiaMoiBuoi: donGia,
            trangThai: trangThai || 'hoat_dong',
        };

        const newClass = await createClass(inputData);

        return NextResponse.json(
            {
                success: true,
                message: 'Thêm lớp học mới thành công!',
                data: newClass,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Lỗi khi thêm lớp học:', error);

        const errorMessage =
            error instanceof Error ? error.message : 'Lỗi hệ thống';

        const isConflict =
            errorMessage.includes('đã tồn tại') ||
            errorMessage.includes('đã được sử dụng');

        const isBadRequest =
            errorMessage.includes('không được để trống') ||
            errorMessage.includes('không tồn tại') ||
            errorMessage.includes('không hoạt động') ||
            errorMessage.includes('phải là số nguyên') ||
            errorMessage.includes('Đơn giá mỗi buổi');

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: isConflict ? 409 : isBadRequest ? 400 : 500 }
        );
    }
}
