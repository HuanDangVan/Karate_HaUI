import { getConnection, sql } from '@/lib/db';

export interface CoachUpcomingSchedule {
    maLichTap: number;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string | null;
    noiDung: string | null;
}

export interface CoachDashboardData {
    totalClasses: number;
    totalStudents: number;
    upcomingSessions: number;
    upcomingSchedules: CoachUpcomingSchedule[];
}

export async function getCoachDashboardData(
    userId: number,
): Promise<CoachDashboardData> {
    const pool = await getConnection();

    // Lấy mã huấn luyện viên từ tài khoản đang đăng nhập
    const coachResult = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT MaHuanLuyenVien
            FROM HuanLuyenVien
            WHERE MaTaiKhoan = @userId
        `);

    if (coachResult.recordset.length === 0) {
        throw new Error('Không tìm thấy hồ sơ huấn luyện viên.');
    }

    const maHuanLuyenVien =
        coachResult.recordset[0].MaHuanLuyenVien as number;

    // Lấy thống kê lớp học, học viên và lịch tập trong 7 ngày tới
    const [statsResult, schedulesResult] = await Promise.all([
        pool
            .request()
            .input('maHuanLuyenVien', sql.Int, maHuanLuyenVien)
            .query(`
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM LopHoc
                        WHERE MaHuanLuyenVien = @maHuanLuyenVien
                          AND TrangThai = 'hoat_dong'
                    ) AS TotalClasses,

                    (
                        SELECT COUNT(DISTINCT hvl.MaHocVien)
                        FROM HocVien_LopHoc hvl
                        INNER JOIN LopHoc lh
                            ON hvl.MaLop = lh.MaLop
                        INNER JOIN HocVien hv
                            ON hvl.MaHocVien = hv.MaHocVien
                        INNER JOIN TaiKhoan tk
                            ON hv.MaTaiKhoan = tk.MaTaiKhoan
                        WHERE lh.MaHuanLuyenVien = @maHuanLuyenVien
                          AND lh.TrangThai = 'hoat_dong'
                          AND hv.TrangThai = 'hoat_dong'
                          AND tk.TrangThai = 'hoat_dong'
                    ) AS TotalStudents,

                    (
                        SELECT COUNT(*)
                        FROM LichTap lt
                        INNER JOIN LopHoc lh
                            ON lt.MaLop = lh.MaLop
                        WHERE lh.MaHuanLuyenVien = @maHuanLuyenVien
                          AND lt.TrangThai = 'da_len_lich'
                          AND lt.NgayTap >= CAST(GETDATE() AS DATE)
                          AND lt.NgayTap < DATEADD(
                              DAY, 7, CAST(GETDATE() AS DATE)
                          )
                    ) AS UpcomingSessions
            `),

        pool
            .request()
            .input('maHuanLuyenVien', sql.Int, maHuanLuyenVien)
            .query(`
                SELECT TOP 6
                    lt.MaLichTap AS maLichTap,
                    lt.MaLop AS maLop,
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
                WHERE lh.MaHuanLuyenVien = @maHuanLuyenVien
                  AND lt.TrangThai = 'da_len_lich'
                  AND lt.NgayTap >= CAST(GETDATE() AS DATE)
                ORDER BY lt.NgayTap ASC, lt.GioBatDau ASC
            `),
    ]);

    const stats = statsResult.recordset[0];

    return {
        totalClasses: Number(stats.TotalClasses) || 0,
        totalStudents: Number(stats.TotalStudents) || 0,
        upcomingSessions: Number(stats.UpcomingSessions) || 0,
        upcomingSchedules:
            schedulesResult.recordset as CoachUpcomingSchedule[],
    };
}