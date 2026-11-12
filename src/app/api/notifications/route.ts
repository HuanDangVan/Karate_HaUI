import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    createNotification,
    getAllNotifications,
    NotificationRecipientType,
} from '@/lib/notification-service';

// GET: Lấy danh sách thông báo
export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { message: 'Bạn không có quyền thực hiện chức năng này.' },
                { status: 403 }
            );
        }

        const notifications = await getAllNotifications();

        return NextResponse.json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách thông báo:', error);

        return NextResponse.json(
            { message: 'Không thể lấy danh sách thông báo.' },
            { status: 500 }
        );
    }
}

// POST: Tạo và gửi thông báo
export async function POST(request: Request) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { message: 'Bạn không có quyền thực hiện chức năng này.' },
                { status: 403 }
            );
        }

        const body = await request.json();

        const { tieuDe, noiDung, loaiNguoiNhan, danhSachTaiKhoan } = body;

        if (
            typeof tieuDe !== 'string' ||
            typeof noiDung !== 'string' ||
            typeof loaiNguoiNhan !== 'string'
        ) {
            return NextResponse.json(
                { message: 'Dữ liệu thông báo không hợp lệ.' },
                { status: 400 }
            );
        }

        const validRecipientTypes: NotificationRecipientType[] = [
            'hoc_vien',
            'huan_luyen_vien',
            'tat_ca',
            'chon_tai_khoan',
        ];

        if (
            !validRecipientTypes.includes(
                loaiNguoiNhan as NotificationRecipientType
            )
        ) {
            return NextResponse.json(
                { message: 'Loại người nhận không hợp lệ.' },
                { status: 400 }
            );
        }

        if (
            danhSachTaiKhoan !== undefined &&
            !Array.isArray(danhSachTaiKhoan)
        ) {
            return NextResponse.json(
                { message: 'Danh sách tài khoản không hợp lệ.' },
                { status: 400 }
            );
        }

        const maThongBao = await createNotification({
            tieuDe,
            noiDung,
            nguoiTao: session.userId,
            loaiNguoiNhan: loaiNguoiNhan as NotificationRecipientType,
            danhSachTaiKhoan,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Tạo và gửi thông báo thành công.',
                data: { maThongBao },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Lỗi tạo thông báo:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'Không thể tạo thông báo.';

        return NextResponse.json(
            { message },
            { status: 400 }
        );
    }
}