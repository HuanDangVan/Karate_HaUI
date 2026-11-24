
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getAttendanceSessions,
    getAttendanceStudents,
    saveAttendance,
} from '@/lib/attendance-service';
import type { SaveAttendanceInput } from '@/types/attendance';

const ALLOWED_ROLES = ['quan_tri_vien', 'huan_luyen_vien'];

export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session || !ALLOWED_ROLES.includes(session.role)) {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 },
            );
        }

        const maLichTapParam =
            request.nextUrl.searchParams.get('maLichTap');

        // Chưa chọn buổi tập: lấy danh sách buổi tập
        if (!maLichTapParam) {
            const sessions = await getAttendanceSessions(
                session.role,
                session.userId,
            );

            return NextResponse.json({
                success: true,
                sessions,
            });
        }

        const maLichTap = Number(maLichTapParam);

        if (!Number.isInteger(maLichTap) || maLichTap <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã lịch tập không hợp lệ.' },
                { status: 400 },
            );
        }

        // Lấy danh sách học viên của buổi tập
        const students = await getAttendanceStudents(
            maLichTap,
            session.role,
            session.userId,
        );

        return NextResponse.json({
            success: true,
            students,
        });

    } catch (error) {
        console.error('GET /api/attendance error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải dữ liệu điểm danh.',
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session || !ALLOWED_ROLES.includes(session.role)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Bạn không có quyền điểm danh.',
                },
                { status: 403 },
            );
        }

        const body: unknown = await request.json();

        if (
            !body ||
            typeof body !== 'object' ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Dữ liệu điểm danh không hợp lệ.',
                },
                { status: 400 },
            );
        }

        const data = body as Record<string, unknown>;
        const maLichTap = Number(data.maLichTap);

        if (
            !Number.isInteger(maLichTap) ||
            maLichTap <= 0 ||
            !Array.isArray(data.danhSach)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Dữ liệu điểm danh không hợp lệ.',
                },
                { status: 400 },
            );
        }

        const input: SaveAttendanceInput = {
            maLichTap,
            danhSach: data.danhSach as SaveAttendanceInput['danhSach'],
        };

        await saveAttendance(
            input,
            session.userId,
            session.role,
        );

        return NextResponse.json({
            success: true,
            message: 'Lưu điểm danh thành công.',
        });

    } catch (error) {
        console.error('POST /api/attendance error:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'Không thể lưu kết quả điểm danh.';

        return NextResponse.json(
            {
                success: false,
                message,
            },
            { status: 500 },
        );
    }
}
