
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getScheduleById,
    updateSchedule,
    updateScheduleStatus,
} from '@/lib/schedule-service';
import type { ScheduleStatus, UpdateScheduleInput } from '@/types/schedule';

const VALID_STATUSES: ScheduleStatus[] = [
    'da_len_lich',
    'da_hoan_thanh',
    'da_huy',
];

type RouteContext = {
    params: Promise<{ id: string }>;
};

function parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const { id: rawId } = await context.params;
        const id = parseId(rawId);

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Mã lịch tập không hợp lệ.' },
                { status: 400 }
            );
        }

        const schedule = await getScheduleById(id);

        if (!schedule) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy lịch tập.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: schedule });
    } catch (error) {
        console.error('GET /api/schedules/[id] error:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể tải thông tin lịch tập.' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 }
            );
        }

        const { id: rawId } = await context.params;
        const id = parseId(rawId);

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Mã lịch tập không hợp lệ.' },
                { status: 400 }
            );
        }

        const existing = await getScheduleById(id);

        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy lịch tập.' },
                { status: 404 }
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

        const input: UpdateScheduleInput = {
            maLop: Number(maLop),
            ngayTap,
            gioBatDau,
            gioKetThuc,
            diaDiem,
            noiDung,
            trangThai: trangThai || existing.trangThai,
        };

        const schedule = await updateSchedule(id, input);

        return NextResponse.json({
            success: true,
            data: schedule,
            message: 'Cập nhật lịch tập thành công.',
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Không thể cập nhật lịch tập.';

        console.error('PUT /api/schedules/[id] error:', error);

        return NextResponse.json(
            { success: false, message },
            { status: 400 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 }
            );
        }

        const { id: rawId } = await context.params;
        const id = parseId(rawId);

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Mã lịch tập không hợp lệ.' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { trangThai } = body;

        if (!VALID_STATUSES.includes(trangThai)) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái lịch tập không hợp lệ.' },
                { status: 400 }
            );
        }

        const schedule = await updateScheduleStatus(id, trangThai);

        return NextResponse.json({
            success: true,
            data: schedule,
            message: 'Cập nhật trạng thái lịch tập thành công.',
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Không thể cập nhật trạng thái.';

        console.error('PATCH /api/schedules/[id] error:', error);

        return NextResponse.json(
            { success: false, message },
            { status: 400 }
        );
    }
}
