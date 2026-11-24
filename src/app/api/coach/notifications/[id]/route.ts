import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { markNotificationAsRead } from '@/lib/notification-service';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
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

        const { id } = await context.params;
        const maThongBao = Number(id);

        if (!Number.isInteger(maThongBao) || maThongBao <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã thông báo không hợp lệ.' },
                { status: 400 }
            );
        }

        await markNotificationAsRead(maThongBao, session.userId);

        return NextResponse.json({
            success: true,
            message: 'Đã cập nhật trạng thái thông báo.',
        });
    } catch (error) {
        console.error('PATCH /api/coach/notifications error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể cập nhật thông báo.',
            },
            { status: 500 }
        );
    }
}