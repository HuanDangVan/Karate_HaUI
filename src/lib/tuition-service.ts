import { getCoachIdByUserId } from '@/lib/coach-class-service';
import { getConnection, sql } from '@/lib/db';
import type { UserRole } from '@/types/auth';
import type {
    TuitionItem,
    TuitionSummary,
    TuitionFilter,
    TuitionStatus,
} from '@/types/tuition';

// Kiểm tra quyền quản trị viên
function checkAdmin(role: UserRole): void {
    if (role !== 'quan_tri_vien') {
        throw new Error('Bạn không có quyền thực hiện chức năng này.');
    }
}

// Lấy danh sách học phí
export async function getTuitionList(
    role: UserRole,
    filter: TuitionFilter = {},
): Promise<TuitionItem[]> {
    checkAdmin(role);

    const pool = await getConnection();

    const result = await pool.request()
        .input('thang', sql.Int, filter.thang ?? null)
        .input('nam', sql.Int, filter.nam ?? null)
        .input('maLop', sql.Int, filter.maLop ?? null)
        .input('trangThai', sql.VarChar(20), filter.trangThai ?? null)
        .query(`
            SELECT
                hp.MaHocPhi AS maHocPhi,
                hp.MaHocVien AS maHocVien,
                hv.MaSoHocVien AS maSoHocVien,
                tk.HoTen AS hoTen,
                hp.MaLop AS maLop,
                lh.MaSoLop AS maSoLop,
                lh.TenLop AS tenLop,
                hp.Thang AS thang,
                hp.Nam AS nam,
                hp.SoBuoi AS soBuoi,
                hp.DonGiaMoiBuoi AS donGiaMoiBuoi,
                hp.TongTien AS tongTien,
                hp.TrangThai AS trangThai,
                CONVERT(VARCHAR(19), hp.NgayCapNhat, 120)
                    AS ngayCapNhat
            FROM HocPhi hp
            INNER JOIN HocVien hv
                ON hp.MaHocVien = hv.MaHocVien
            INNER JOIN TaiKhoan tk
                ON hv.MaTaiKhoan = tk.MaTaiKhoan
            INNER JOIN LopHoc lh
                ON hp.MaLop = lh.MaLop
            WHERE
                (@thang IS NULL OR hp.Thang = @thang)
                AND (@nam IS NULL OR hp.Nam = @nam)
                AND (@maLop IS NULL OR hp.MaLop = @maLop)
                AND (@trangThai IS NULL OR hp.TrangThai = @trangThai)
            ORDER BY
                hp.Nam DESC,
                hp.Thang DESC,
                tk.HoTen ASC
        `);

    return result.recordset as TuitionItem[];
}

// Lấy thống kê học phí
export async function getTuitionSummary(
    role: UserRole,
    filter: TuitionFilter = {},
): Promise<TuitionSummary> {
    checkAdmin(role);

    const pool = await getConnection();

    const result = await pool.request()
        .input('thang', sql.Int, filter.thang ?? null)
        .input('nam', sql.Int, filter.nam ?? null)
        .input('maLop', sql.Int, filter.maLop ?? null)
        .query(`
            SELECT
                ISNULL(SUM(hp.TongTien), 0) AS tongHocPhi,

                ISNULL(SUM(
                    CASE
                        WHEN hp.TrangThai = 'da_dong'
                        THEN hp.TongTien
                        ELSE 0
                    END
                ), 0) AS daThu,

                ISNULL(SUM(
                    CASE
                        WHEN hp.TrangThai = 'chua_dong'
                        THEN hp.TongTien
                        ELSE 0
                    END
                ), 0) AS conNo,

                COUNT(DISTINCT hp.MaHocVien) AS soHocVien

            FROM HocPhi hp
            WHERE
                (@thang IS NULL OR hp.Thang = @thang)
                AND (@nam IS NULL OR hp.Nam = @nam)
                AND (@maLop IS NULL OR hp.MaLop = @maLop)
        `);

    return result.recordset[0] as TuitionSummary;
}

// Học viên xem học phí của chính mình
export async function getMyTuition(
    maTaiKhoan: number,
    filter: TuitionFilter = {},
): Promise<TuitionItem[]> {
    if (!Number.isInteger(maTaiKhoan) || maTaiKhoan <= 0) {
        throw new Error('Tài khoản không hợp lệ.');
    }

    const pool = await getConnection();

    const result = await pool.request()
        .input('maTaiKhoan', sql.Int, maTaiKhoan)
        .input('thang', sql.Int, filter.thang ?? null)
        .input('nam', sql.Int, filter.nam ?? null)
        .query(`
            SELECT
                hp.MaHocPhi AS maHocPhi,
                hp.MaHocVien AS maHocVien,
                hv.MaSoHocVien AS maSoHocVien,
                tk.HoTen AS hoTen,
                hp.MaLop AS maLop,
                lh.MaSoLop AS maSoLop,
                lh.TenLop AS tenLop,
                hp.Thang AS thang,
                hp.Nam AS nam,
                hp.SoBuoi AS soBuoi,
                hp.DonGiaMoiBuoi AS donGiaMoiBuoi,
                hp.TongTien AS tongTien,
                hp.TrangThai AS trangThai,
                CONVERT(VARCHAR(19), hp.NgayCapNhat, 120)
                    AS ngayCapNhat
            FROM HocPhi hp
            INNER JOIN HocVien hv
                ON hp.MaHocVien = hv.MaHocVien
            INNER JOIN TaiKhoan tk
                ON hv.MaTaiKhoan = tk.MaTaiKhoan
            INNER JOIN LopHoc lh
                ON hp.MaLop = lh.MaLop
            WHERE
                hv.MaTaiKhoan = @maTaiKhoan
                AND (@thang IS NULL OR hp.Thang = @thang)
                AND (@nam IS NULL OR hp.Nam = @nam)
            ORDER BY hp.Nam DESC, hp.Thang DESC
        `);

    return result.recordset as TuitionItem[];
}

