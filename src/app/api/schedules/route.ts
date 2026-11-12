
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getAllSchedules,
    getAvailableScheduleClasses,
    createSchedule,
} from '@/lib/schedule-service';
import type { CreateScheduleInput, ScheduleStatus } from '@/types/schedule';

const VALID_STATUSES: ScheduleStatus[] = [
    'da_len_lich',
    'da_hoan_thanh',
    'da_huy',
];

export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const params = request.nextUrl.searchParams;

        const search = params.get('search') || undefined;
        const status = params.get('status') || undefined;
        const maLopParam = params.get('maLop');
        const fromDate = params.get('fromDate') || undefined;
        const toDate = params.get('toDate') || undefined;

        const maLop = maLopParam ? Number(maLopParam) : undefined;

        if (maLopParam && (!Number.isInteger(maLop) || maLop! <= 0)) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const [schedules, classes] = await Promise.all([
            getAllSchedules({ search, status, maLop, fromDate, toDate }),
            getAvailableScheduleClasses(),
        ]);

        return NextResponse.json({
            success: true,
            data: schedules,
            classes,
            total: schedules.length,
        });
    } catch (error) {
        console.error('GET /api/schedules error:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể tải danh sách lịch tập.' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 }
            );
        }

        const body = await request.json();

        const {
            maLop,
            ngayTap,
            gioBatDau,
            gioKetThuc,
            diaDiem,
            noiDung,
            trangThai,
        } = body;

        if (
            !Number.isInteger(Number(maLop)) ||
            Number(maLop) <= 0 ||
            !ngayTap ||
            !gioBatDau ||
            !gioKetThuc
        ) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' },
                { status: 400 }
            );
        }

        if (trangThai && !VALID_STATUSES.includes(trangThai)) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái lịch tập không hợp lệ.' },
                { status: 400 }
            );
        }

        const input: CreateScheduleInput = {
            maLop: Number(maLop),
            ngayTap,
            gioBatDau,
            gioKetThuc,
            diaDiem,
            noiDung,
            trangThai: trangThai || 'da_len_lich',
        };

        const schedule = await createSchedule(input);

        return NextResponse.json(
            {
                success: true,
                data: schedule,
                message: 'Thêm lịch tập thành công.',
            },
            { status: 201 }
        );
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Không thể thêm lịch tập.';

        const status = message.includes('đã tồn tại') ? 409 : 400;

        console.error('POST /api/schedules error:', error);

        return NextResponse.json(
            { success: false, message },
            { status }
        );
    }
}
