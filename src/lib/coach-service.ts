
import { getConnection, sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {
    CoachItem,
    CoachStatus,
    CreateCoachInput,
    UpdateCoachInput,
} from '@/types/coach';

interface RawCoachRow {
    MaHuanLuyenVien: number;
    MaTaiKhoan: number;
    MaSoHuanLuyenVien: string;
    ChuyenMon: string | null;
    SoNamKinhNghiem: number | null;
    NgayBatDau: Date | null;
    TrangThai: CoachStatus;
    HoTen: string;
    Email: string;
    SoDienThoai: string | null;
    DiaChi: string | null;
    NgaySinh: Date | null;
    GioiTinh: string | null;
    AnhDaiDien: string | null;
    TrangThaiTaiKhoan: string;
    NgayTao: Date;
}

function formatDate(date: Date | null): string | null {
    if (!date) return null;

    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function mapRowToCoach(row: RawCoachRow): CoachItem {
    return {
        maHuanLuyenVien: row.MaHuanLuyenVien,
        maTaiKhoan: row.MaTaiKhoan,
        maSoHuanLuyenVien: row.MaSoHuanLuyenVien,
        hoTen: row.HoTen,
        email: row.Email,
        soDienThoai: row.SoDienThoai,
        diaChi: row.DiaChi,
        ngaySinh: formatDate(row.NgaySinh),
        gioiTinh: row.GioiTinh,
        chuyenMon: row.ChuyenMon,
        soNamKinhNghiem: row.SoNamKinhNghiem,
        ngayBatDau: formatDate(row.NgayBatDau),
        trangThai: row.TrangThai,
        trangThaiTaiKhoan: row.TrangThaiTaiKhoan,
        anhDaiDien: row.AnhDaiDien,
        ngayTao: formatDate(row.NgayTao) || undefined,
    };
}

const SELECT_COACH = `
  SELECT
    hlv.MaHuanLuyenVien,
    hlv.MaTaiKhoan,
    hlv.MaSoHuanLuyenVien,
    hlv.ChuyenMon,
    hlv.SoNamKinhNghiem,
    hlv.NgayBatDau,
    hlv.TrangThai,
    tk.HoTen,
    tk.Email,
    tk.SoDienThoai,
    tk.DiaChi,
    tk.NgaySinh,
    tk.GioiTinh,
    tk.AnhDaiDien,
    tk.TrangThai AS TrangThaiTaiKhoan,
    tk.NgayTao
  FROM HuanLuyenVien hlv
  INNER JOIN TaiKhoan tk
    ON hlv.MaTaiKhoan = tk.MaTaiKhoan
`;

/**
 * Lấy danh sách huấn luyện viên, tìm kiếm và lọc trạng thái
 */
export async function getAllCoaches(params?: {
    search?: string;
    status?: string;
}): Promise<CoachItem[]> {
    const pool = await getConnection();
    const request = pool.request();

    const search = params?.search?.trim() || '';
    const status = params?.status?.trim() || '';

    request.input('status', sql.VarChar(20), status || null);
    request.input(
        'searchPattern',
        sql.NVarChar(255),
        search ? `%${search}%` : null
    );

    const result = await request.query<RawCoachRow>(`
    ${SELECT_COACH}
    WHERE tk.VaiTro = 'huan_luyen_vien'
      AND (
        @status IS NULL OR
        @status = '' OR
        @status = 'tat_ca' OR
        hlv.TrangThai = @status
      )
      AND (
        @searchPattern IS NULL OR
        tk.HoTen LIKE @searchPattern OR
        tk.Email LIKE @searchPattern OR
        hlv.MaSoHuanLuyenVien LIKE @searchPattern OR
        tk.SoDienThoai LIKE @searchPattern
      )
    ORDER BY hlv.MaHuanLuyenVien DESC
  `);

    return result.recordset.map(mapRowToCoach);
}

/**
 * Lấy chi tiết một huấn luyện viên
 */
export async function getCoachById(
    maHuanLuyenVien: number
): Promise<CoachItem | null> {
    const pool = await getConnection();
    const request = pool.request();

    request.input('id', sql.Int, maHuanLuyenVien);

    const result = await request.query<RawCoachRow>(`
    ${SELECT_COACH}
    WHERE hlv.MaHuanLuyenVien = @id
  `);

    if (result.recordset.length === 0) return null;

    return mapRowToCoach(result.recordset[0]);
}

/**
 * Kiểm tra email đã tồn tại
 */
export async function isCoachEmailTaken(
    email: string,
    excludeMaTaiKhoan?: number
): Promise<boolean> {
    const pool = await getConnection();
    const request = pool.request();

    request.input('email', sql.VarChar(150), email.trim().toLowerCase());
    request.input('excludeId', sql.Int, excludeMaTaiKhoan || null);

    const result = await request.query(`
    SELECT TOP 1 MaTaiKhoan
    FROM TaiKhoan
    WHERE LOWER(LTRIM(RTRIM(Email))) = LOWER(@email)
      AND (@excludeId IS NULL OR MaTaiKhoan != @excludeId)
  `);

    return result.recordset.length > 0;
}

/**
 * Kiểm tra mã số huấn luyện viên đã tồn tại
 */
export async function isCoachCodeTaken(
    code: string,
    excludeId?: number
): Promise<boolean> {
    const pool = await getConnection();
    const request = pool.request();

    request.input('code', sql.VarChar(30), code.trim().toUpperCase());
    request.input('excludeId', sql.Int, excludeId || null);

    const result = await request.query(`
    SELECT TOP 1 MaHuanLuyenVien
    FROM HuanLuyenVien
    WHERE UPPER(LTRIM(RTRIM(MaSoHuanLuyenVien))) = UPPER(@code)
      AND (@excludeId IS NULL OR MaHuanLuyenVien != @excludeId)
  `);

    return result.recordset.length > 0;
}

/**
 * Sinh mã huấn luyện viên tự động, ví dụ HLV26001
 */
export async function generateNextCoachCode(): Promise<string> {
    const pool = await getConnection();

    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `HLV${year}`;

    const request = pool.request();
    request.input('pattern', sql.VarChar(30), `${prefix}%`);

    const result = await request.query<{ maxCode: string | null }>(`
    SELECT MAX(MaSoHuanLuyenVien) AS maxCode
    FROM HuanLuyenVien
    WHERE MaSoHuanLuyenVien LIKE @pattern
  `);

    const maxCode = result.recordset[0]?.maxCode;

    if (!maxCode) return `${prefix}001`;

    const number = parseInt(maxCode.replace(prefix, ''), 10) + 1;

    return `${prefix}${number.toString().padStart(3, '0')}`;
}

/**
 * Thêm huấn luyện viên và tài khoản đăng nhập
 */
export async function createCoach(
    data: CreateCoachInput
): Promise<CoachItem> {
    const email = data.email.trim().toLowerCase();
    const code = data.maSoHuanLuyenVien.trim().toUpperCase();

    if (await isCoachEmailTaken(email)) {
        throw new Error(`Email "${email}" đã được sử dụng.`);
    }

    if (await isCoachCodeTaken(code)) {
        throw new Error(`Mã huấn luyện viên "${code}" đã tồn tại.`);
    }

    const passwordHash = await bcrypt.hash(data.matKhau, 12);

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        // 1. Tạo tài khoản
        const accountRequest = new sql.Request(transaction);

        accountRequest.input('HoTen', sql.NVarChar(150), data.hoTen.trim());
        accountRequest.input('Email', sql.VarChar(150), email);
        accountRequest.input('MatKhau', sql.NVarChar(255), passwordHash);
        accountRequest.input(
            'SoDienThoai',
            sql.VarChar(20),
            data.soDienThoai?.trim() || null
        );
        accountRequest.input(
            'DiaChi',
            sql.NVarChar(255),
            data.diaChi?.trim() || null
        );
        accountRequest.input(
            'NgaySinh',
            sql.Date,
            data.ngaySinh || null
        );
        accountRequest.input(
            'GioiTinh',
            sql.NVarChar(10),
            data.gioiTinh?.trim() || null
        );

        const accountResult = await accountRequest.query<{ MaTaiKhoan: number }>(`
      INSERT INTO TaiKhoan (
        HoTen, Email, MatKhauMaHoa,
        SoDienThoai, DiaChi, NgaySinh, GioiTinh,
        VaiTro, TrangThai, NgayTao, NgayCapNhat
      )
      OUTPUT INSERTED.MaTaiKhoan
      VALUES (
        @HoTen, @Email, @MatKhau,
        @SoDienThoai, @DiaChi, @NgaySinh, @GioiTinh,
        'huan_luyen_vien', 'hoat_dong',
        SYSDATETIME(), SYSDATETIME()
      )
    `);

        const maTaiKhoan = accountResult.recordset[0]?.MaTaiKhoan;

        if (!maTaiKhoan) {
            throw new Error('Không thể tạo tài khoản huấn luyện viên.');
        }

        // 2. Tạo hồ sơ huấn luyện viên
        const coachRequest = new sql.Request(transaction);

        coachRequest.input('MaTaiKhoan', sql.Int, maTaiKhoan);
        coachRequest.input('MaSo', sql.VarChar(30), code);
        coachRequest.input(
            'ChuyenMon',
            sql.NVarChar(300),
            data.chuyenMon?.trim() || null
        );
        coachRequest.input(
            'KinhNghiem',
            sql.Int,
            data.soNamKinhNghiem ?? null
        );
        coachRequest.input(
            'NgayBatDau',
            sql.Date,
            data.ngayBatDau || null
        );
        coachRequest.input(
            'TrangThai',
            sql.VarChar(20),
            data.trangThai || 'hoat_dong'
        );

        const coachResult = await coachRequest.query<{
            MaHuanLuyenVien: number;
        }>(`
      INSERT INTO HuanLuyenVien (
        MaTaiKhoan, MaSoHuanLuyenVien,
        ChuyenMon, SoNamKinhNghiem,
        NgayBatDau, TrangThai
      )
      OUTPUT INSERTED.MaHuanLuyenVien
      VALUES (
        @MaTaiKhoan, @MaSo,
        @ChuyenMon, @KinhNghiem,
        @NgayBatDau, @TrangThai
      )
    `);

        const newId = coachResult.recordset[0]?.MaHuanLuyenVien;

        if (!newId) {
            throw new Error('Không thể tạo hồ sơ huấn luyện viên.');
        }

        await transaction.commit();

        const created = await getCoachById(newId);

        if (!created) {
            throw new Error('Không tìm thấy hồ sơ vừa tạo.');
        }

        return created;
    } catch (error) {
        try {
            await transaction.rollback();
        } catch {
            // Giao dịch có thể đã được rollback hoặc commit.
        }
        throw error;
    }
}

/**
 * Cập nhật thông tin huấn luyện viên
 */
export async function updateCoach(
    id: number,
    data: UpdateCoachInput
): Promise<CoachItem> {
    const existing = await getCoachById(id);

    if (!existing) {
        throw new Error('Huấn luyện viên không tồn tại.');
    }

    const code = data.maSoHuanLuyenVien.trim().toUpperCase();

    if (await isCoachCodeTaken(code, id)) {
        throw new Error(`Mã huấn luyện viên "${code}" đã được sử dụng.`);
    }

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        const status = data.trangThai || existing.trangThai;

        // Cập nhật tài khoản
        const accountRequest = new sql.Request(transaction);

        accountRequest.input('MaTaiKhoan', sql.Int, existing.maTaiKhoan);
        accountRequest.input('HoTen', sql.NVarChar(150), data.hoTen.trim());
        accountRequest.input(
            'SoDienThoai',
            sql.VarChar(20),
            data.soDienThoai?.trim() || null
        );
        accountRequest.input(
            'DiaChi',
            sql.NVarChar(255),
            data.diaChi?.trim() || null
        );
        accountRequest.input('NgaySinh', sql.Date, data.ngaySinh || null);
        accountRequest.input(
            'GioiTinh',
            sql.NVarChar(10),
            data.gioiTinh?.trim() || null
        );
        accountRequest.input(
            'TrangThai',
            sql.VarChar(50),
            status === 'ngung_hoat_dong' ? 'ngung_hoat_dong' : 'hoat_dong'
        );

        await accountRequest.query(`
      UPDATE TaiKhoan
      SET
        HoTen = @HoTen,
        SoDienThoai = @SoDienThoai,
        DiaChi = @DiaChi,
        NgaySinh = @NgaySinh,
        GioiTinh = @GioiTinh,
        TrangThai = @TrangThai,
        NgayCapNhat = SYSDATETIME()
      WHERE MaTaiKhoan = @MaTaiKhoan
    `);

        // Cập nhật hồ sơ huấn luyện viên
        const coachRequest = new sql.Request(transaction);

        coachRequest.input('Id', sql.Int, id);
        coachRequest.input('MaSo', sql.VarChar(30), code);
        coachRequest.input(
            'ChuyenMon',
            sql.NVarChar(300),
            data.chuyenMon?.trim() || null
        );
        coachRequest.input(
            'KinhNghiem',
            sql.Int,
            data.soNamKinhNghiem ?? null
        );
        coachRequest.input('NgayBatDau', sql.Date, data.ngayBatDau || null);
        coachRequest.input('TrangThai', sql.VarChar(20), status);

        await coachRequest.query(`
      UPDATE HuanLuyenVien
      SET
        MaSoHuanLuyenVien = @MaSo,
        ChuyenMon = @ChuyenMon,
        SoNamKinhNghiem = @KinhNghiem,
        NgayBatDau = @NgayBatDau,
        TrangThai = @TrangThai
      WHERE MaHuanLuyenVien = @Id
    `);

        await transaction.commit();

        const updated = await getCoachById(id);

        if (!updated) {
            throw new Error('Không tìm thấy huấn luyện viên sau khi cập nhật.');
        }

        return updated;
    } catch (error) {
        try {
            await transaction.rollback();
        } catch {
            // Giao dịch có thể đã kết thúc.
        }
        throw error;
    }
}