// Quản trị viên xác nhận thanh toán
export async function updateTuitionStatus(
    maHocPhi: number,
    trangThai: TuitionStatus,
    role: UserRole,
): Promise<void> {
    checkAdmin(role);

    if (!Number.isInteger(maHocPhi) || maHocPhi <= 0) {
        throw new Error('Mã học phí không hợp lệ.');
    }

    const validStatuses: TuitionStatus[] = [
        'chua_dong',
        'da_dong',
    ];

    if (!validStatuses.includes(trangThai)) {
        throw new Error('Trạng thái thanh toán không hợp lệ.');
    }

    const pool = await getConnection();

    const result = await pool.request()
        .input('maHocPhi', sql.Int, maHocPhi)
        .input('trangThai', sql.VarChar(20), trangThai)
        .query(`
            UPDATE HocPhi
            SET
                TrangThai = @trangThai,
                NgayCapNhat = SYSDATETIME()
            WHERE MaHocPhi = @maHocPhi;

            SELECT @@ROWCOUNT AS affectedRows;
        `);

    if (result.recordset[0].affectedRows === 0) {
        throw new Error('Không tìm thấy thông tin học phí.');
    }
}
// HLV xem danh sách học phí của học viên thuộc lớp mình phụ trách
export async function getCoachTuitionList(
    userId: number,
    filter: TuitionFilter = {},
): Promise<TuitionItem[]> {
    const coachId = await getCoachIdByUserId(userId);

    if (!coachId) {
        throw new Error('Không tìm thấy thông tin huấn luyện viên.');
    }

    const pool = await getConnection();

    const result = await pool.request()
        .input('coachId', sql.Int, coachId)
        .input('thang', sql.Int, filter.thang ?? null)
        .input('nam', sql.Int, filter.nam ?? null)
        .input('maLop', sql.Int, filter.maLop ?? null)
        .input('trangThai', sql.VarChar(20), filter.trangThai ?? null)
        .query(`
            SELECT
                hp.MaHocPhi AS maHocPhi,
                hp.MaHocVien AS maHocVien,
                hv.MaSoHocVien AS maSoHocVien,
                tk.HoTen AS hoTen,
                hp.MaLop AS maLop,
                lh.MaSoLop AS maSoLop,
                lh.TenLop AS tenLop,
                hp.Thang AS thang,
                hp.Nam AS nam,
                hp.SoBuoi AS soBuoi,
                hp.DonGiaMoiBuoi AS donGiaMoiBuoi,
                hp.TongTien AS tongTien,
                hp.TrangThai AS trangThai,
                CONVERT(VARCHAR(19), hp.NgayCapNhat, 120)
                    AS ngayCapNhat
            FROM HocPhi hp
            INNER JOIN HocVien hv
                ON hp.MaHocVien = hv.MaHocVien
            INNER JOIN TaiKhoan tk
                ON hv.MaTaiKhoan = tk.MaTaiKhoan
            INNER JOIN LopHoc lh
                ON hp.MaLop = lh.MaLop
            WHERE
                lh.MaHuanLuyenVien = @coachId
                AND (@thang IS NULL OR hp.Thang = @thang)
                AND (@nam IS NULL OR hp.Nam = @nam)
                AND (@maLop IS NULL OR hp.MaLop = @maLop)
                AND (@trangThai IS NULL OR hp.TrangThai = @trangThai)
            ORDER BY
                hp.Nam DESC,
                hp.Thang DESC,
                tk.HoTen ASC
        `);

    return result.recordset as TuitionItem[];
}

// HLV xem thống kê học phí các lớp mình phụ trách
export async function getCoachTuitionSummary(
    userId: number,
    filter: TuitionFilter = {},
): Promise<TuitionSummary> {
    const coachId = await getCoachIdByUserId(userId);

    if (!coachId) {
        throw new Error('Không tìm thấy thông tin huấn luyện viên.');
    }

    const pool = await getConnection();

    const result = await pool.request()
        .input('coachId', sql.Int, coachId)
        .input('thang', sql.Int, filter.thang ?? null)
        .input('nam', sql.Int, filter.nam ?? null)
        .input('maLop', sql.Int, filter.maLop ?? null)
        .query(`
            SELECT
                ISNULL(SUM(hp.TongTien), 0) AS tongHocPhi,

                ISNULL(SUM(
                    CASE
                        WHEN hp.TrangThai = 'da_dong'
                        THEN hp.TongTien
                        ELSE 0
                    END
                ), 0) AS daThu,

                ISNULL(SUM(
                    CASE
                        WHEN hp.TrangThai = 'chua_dong'
                        THEN hp.TongTien
                        ELSE 0
                    END
                ), 0) AS conNo,

                COUNT(DISTINCT hp.MaHocVien) AS soHocVien

            FROM HocPhi hp
            INNER JOIN LopHoc lh
                ON hp.MaLop = lh.MaLop
            WHERE
                lh.MaHuanLuyenVien = @coachId
                AND (@thang IS NULL OR hp.Thang = @thang)
                AND (@nam IS NULL OR hp.Nam = @nam)
                AND (@maLop IS NULL OR hp.MaLop = @maLop)
        `);

    return result.recordset[0] as TuitionSummary;
}