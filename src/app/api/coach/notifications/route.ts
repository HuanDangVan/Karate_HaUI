import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getMyNotifications } from '@/lib/notification-service';

export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'huan_luyen_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const data = await getMyNotifications(session.userId);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('GET /api/coach/notifications error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể tải danh sách thông báo.',
            },
            { status: 500 }
        );
    }
}