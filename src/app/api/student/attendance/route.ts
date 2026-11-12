
import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Bạn chưa đăng nhập.' },
                { status: 401 },
            );
        }

        if (session.role !== 'hoc_vien') {
            return NextResponse.json(
                { message: 'Bạn không có quyền truy cập.' },
                { status: 403 },
            );
        }

        const pool = await getConnection();

        const result = await pool
            .request()
            .input('maTaiKhoan', sql.Int, session.userId)
            .query(`
                SELECT
                    dd.MaDiemDanh AS maDiemDanh,
                    dd.MaLichTap AS maLichTap,
                    dd.MaHocVien AS maHocVien,
                    lh.MaSoLop AS maSoLop,
                    lh.TenLop AS tenLop,
                    CONVERT(VARCHAR(10), lt.NgayTap, 23) AS ngayTap,
                    CONVERT(VARCHAR(8), lt.GioBatDau, 108) AS gioBatDau,
                    CONVERT(VARCHAR(8), lt.GioKetThuc, 108) AS gioKetThuc,
                    lt.DiaDiem AS diaDiem,
                    dd.TrangThai AS trangThai,
                    dd.GhiChu AS ghiChu,
                    dd.NguoiDiemDanh AS nguoiDiemDanh,
                    CONVERT(
                        VARCHAR(19),
                        dd.ThoiGianDiemDanh,
                        120
                    ) AS thoiGianDiemDanh
                FROM DiemDanh dd
                INNER JOIN HocVien hv
                    ON dd.MaHocVien = hv.MaHocVien
                INNER JOIN LichTap lt
                    ON dd.MaLichTap = lt.MaLichTap
                INNER JOIN LopHoc lh
                    ON lt.MaLop = lh.MaLop
                WHERE hv.MaTaiKhoan = @maTaiKhoan
                ORDER BY lt.NgayTap DESC, lt.GioBatDau DESC
            `);

        return NextResponse.json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error('Lỗi lấy lịch sử điểm danh:', error);

        return NextResponse.json(
            { message: 'Không thể tải lịch sử điểm danh.' },
            { status: 500 },
        );
    }
}
