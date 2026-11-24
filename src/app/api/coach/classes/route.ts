import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getCoachClasses } from '@/lib/coach-class-service';

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

        const search = request.nextUrl.searchParams.get('search') || undefined;
        const data = await getCoachClasses(session.userId, search);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('GET /api/coach/classes error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể tải danh sách lớp học.',
            },
            { status: 500 },
        );
    }
}