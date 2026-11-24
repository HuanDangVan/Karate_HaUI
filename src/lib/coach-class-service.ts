import { getConnection, sql } from '@/lib/db';
import type { ClassItem, ClassStatus } from '@/types/class';

// ================================
// KIỂU DỮ LIỆU
// ================================

interface RawClassRow {
    MaLop: number;
    MaSoLop: string;
    TenLop: string;
    MaHuanLuyenVien: number | null;
    TenHuanLuyenVien: string | null;
    MoTa: string | null;
    CapDo: string | null;
    SiSoToiDa: number;
    SiSoHienTai: number;
    TrangThai: ClassStatus;
    NgayTao: Date | null;
    NgayCapNhat: Date | null;
    DonGiaMoiBuoi: number;
}

export interface CoachClassStudent {
    maHocVien: number;
    maSoHocVien: string;
    hoTen: string;
    email: string;
    soDienThoai: string | null;
    ngayDangKy: string | null;
    trangThaiDangKy: string;
}

// ================================
// HÀM CHUYỂN ĐỔI DỮ LIỆU
// ================================

function formatDate(date: Date | null): string | null {
    if (!date) return null;

    const value = new Date(date);

    if (isNaN(value.getTime())) return null;

    return value.toISOString().split('T')[0];
}

function mapRowToClass(row: RawClassRow): ClassItem {
    return {
        maLop: row.MaLop,
        maSoLop: row.MaSoLop,
        tenLop: row.TenLop,
        maHuanLuyenVien: row.MaHuanLuyenVien,
        tenHuanLuyenVien: row.TenHuanLuyenVien,
        moTa: row.MoTa,
        capDo: row.CapDo,
        siSoToiDa: row.SiSoToiDa,
        siSoHienTai: row.SiSoHienTai,
        trangThai: row.TrangThai,
        ngayTao: formatDate(row.NgayTao) ?? undefined,
        ngayCapNhat: formatDate(row.NgayCapNhat) ?? undefined,
        donGiaMoiBuoi: Number(row.DonGiaMoiBuoi),
    };
}

// ================================
// TRUY VẤN LỚP HỌC
// ================================

const COACH_CLASS_SELECT = `
    SELECT
        lh.MaLop,
        lh.MaSoLop,
        lh.TenLop,
        lh.MaHuanLuyenVien,
        tkhlv.HoTen AS TenHuanLuyenVien,
        lh.MoTa,
        lh.CapDo,
        lh.SiSoToiDa,
        lh.DonGiaMoiBuoi,
        (
            SELECT COUNT(*)
            FROM HocVien_LopHoc hvl
            WHERE hvl.MaLop = lh.MaLop
              AND hvl.TrangThai = 'dang_hoc'
        ) AS SiSoHienTai,
        lh.TrangThai,
        lh.NgayTao,
        lh.NgayCapNhat
    FROM LopHoc lh
    INNER JOIN HuanLuyenVien hlv
        ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
    INNER JOIN TaiKhoan tkhlv
        ON hlv.MaTaiKhoan = tkhlv.MaTaiKhoan
`;

// ================================
// 1. LẤY MÃ HUẤN LUYỆN VIÊN
// ================================

export async function getCoachIdByUserId(
    userId: number
): Promise<number> {
    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('Tài khoản không hợp lệ.');
    }

    const pool = await getConnection();
    const request = pool.request();

    request.input('userId', sql.Int, userId);

    const result = await request.query<{
        MaHuanLuyenVien: number;
    }>(`
        SELECT TOP 1
            hlv.MaHuanLuyenVien
        FROM HuanLuyenVien hlv
        INNER JOIN TaiKhoan tk
            ON hlv.MaTaiKhoan = tk.MaTaiKhoan
        WHERE hlv.MaTaiKhoan = @userId
          AND hlv.TrangThai = 'hoat_dong'
          AND tk.TrangThai = 'hoat_dong'
    `);

    if (result.recordset.length === 0) {
        throw new Error(
            'Không tìm thấy hồ sơ huấn luyện viên đang hoạt động.'
        );
    }

    return result.recordset[0].MaHuanLuyenVien;
}

