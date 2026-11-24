import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getCoachDashboardData } from '@/lib/coach-portal-service';

export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Bạn chưa đăng nhập.',
                },
                { status: 401 },
            );
        }

        if (session.role !== 'huan_luyen_vien') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Bạn không có quyền truy cập.',
                },
                { status: 403 },
            );
        }

        const data = await getCoachDashboardData(session.userId);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('GET /api/coach/dashboard error:', error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể tải dữ liệu tổng quan.',
            },
            { status: 500 },
        );
    }
}