
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getConnection, sql } from '@/lib/db';

export async function GET() {
    try {
        // Kiểm tra đăng nhập
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        // Chỉ huấn luyện viên được xem hồ sơ này
        if (session.role !== 'huan_luyen_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        // Lấy hồ sơ HLV theo tài khoản đang đăng nhập
        const pool = await getConnection();
        const request = pool.request();

        request.input('maTaiKhoan', sql.Int, Number(session.userId));

        const result = await request.query(`
            SELECT
                MaHuanLuyenVien AS maHuanLuyenVien,
                MaSoHuanLuyenVien AS maSoHuanLuyenVien,
                ChuyenMon AS chuyenMon,
                SoNamKinhNghiem AS soNamKinhNghiem,
                NgayBatDau AS ngayBatDau,
                TrangThai AS trangThai
            FROM HuanLuyenVien
            WHERE MaTaiKhoan = @maTaiKhoan
        `);

        if (result.recordset.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Không tìm thấy hồ sơ huấn luyện viên.'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            coach: result.recordset[0]
        });

    } catch (error) {
        console.error('GET /api/coach/profile error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Lỗi khi lấy thông tin huấn luyện viên.'
            },
            { status: 500 }
        );
    }
}
