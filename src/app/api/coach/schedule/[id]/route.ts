import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    validateCoachSchedule,
    validateCoachScheduleClass,
    updateSchedule,
    updateScheduleStatus,
} from '@/lib/schedule-service';
import type { UpdateScheduleInput } from '@/types/schedule';

const VALID_STATUSES = [
    'da_len_lich',
    'da_hoan_thanh',
    'da_huy',
];

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

// HLV sửa lịch tập
export async function PUT(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 },
            );
        }

        if (session.role !== 'huan_luyen_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 },
            );
        }

        const { id } = await context.params;
        const maLichTap = Number(id);

        if (!Number.isInteger(maLichTap) || maLichTap <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã lịch tập không hợp lệ.' },
                { status: 400 },
            );
        }

        // Kiểm tra lịch có thuộc lớp HLV phụ trách không
        await validateCoachSchedule(session.userId, maLichTap);

        const body = await request.json();

        const maLop = Number(body.maLop);
        const ngayTap = body.ngayTap;
        const gioBatDau = body.gioBatDau;
        const gioKetThuc = body.gioKetThuc;

        if (
            !Number.isInteger(maLop) ||
            maLop <= 0 ||
            !ngayTap ||
            !gioBatDau ||
            !gioKetThuc
        ) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng nhập đầy đủ thông tin lịch tập.' },
                { status: 400 },
            );
        }

        if (gioBatDau >= gioKetThuc) {
            return NextResponse.json(
                { success: false, message: 'Giờ kết thúc phải sau giờ bắt đầu.' },
                { status: 400 },
            );
        }

        const trangThai = body.trangThai || 'da_len_lich';

        if (!VALID_STATUSES.includes(trangThai)) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái lịch tập không hợp lệ.' },
                { status: 400 },
            );
        }

        // Không được chuyển lịch sang lớp HLV khác phụ trách
        await validateCoachScheduleClass(session.userId, maLop);

        const input: UpdateScheduleInput = {
            maLop,
            ngayTap,
            gioBatDau,
            gioKetThuc,
            diaDiem: body.diaDiem || undefined,
            noiDung: body.noiDung || undefined,
            trangThai,
        };

        const data = await updateSchedule(maLichTap, input);

        return NextResponse.json({
            success: true,
            message: 'Cập nhật lịch tập thành công.',
            data,
        });
    } catch (error) {
        console.error('PUT /api/coach/schedule/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể cập nhật lịch tập.',
            },
            { status: 500 },
        );
    }
}

// HLV chỉ được hủy lịch, không được xóa
export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 },
            );
        }

        if (session.role !== 'huan_luyen_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 },
            );
        }

        const { id } = await context.params;
        const maLichTap = Number(id);

        if (!Number.isInteger(maLichTap) || maLichTap <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã lịch tập không hợp lệ.' },
                { status: 400 },
            );
        }

        const body = await request.json();

        if (body.trangThai !== 'da_huy') {
            return NextResponse.json(
                { success: false, message: 'HLV chỉ được phép chuyển lịch sang trạng thái đã hủy.' },
                { status: 400 },
            );
        }

        await validateCoachSchedule(session.userId, maLichTap);

        await updateScheduleStatus(maLichTap, 'da_huy');

        return NextResponse.json({
            success: true,
            message: 'Hủy lịch tập thành công.',
        });
    } catch (error) {
        console.error('PATCH /api/coach/schedule/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể hủy lịch tập.',
            },
            { status: 500 },
        );
    }
}