/**
 * Thay đổi trạng thái huấn luyện viên
 */
export async function updateCoachStatus(
    id: number,
    newStatus: CoachStatus
): Promise<CoachItem> {
    const existing = await getCoachById(id);

    if (!existing) {
        throw new Error('Huấn luyện viên không tồn tại.');
    }

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        const coachRequest = new sql.Request(transaction);
        coachRequest.input('Id', sql.Int, id);
        coachRequest.input('TrangThai', sql.VarChar(20), newStatus);

        await coachRequest.query(`
      UPDATE HuanLuyenVien
      SET TrangThai = @TrangThai
      WHERE MaHuanLuyenVien = @Id
    `);

        const accountRequest = new sql.Request(transaction);
        accountRequest.input('MaTaiKhoan', sql.Int, existing.maTaiKhoan);
        accountRequest.input(
            'TrangThai',
            sql.VarChar(50),
            newStatus === 'ngung_hoat_dong'
                ? 'ngung_hoat_dong'
                : 'hoat_dong'
        );

        await accountRequest.query(`
      UPDATE TaiKhoan
      SET
        TrangThai = @TrangThai,
        NgayCapNhat = SYSDATETIME()
      WHERE MaTaiKhoan = @MaTaiKhoan
    `);

        await transaction.commit();

        const updated = await getCoachById(id);

        if (!updated) {
            throw new Error('Không tìm thấy huấn luyện viên sau khi đổi trạng thái.');
        }

        return updated;
    } catch (error) {
        try {
            await transaction.rollback();
        } catch {
            // Giao dịch có thể đã kết thúc.
        }
        throw error;
    }
}