// ================================
// 2. LẤY DANH SÁCH LỚP CỦA HLV
// ================================

export async function getCoachClasses(
    userId: number,
    search?: string
): Promise<ClassItem[]> {
    const maHuanLuyenVien = await getCoachIdByUserId(userId);

    const pool = await getConnection();
    const request = pool.request();

    request.input(
        'maHuanLuyenVien',
        sql.Int,
        maHuanLuyenVien
    );

    const cleanSearch = search?.trim() || '';

    request.input(
        'searchPattern',
        sql.NVarChar(255),
        cleanSearch ? `%${cleanSearch}%` : null
    );

    const result = await request.query<RawClassRow>(`
        ${COACH_CLASS_SELECT}
        WHERE lh.MaHuanLuyenVien = @maHuanLuyenVien
          AND (
              @searchPattern IS NULL
              OR lh.MaSoLop LIKE @searchPattern
              OR lh.TenLop LIKE @searchPattern
              OR lh.CapDo LIKE @searchPattern
          )
        ORDER BY lh.MaLop DESC
    `);

    return result.recordset.map(mapRowToClass);
}

// ================================
// 3. LẤY CHI TIẾT LỚP HỌC
// ================================

export async function getCoachClassById(
    userId: number,
    maLop: number
): Promise<ClassItem | null> {
    if (!Number.isInteger(maLop) || maLop <= 0) {
        return null;
    }

    const maHuanLuyenVien = await getCoachIdByUserId(userId);

    const pool = await getConnection();
    const request = pool.request();

    request.input('maLop', sql.Int, maLop);
    request.input(
        'maHuanLuyenVien',
        sql.Int,
        maHuanLuyenVien
    );

    const result = await request.query<RawClassRow>(`
        ${COACH_CLASS_SELECT}
        WHERE lh.MaLop = @maLop
          AND lh.MaHuanLuyenVien = @maHuanLuyenVien
    `);

    if (result.recordset.length === 0) {
        return null;
    }

    return mapRowToClass(result.recordset[0]);
}

// ================================
// 4. LẤY DANH SÁCH HỌC VIÊN TRONG LỚP
// ================================

export async function getCoachClassStudents(
    userId: number,
    maLop: number
): Promise<CoachClassStudent[]> {
    if (!Number.isInteger(maLop) || maLop <= 0) {
        throw new Error('Mã lớp không hợp lệ.');
    }

    // Kiểm tra lớp có thuộc HLV đang đăng nhập không.
    const coachClass = await getCoachClassById(userId, maLop);

    if (!coachClass) {
        throw new Error(
            'Bạn không có quyền xem danh sách học viên của lớp này.'
        );
    }

    const pool = await getConnection();
    const request = pool.request();

    request.input('maLop', sql.Int, maLop);

    const result = await request.query<{
        MaHocVien: number;
        MaSoHocVien: string;
        HoTen: string;
        Email: string;
        SoDienThoai: string | null;
        NgayDangKy: Date | null;
        TrangThaiDangKy: string;
    }>(`
        SELECT
            hv.MaHocVien,
            hv.MaSoHocVien,
            tk.HoTen,
            tk.Email,
            tk.SoDienThoai,
            hvl.NgayDangKy,
            hvl.TrangThai AS TrangThaiDangKy
        FROM HocVien_LopHoc hvl
        INNER JOIN HocVien hv
            ON hvl.MaHocVien = hv.MaHocVien
        INNER JOIN TaiKhoan tk
            ON hv.MaTaiKhoan = tk.MaTaiKhoan
        WHERE hvl.MaLop = @maLop
          AND hvl.TrangThai = 'dang_hoc'
        ORDER BY tk.HoTen ASC
    `);

    return result.recordset.map((row) => ({
        maHocVien: row.MaHocVien,
        maSoHocVien: row.MaSoHocVien,
        hoTen: row.HoTen,
        email: row.Email,
        soDienThoai: row.SoDienThoai,
        ngayDangKy: formatDate(row.NgayDangKy),
        trangThaiDangKy: row.TrangThaiDangKy,
    }));
}