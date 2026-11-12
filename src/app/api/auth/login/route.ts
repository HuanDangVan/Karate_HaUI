import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/user-service';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Kiểm tra đầu vào
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.',
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 2. Tìm tài khoản trong database SQL Server KarateClub
    const user = await findUserByEmail(trimmedEmail);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email hoặc mật khẩu không chính xác.',
        },
        { status: 401 }
      );
    }

    // 3. So sánh mật khẩu bằng bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.MatKhauMaHoa);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email hoặc mật khẩu không chính xác.',
        },
        { status: 401 }
      );
    }

    // 4. Kiểm tra trạng thái tài khoản (Chỉ cho phép khi hoat_dong)
    if (user.TrangThai === 'bi_khoa') {
      return NextResponse.json(
        {
          success: false,
          message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Ban quản trị CLB.',
        },
        { status: 403 }
      );
    }

    if (user.TrangThai !== 'hoat_dong') {
      return NextResponse.json(
        {
          success: false,
          message: 'Tài khoản hiện đang tạm ngừng hoạt động.',
        },
        { status: 403 }
      );
    }

    // 5. Xác định điều hướng theo vai trò (Phân quyền 3 vai trò)
    let redirectUrl = '/';
    const role: UserRole = user.VaiTro;

    if (role === 'quan_tri_vien') {
      redirectUrl = '/';
    } else if (role === 'huan_luyen_vien') {
      redirectUrl = '/coach';
    } else if (role === 'hoc_vien') {
      redirectUrl = '/student';
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Vai trò tài khoản không hợp lệ trong hệ thống.',
        },
        { status: 403 }
      );
    }

    // 6. Tạo JWT token an toàn
    const sessionToken = await signToken({
      userId: user.MaTaiKhoan,
      email: user.Email,
      name: user.HoTen,
      role: user.VaiTro,
    });

    // 7. Thiết lập HttpOnly Cookie bảo mật
    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      redirectUrl,
      user: {
        id: user.MaTaiKhoan,
        email: user.Email,
        name: user.HoTen,
        role: user.VaiTro,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });

    return response;
  } catch (error) {
    console.error('Lỗi trong quá trình đăng nhập:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ nội bộ khi xử lý đăng nhập.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
