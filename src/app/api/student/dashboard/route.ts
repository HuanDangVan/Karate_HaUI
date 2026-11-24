
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
        const maTaiKhoan = Number(session.userId);

        // 1. Lấy hồ sơ học viên
        const studentResult = await pool.request()
            .input('maTaiKhoan', sql.Int, maTaiKhoan)
            .query(`
                SELECT
                    hv.MaHocVien AS maHocVien,
                    hv.MaSoHocVien AS maSoHocVien,
                    hv.NgayThamGia AS ngayThamGia,
                    tk.HoTen AS hoTen,
                    tk.Email AS email
                FROM HocVien hv
                INNER JOIN TaiKhoan tk
                    ON hv.MaTaiKhoan = tk.MaTaiKhoan
                WHERE hv.MaTaiKhoan = @maTaiKhoan
                  AND hv.TrangThai = 'hoat_dong'
            `);

        if (studentResult.recordset.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy hồ sơ học viên.' },
                { status: 404 }
            );
        }

        const student = studentResult.recordset[0];
        const maHocVien = student.maHocVien;

        // 2. Thống kê điểm danh
        const attendanceResult = await pool.request()
            .input('maHocVien', sql.Int, maHocVien)
            .query(`
                SELECT
                    COUNT(*) AS tongSoBuoi,
                    SUM(CASE
                        WHEN TrangThai = 'co_mat' THEN 1
                        ELSE 0
                    END) AS soBuoiCoMat,
                    SUM(CASE
                        WHEN TrangThai = 'di_muon' THEN 1
                        ELSE 0
                    END) AS soBuoiDiMuon,
                    SUM(CASE
                        WHEN TrangThai = 'vang' THEN 1
                        ELSE 0
                    END) AS soBuoiVang,
                    SUM(CASE
                        WHEN TrangThai = 'co_phep' THEN 1
                        ELSE 0
                    END) AS soBuoiCoPhep
                FROM DiemDanh
                WHERE MaHocVien = @maHocVien
            `);

        const attendance = attendanceResult.recordset[0];

        const tongSoBuoi = Number(attendance.tongSoBuoi) || 0;
        const soBuoiCoMat = Number(attendance.soBuoiCoMat) || 0;
        const soBuoiDiMuon = Number(attendance.soBuoiDiMuon) || 0;
        const soBuoiVang = Number(attendance.soBuoiVang) || 0;
        const soBuoiCoPhep = Number(attendance.soBuoiCoPhep) || 0;

        const soBuoiDaThamGia = soBuoiCoMat + soBuoiDiMuon;

        const tyLeChuyenCan = tongSoBuoi > 0
            ? Math.round((soBuoiDaThamGia / tongSoBuoi) * 100)
            : 0;

        // 3. Lấy các lớp học đã được duyệt
        const classesResult = await pool.request()
            .input('maHocVien', sql.Int, maHocVien)
            .query(`
                SELECT
                    lh.MaLop AS maLop,
                    lh.MaSoLop AS maSoLop,
                    lh.TenLop AS tenLop
                FROM HocVien_LopHoc hvl
                INNER JOIN LopHoc lh
                    ON hvl.MaLop = lh.MaLop
                WHERE hvl.MaHocVien = @maHocVien
                  AND hvl.TrangThai = 'dang_hoc'
                ORDER BY lh.TenLop ASC
            `);

        // 4. Lấy buổi tập sắp tới gần nhất
        const scheduleResult = await pool.request()
            .input('maHocVien', sql.Int, maHocVien)
            .query(`
                SELECT TOP 1
                    lt.MaLichTap AS maLichTap,
                    lh.MaSoLop AS maSoLop,
                    lh.TenLop AS tenLop,
                    CONVERT(VARCHAR(10), lt.NgayTap, 23) AS ngayTap,
                    CONVERT(VARCHAR(8), lt.GioBatDau, 108) AS gioBatDau,
                    CONVERT(VARCHAR(8), lt.GioKetThuc, 108) AS gioKetThuc,
                    lt.DiaDiem AS diaDiem,
                    lt.NoiDung AS noiDung
                FROM LichTap lt
                INNER JOIN LopHoc lh
                    ON lt.MaLop = lh.MaLop
                INNER JOIN HocVien_LopHoc hvl
                    ON lh.MaLop = hvl.MaLop
                WHERE hvl.MaHocVien = @maHocVien
                  AND hvl.TrangThai = 'dang_hoc'
                  AND lt.TrangThai = 'da_len_lich'
                  AND lt.NgayTap >= CAST(GETDATE() AS DATE)
                ORDER BY
                    lt.NgayTap ASC,
                    lt.GioBatDau ASC
            `);

        return NextResponse.json({
            success: true,
            data: {
                student: {
                    maHocVien: student.maHocVien,
                    maSoHocVien: student.maSoHocVien,
                    hoTen: student.hoTen,
                    email: student.email,
                    ngayThamGia: student.ngayThamGia,
                },
                attendance: {
                    tongSoBuoi,
                    soBuoiDaThamGia,
                    soBuoiCoMat,
                    soBuoiDiMuon,
                    soBuoiVang,
                    soBuoiCoPhep,
                    tyLeChuyenCan,
                },
                classes: classesResult.recordset,
                totalClasses: classesResult.recordset.length,
                nextSchedule: scheduleResult.recordset[0] || null,
            },
        });

    } catch (error) {
        console.error('GET /api/student/dashboard:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Không thể tải dữ liệu tổng quan học viên.',
            },
            { status: 500 }
        );
    }
}
