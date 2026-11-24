import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getCoachClassById } from '@/lib/coach-class-service';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _request: NextRequest,
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
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 },
            );
        }

        const { id } = await context.params;
        const maLop = Number(id);

        if (!Number.isInteger(maLop) || maLop <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 },
            );
        }

        const data = await getCoachClassById(session.userId, maLop);

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Không tìm thấy lớp học hoặc bạn không được phân công lớp này.',
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('GET /api/coach/classes/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể tải thông tin lớp học.',
            },
            { status: 500 },
        );
    }
}