
import { NextRequest, NextResponse } from 'next/server';
import {
    getCurrentSession,
    signToken,
    AUTH_COOKIE_NAME,
} from '@/lib/auth';
import { getConnection, sql } from '@/lib/db';
import {
    findUserById,
    updateUserProfile,
} from '@/lib/user-service';

// GET: Lấy thông tin cá nhân của tài khoản đang đăng nhập
export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        const user = await findUserById(Number(session.userId));

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy tài khoản.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                userId: user.MaTaiKhoan,
                hoTen: user.HoTen,
                email: user.Email,
                vaiTro: user.VaiTro,
                trangThai: user.TrangThai,
                anhDaiDien: user.AnhDaiDien,
                soDienThoai: user.SoDienThoai,
                diaChi: user.DiaChi,
                ngaySinh: user.NgaySinh,
                gioiTinh: user.GioiTinh,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin cá nhân:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể lấy thông tin cá nhân.' },
            { status: 500 }
        );
    }
}

// PATCH: Cập nhật thông tin cá nhân
export async function PATCH(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const {
            hoTen,
            email,
            soDienThoai,
            diaChi,
            ngaySinh,
            gioiTinh,
        } = body;

        if (
            typeof hoTen !== 'string' ||
            !hoTen.trim() ||
            typeof email !== 'string' ||
            !email.trim()
        ) {
            return NextResponse.json(
                { success: false, message: 'Họ tên và email không được để trống.' },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return NextResponse.json(
                { success: false, message: 'Email không đúng định dạng.' },
                { status: 400 }
            );
        }

        if (hoTen.trim().length > 100 || cleanEmail.length > 255) {
            return NextResponse.json(
                { success: false, message: 'Họ tên hoặc email vượt quá độ dài cho phép.' },
                { status: 400 }
            );
        }

        if (soDienThoai && typeof soDienThoai !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Số điện thoại không hợp lệ.' },
                { status: 400 }
            );
        }

        // Kiểm tra email đã được tài khoản khác sử dụng chưa
        const pool = await getConnection();

        const emailCheck = await pool.request()
            .input('email', sql.VarChar(255), cleanEmail)
            .input('id', sql.Int, Number(session.userId))
            .query(`
                SELECT TOP 1 MaTaiKhoan
                FROM TaiKhoan
                WHERE LOWER(LTRIM(RTRIM(Email))) = @email
                  AND MaTaiKhoan <> @id
            `);

        if (emailCheck.recordset.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Email này đã được tài khoản khác sử dụng.' },
                { status: 409 }
            );
        }

        const updated = await updateUserProfile({
            id: Number(session.userId),
            hoTen: hoTen.trim(),
            email: cleanEmail,
            soDienThoai: soDienThoai?.trim() || '',
            diaChi: typeof diaChi === 'string' ? diaChi : '',
            ngaySinh: typeof ngaySinh === 'string' && ngaySinh
                ? ngaySinh
                : null,
            gioiTinh: typeof gioiTinh === 'string' && gioiTinh
                ? gioiTinh
                : null,
        });

        if (!updated) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy tài khoản cần cập nhật.' },
                { status: 404 }
            );
        }

        // Tạo lại JWT để cập nhật họ tên và email trong phiên đăng nhập
        const token = await signToken({
            userId: Number(session.userId),
            email: cleanEmail,
            name: hoTen.trim(),
            role: session.role,
        });

        const response = NextResponse.json({
            success: true,
            message: 'Cập nhật thông tin cá nhân thành công.',
            user: {
                userId: Number(session.userId),
                name: hoTen.trim(),
                email: cleanEmail,
                role: session.role,
            },
        });

        response.cookies.set({
            name: AUTH_COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error('Lỗi cập nhật thông tin cá nhân:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin cá nhân.' },
            { status: 500 }
        );
    }
}
