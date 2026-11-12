
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

        const request = pool.request();
        request.input('maTaiKhoan', sql.Int, Number(session.userId));

        const studentResult = await request.query(`
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

        const classRequest = pool.request();
        classRequest.input('maHocVien', sql.Int, maHocVien);

        const result = await classRequest.query(`
            SELECT
                hvl.MaDangKy AS maDangKy,
                hvl.NgayDangKy AS ngayDangKy,
                hvl.TrangThai AS trangThai,

                lh.MaLop AS maLop,
                lh.MaSoLop AS maSoLop,
                lh.TenLop AS tenLop,
                lh.MoTa AS moTa,
                lh.CapDo AS capDo,
                lh.SiSoToiDa AS siSoToiDa,
                lh.DonGiaMoiBuoi AS donGiaMoiBuoi,

                tk.HoTen AS tenHuanLuyenVien,

                (
                    SELECT COUNT(*)
                    FROM HocVien_LopHoc hvl2
                    WHERE hvl2.MaLop = lh.MaLop
                      AND hvl2.TrangThai = 'dang_hoc'
                ) AS siSoHienTai

            FROM HocVien_LopHoc hvl
            INNER JOIN LopHoc lh
                ON hvl.MaLop = lh.MaLop
            LEFT JOIN HuanLuyenVien hlv
                ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
            LEFT JOIN TaiKhoan tk
                ON hlv.MaTaiKhoan = tk.MaTaiKhoan

            WHERE hvl.MaHocVien = @maHocVien

            ORDER BY hvl.NgayDangKy DESC
        `);

        return NextResponse.json({
            success: true,
            data: result.recordset,
        });

    } catch (error) {
        console.error('GET /api/student/my-classes:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải danh sách lớp học của bạn.',
            },
            { status: 500 }
        );
    }
}
