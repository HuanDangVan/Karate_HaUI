import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getCoachSchedules,
    validateCoachScheduleClass,
    createSchedule,
} from '@/lib/schedule-service';
import type { CreateScheduleInput } from '@/types/schedule';

const VALID_STATUSES = [
    'da_len_lich',
    'da_hoan_thanh',
    'da_huy',
];

export async function GET(request: NextRequest) {
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
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 },
            );
        }

        const params = request.nextUrl.searchParams;

        const search = params.get('search') || undefined;
        const status = params.get('status') || undefined;
        const maLopValue = params.get('maLop');
        const fromDate = params.get('fromDate') || undefined;
        const toDate = params.get('toDate') || undefined;

        const maLop = maLopValue ? Number(maLopValue) : undefined;

        if (maLop !== undefined && (!Number.isInteger(maLop) || maLop <= 0)) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 },
            );
        }

        const data = await getCoachSchedules(session.userId, {
            search,
            status,
            maLop,
            fromDate,
            toDate,
        });

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('GET /api/coach/schedule error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể tải lịch tập.',
            },
            { status: 500 },
        );
    }
}

// HLV thêm lịch tập cho lớp mình phụ trách
export async function POST(request: NextRequest) {
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

        // Chỉ được tạo lịch cho lớp HLV đang phụ trách
        await validateCoachScheduleClass(session.userId, maLop);

        const input: CreateScheduleInput = {
            maLop,
            ngayTap,
            gioBatDau,
            gioKetThuc,
            diaDiem: body.diaDiem || undefined,
            noiDung: body.noiDung || undefined,
            trangThai,
        };

        const data = await createSchedule(input);

        return NextResponse.json(
            {
                success: true,
                message: 'Thêm lịch tập thành công.',
                data,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/coach/schedule error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể thêm lịch tập.',
            },
            { status: 500 },
        );
    }
}