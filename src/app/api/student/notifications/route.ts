
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getMyNotifications,
    markNotificationAsRead,
} from '@/lib/notification-service';

// GET: Lấy danh sách thông báo của học viên đang đăng nhập
export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn cần đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'hoc_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const data = await getMyNotifications(session.userId);

        const soChuaDoc = data.filter((item) => !item.daDoc).length;

        return NextResponse.json({
            success: true,
            data,
            summary: {
                tongThongBao: data.length,
                soChuaDoc,
                soDaDoc: data.length - soChuaDoc,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy thông báo học viên:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể tải danh sách thông báo.' },
            { status: 500 }
        );
    }
}

// POST: Đánh dấu thông báo là đã đọc
export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn cần đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'hoc_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const maThongBao = Number(body.maThongBao);

        if (!Number.isInteger(maThongBao) || maThongBao <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã thông báo không hợp lệ.' },
                { status: 400 }
            );
        }

        const updated = await markNotificationAsRead(
            maThongBao,
            session.userId
        );

        if (!updated) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Thông báo không tồn tại hoặc đã được đọc.',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Đã đánh dấu thông báo là đã đọc.',
        });
    } catch (error) {
        console.error('Lỗi đánh dấu thông báo đã đọc:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông báo.' },
            { status: 500 }
        );
    }
}
