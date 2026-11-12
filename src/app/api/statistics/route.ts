import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
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

        if (session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const pool = await getConnection();

        // Thống kê tổng quan
        const overviewResult = await pool.request().query(`
            SELECT
                (SELECT COUNT(*)
                 FROM HocVien
                 WHERE TrangThai = 'hoat_dong') AS tongHocVien,

                (SELECT COUNT(*)
                 FROM HuanLuyenVien
                 WHERE TrangThai = 'hoat_dong') AS tongHuanLuyenVien,

                (SELECT COUNT(*)
                 FROM LopHoc
                 WHERE TrangThai = 'hoat_dong') AS tongLopHoc,

                (SELECT COUNT(*)
                 FROM LichTap
                 WHERE TrangThai = 'da_len_lich') AS tongLichTap,

                (SELECT COUNT(*)
                 FROM DiemDanh
                 WHERE TrangThai = 'co_mat') AS tongLuotCoMat;
        `);

        // Thống kê số học viên đang học theo từng lớp
        const classResult = await pool.request().query(`
            SELECT
                lh.MaLop AS maLop,
                lh.MaSoLop AS maSoLop,
                lh.TenLop AS tenLop,
                COUNT(DISTINCT CASE
                    WHEN hv.TrangThai = 'hoat_dong'
                    THEN hv.MaHocVien
                END) AS soHocVien,
                lh.SiSoToiDa AS siSoToiDa
            FROM LopHoc lh
            LEFT JOIN HocVien_LopHoc hvlh
                ON lh.MaLop = hvlh.MaLop
                AND hvlh.TrangThai = 'dang_hoc'
            LEFT JOIN HocVien hv
                ON hvlh.MaHocVien = hv.MaHocVien
            WHERE lh.TrangThai = 'hoat_dong'
            GROUP BY
                lh.MaLop,
                lh.MaSoLop,
                lh.TenLop,
                lh.SiSoToiDa
            ORDER BY lh.TenLop;
        `);

        return NextResponse.json({
            success: true,
            data: {
                tongQuan: overviewResult.recordset[0],
                hocVienTheoLop: classResult.recordset,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy dữ liệu thống kê:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải dữ liệu thống kê.',
            },
            { status: 500 }
        );
    }
}