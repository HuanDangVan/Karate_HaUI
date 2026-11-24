
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

        // 1. Thống kê tổng quan
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
                 WHERE TrangThai = 'da_len_lich'
                   AND NgayTap >= CAST(GETDATE() AS DATE)
                ) AS tongLichTap;
        `);

        // 2. Số học viên đang học theo từng lớp
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

        // 3. Thống kê điểm danh trong 7 ngày gần nhất
        const attendanceResult = await pool.request().query(`
            SELECT
                CONVERT(VARCHAR(10), CAST(lt.NgayTap AS DATE), 23) AS ngay,
                COUNT(dd.MaDiemDanh) AS tongLuotDiemDanh,
                SUM(CASE
                    WHEN dd.TrangThai = 'co_mat' THEN 1
                    ELSE 0
                END) AS soLuotCoMat
            FROM LichTap lt
            LEFT JOIN DiemDanh dd
                ON lt.MaLichTap = dd.MaLichTap
            WHERE lt.NgayTap >= DATEADD(
                DAY, -6, CAST(GETDATE() AS DATE)
            )
              AND lt.NgayTap < DATEADD(
                DAY, 1, CAST(GETDATE() AS DATE)
            )
            GROUP BY CAST(lt.NgayTap AS DATE)
            ORDER BY CAST(lt.NgayTap AS DATE);
        `);

        // 4. Lịch tập sắp tới
        const scheduleResult = await pool.request().query(`
            SELECT TOP 5
                lt.MaLichTap AS maLichTap,
                lt.NgayTap AS ngayTap,
                CONVERT(VARCHAR(5), lt.GioBatDau, 108) AS gioBatDau,
                CONVERT(VARCHAR(5), lt.GioKetThuc, 108) AS gioKetThuc,
                lt.DiaDiem AS diaDiem,
                lt.NoiDung AS noiDung,
                lh.TenLop AS tenLop,
                tk.HoTen AS tenHuanLuyenVien
            FROM LichTap lt
            INNER JOIN LopHoc lh
                ON lt.MaLop = lh.MaLop
            LEFT JOIN HuanLuyenVien hlv
                ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
            LEFT JOIN TaiKhoan tk
                ON hlv.MaTaiKhoan = tk.MaTaiKhoan
            WHERE lt.TrangThai = 'da_len_lich'
              AND lt.NgayTap >= CAST(GETDATE() AS DATE)
            ORDER BY lt.NgayTap, lt.GioBatDau;
        `);

        // 5. Thông báo mới nhất
        const announcementResult = await pool.request().query(`
            SELECT TOP 5
                tb.MaThongBao AS maThongBao,
                tb.TieuDe AS tieuDe,
                tb.NoiDung AS noiDung,
                tb.NgayTao AS ngayTao,
                tk.HoTen AS nguoiTao
            FROM ThongBao tb
            LEFT JOIN TaiKhoan tk
                ON tb.NguoiTao = tk.MaTaiKhoan
            ORDER BY tb.NgayTao DESC;
        `);

        return NextResponse.json({
            success: true,
            data: {
                tongQuan: overviewResult.recordset[0],
                hocVienTheoLop: classResult.recordset,
                diemDanhTheoNgay: attendanceResult.recordset,
                lichTapSapToi: scheduleResult.recordset,
                thongBaoGanDay: announcementResult.recordset,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy dữ liệu dashboard:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải dữ liệu trang chủ.',
            },
            { status: 500 }
        );
    }
}
