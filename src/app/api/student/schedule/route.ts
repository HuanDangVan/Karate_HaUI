
import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'hoc_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const pool = await getConnection();

        // Xác định học viên đang đăng nhập
        const studentRequest = pool.request();
        studentRequest.input(
            'maTaiKhoan',
            sql.Int,
            Number(session.userId)
        );

        const studentResult = await studentRequest.query(`
            SELECT MaHocVien
            FROM HocVien
            WHERE MaTaiKhoan = @maTaiKhoan
              AND TrangThai = 'hoat_dong'
        `);

        if (studentResult.recordset.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy hồ sơ học viên.' },
                { status: 404 }
            );
        }

        const maHocVien = studentResult.recordset[0].MaHocVien;

        // Lấy lịch tập của các lớp đã được duyệt
        const scheduleRequest = pool.request();
        scheduleRequest.input('maHocVien', sql.Int, maHocVien);

        const result = await scheduleRequest.query(`
            SELECT
                lt.MaLichTap AS maLichTap,
                lt.MaLop AS maLop,
                lh.MaSoLop AS maSoLop,
                lh.TenLop AS tenLop,
                lt.NgayTap AS ngayTap,
                lt.GioBatDau AS gioBatDau,
                lt.GioKetThuc AS gioKetThuc,
                lt.DiaDiem AS diaDiem,
                lt.NoiDung AS noiDung,
                lt.TrangThai AS trangThai
            FROM LichTap lt
            INNER JOIN LopHoc lh
                ON lt.MaLop = lh.MaLop
            INNER JOIN HocVien_LopHoc hvl
                ON lh.MaLop = hvl.MaLop
            WHERE hvl.MaHocVien = @maHocVien
              AND hvl.TrangThai = 'dang_hoc'
            ORDER BY
                lt.NgayTap ASC,
                lt.GioBatDau ASC
        `);

        return NextResponse.json({
            success: true,
            data: result.recordset,
        });

    } catch (error) {
        console.error('GET /api/student/schedule:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải thời khóa biểu.',
            },
            { status: 500 }
        );
    }
}
