
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentSession } from '@/lib/auth';
import { getConnection, sql } from '@/lib/db';

export async function PATCH(request: NextRequest) {
    try {
        // 1. Kiểm tra phiên đăng nhập
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        // 2. Chỉ cho phép quản trị viên đổi mật khẩu tại chức năng này
        if (session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện chức năng này.' },
                { status: 403 }
            );
        }

        // 3. Nhận dữ liệu từ giao diện
        const body = await request.json();

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = body;

        if (
            typeof currentPassword !== 'string' ||
            typeof newPassword !== 'string' ||
            typeof confirmPassword !== 'string' ||
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng nhập đầy đủ thông tin mật khẩu.' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu xác nhận không trùng khớp.' },
                { status: 400 }
            );
        }

        if (currentPassword === newPassword) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' },
                { status: 400 }
            );
        }

        // 4. Lấy mật khẩu đã mã hóa từ SQL Server
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, Number(session.userId))
            .query(`
        SELECT MatKhauMaHoa
        FROM TaiKhoan
        WHERE MaTaiKhoan = @id
          AND VaiTro = 'quan_tri_vien'
          AND TrangThai = 'hoat_dong'
      `);

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy tài khoản quản trị viên.' },
                { status: 404 }
            );
        }

        const hashedPassword = result.recordset[0].MatKhauMaHoa;

        // 5. Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            hashedPassword
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Mật khẩu hiện tại không chính xác.' },
                { status: 400 }
            );
        }

        // 6. Mã hóa mật khẩu mới
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // 7. Cập nhật mật khẩu vào SQL Server
        await pool.request()
            .input('id', sql.Int, Number(session.userId))
            .input('password', sql.VarChar(255), newHashedPassword)
            .query(`
        UPDATE TaiKhoan
        SET
          MatKhauMaHoa = @password,
          NgayCapNhat = GETDATE()
        WHERE MaTaiKhoan = @id
      `);

        return NextResponse.json({
            success: true,
            message: 'Đổi mật khẩu thành công.',
        });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể đổi mật khẩu. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}
