import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getNotificationById,
    updateNotification,
    deleteNotification,
    markNotificationAsRead,
} from '@/lib/notification-service';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// Lấy chi tiết thông báo
export async function GET(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const maThongBao = Number(id);

        if (!Number.isInteger(maThongBao) || maThongBao <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã thông báo không hợp lệ.' },
                { status: 400 }
            );
        }

        const notification = await getNotificationById(maThongBao);

        if (!notification) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thông báo.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết thông báo:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể lấy chi tiết thông báo.' },
            { status: 500 }
        );
    }
}

// Cập nhật thông báo
export async function PUT(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const maThongBao = Number(id);

        if (!Number.isInteger(maThongBao) || maThongBao <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã thông báo không hợp lệ.' },
                { status: 400 }
            );
        }

        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: 'Dữ liệu gửi lên không hợp lệ.' },
                { status: 400 }
            );
        }

        const { tieuDe, noiDung } = body;

        if (
            typeof tieuDe !== 'string' ||
            typeof noiDung !== 'string' ||
            !tieuDe.trim() ||
            !noiDung.trim()
        ) {
            return NextResponse.json(
                { success: false, message: 'Tiêu đề và nội dung không được để trống.' },
                { status: 400 }
            );
        }

        if (tieuDe.trim().length > 100) {
            return NextResponse.json(
                { success: false, message: 'Tiêu đề không được vượt quá 100 ký tự.' },
                { status: 400 }
            );
        }

        const updated = await updateNotification(
            maThongBao,
            tieuDe,
            noiDung
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thông báo cần sửa.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Cập nhật thông báo thành công.',
        });
    } catch (error) {
        console.error('Lỗi cập nhật thông báo:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông báo.' },
            { status: 500 }
        );
    }
}

// Xóa thông báo
export async function DELETE(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const maThongBao = Number(id);

        if (!Number.isInteger(maThongBao) || maThongBao <= 0) {
            return NextResponse.json(
                { success: false, message: 'Mã thông báo không hợp lệ.' },
                { status: 400 }
            );
        }

        const deleted = await deleteNotification(maThongBao);

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thông báo cần xóa.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Xóa thông báo thành công.',
        });
    } catch (error) {
        console.error('Lỗi xóa thông báo:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể xóa thông báo.' },
            { status: 500 }
        );
    }
}
// Đánh dấu thông báo đã đọc
export async function PATCH(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const maThongBao = Number(id);
        const maTaiKhoan = Number(session.userId);

        if (
            !Number.isInteger(maThongBao) ||
            maThongBao <= 0 ||
            !Number.isInteger(maTaiKhoan) ||
            maTaiKhoan <= 0
        ) {
            return NextResponse.json(
                { success: false, message: 'Thông tin không hợp lệ.' },
                { status: 400 }
            );
        }

        const updated = await markNotificationAsRead(
            maThongBao,
            maTaiKhoan
        );

        if (!updated) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Không tìm thấy người nhận hoặc thông báo đã được đọc.',
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
            { success: false, message: 'Không thể cập nhật trạng thái đọc.' },
            { status: 500 }
        );
    }
}