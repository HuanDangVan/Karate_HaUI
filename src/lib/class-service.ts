import { getConnection, sql } from '@/lib/db';
import {
    ClassItem,
    ClassStatus,
    CreateClassInput,
    UpdateClassInput,
} from '@/types/class';

// Dữ liệu thô trả về từ SQL Server
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

export interface CoachOption {
    maHuanLuyenVien: number;
    hoTen: string;
}

// Chuyển ngày tháng sang định dạng YYYY-MM-DD
function formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;

    const d = new Date(date);
    return isNaN(d.getTime())
        ? undefined
        : d.toISOString().split('T')[0];
}

// Chuyển dữ liệu SQL sang ClassItem
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
        ngayTao: formatDate(row.NgayTao),
        ngayCapNhat: formatDate(row.NgayCapNhat),
        donGiaMoiBuoi: Number(row.DonGiaMoiBuoi),
    };
}

// Truy vấn danh sách lớp, huấn luyện viên và sĩ số
const CLASS_SELECT = `
  SELECT
    lh.MaLop,
    lh.MaSoLop,
    lh.TenLop,
    lh.MaHuanLuyenVien,
    tk.HoTen AS TenHuanLuyenVien,
    lh.MoTa,
    lh.CapDo,
    lh.SiSoToiDa,
    lh.DonGiaMoiBuoi,
    (
      SELECT COUNT(*)
      FROM HocVien_LopHoc hvl
      WHERE hvl.MaLop = lh.MaLop
    ) AS SiSoHienTai,
    lh.TrangThai,
    lh.NgayTao,
    lh.NgayCapNhat
  FROM LopHoc lh
  LEFT JOIN HuanLuyenVien hlv
    ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
  LEFT JOIN TaiKhoan tk
    ON hlv.MaTaiKhoan = tk.MaTaiKhoan
`;

// Lấy danh sách lớp học
export async function getAllClasses(params?: {
    search?: string;
    status?: string;
}): Promise<ClassItem[]> {
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

    const query = `
    ${CLASS_SELECT}
    WHERE
      (@status IS NULL OR @status = ''
        OR @status = 'tat_ca'
        OR lh.TrangThai = @status)
      AND (
        @searchPattern IS NULL
        OR lh.MaSoLop LIKE @searchPattern
        OR lh.TenLop LIKE @searchPattern
        OR lh.CapDo LIKE @searchPattern
        OR tk.HoTen LIKE @searchPattern
      )
    ORDER BY lh.MaLop DESC
  `;

    const result = await request.query<RawClassRow>(query);

    return result.recordset.map(mapRowToClass);
}

// Lấy chi tiết một lớp học
export async function getClassById(
    maLop: number
): Promise<ClassItem | null> {
    const pool = await getConnection();
    const request = pool.request();

    request.input('maLop', sql.Int, maLop);

    const result = await request.query<RawClassRow>(`
    ${CLASS_SELECT}
    WHERE lh.MaLop = @maLop
  `);

    if (result.recordset.length === 0) {
        return null;
    }

    return mapRowToClass(result.recordset[0]);
}

// Kiểm tra mã lớp đã tồn tại chưa
export async function isClassCodeTaken(
    maSoLop: string,
    excludeMaLop?: number
): Promise<boolean> {
    const pool = await getConnection();
    const request = pool.request();

    request.input(
        'maSoLop',
        sql.VarChar(30),
        maSoLop.trim().toUpperCase()
    );
    request.input('excludeMaLop', sql.Int, excludeMaLop || null);

    const result = await request.query(`
    SELECT TOP 1 MaLop
    FROM LopHoc
    WHERE UPPER(LTRIM(RTRIM(MaSoLop))) = UPPER(@maSoLop)
      AND (@excludeMaLop IS NULL OR MaLop != @excludeMaLop)
  `);

    return result.recordset.length > 0;
}

// Lấy danh sách huấn luyện viên đang hoạt động
export async function getAvailableCoaches(): Promise<CoachOption[]> {
    const pool = await getConnection();

    const result = await pool.request().query<{
        MaHuanLuyenVien: number;
        HoTen: string;
    }>(`
    SELECT
      hlv.MaHuanLuyenVien,
      tk.HoTen
    FROM HuanLuyenVien hlv
    INNER JOIN TaiKhoan tk
      ON hlv.MaTaiKhoan = tk.MaTaiKhoan
    WHERE hlv.TrangThai = 'hoat_dong'
      AND tk.TrangThai = 'hoat_dong'
    ORDER BY tk.HoTen ASC
  `);

    return result.recordset.map((row) => ({
        maHuanLuyenVien: row.MaHuanLuyenVien,
        hoTen: row.HoTen,
    }));
}

// Kiểm tra huấn luyện viên có tồn tại và đang hoạt động không
async function validateCoach(
    maHuanLuyenVien?: number | null
): Promise<void> {
    if (maHuanLuyenVien == null) return;

    const pool = await getConnection();
    const request = pool.request();

    request.input('maHuanLuyenVien', sql.Int, maHuanLuyenVien);

    const result = await request.query(`
    SELECT TOP 1 hlv.MaHuanLuyenVien
    FROM HuanLuyenVien hlv
    INNER JOIN TaiKhoan tk
      ON hlv.MaTaiKhoan = tk.MaTaiKhoan
    WHERE hlv.MaHuanLuyenVien = @maHuanLuyenVien
      AND hlv.TrangThai = 'hoat_dong'
      AND tk.TrangThai = 'hoat_dong'
  `);

    if (result.recordset.length === 0) {
        throw new Error('Huấn luyện viên không tồn tại hoặc không hoạt động.');
    }
}

// Thêm lớp học
export async function createClass(
    data: CreateClassInput
): Promise<ClassItem> {
    const cleanCode = data.maSoLop.trim().toUpperCase();
    const cleanName = data.tenLop.trim();

    if (!cleanCode || !cleanName) {
        throw new Error('Mã lớp và tên lớp không được để trống.');
    }

    if (!Number.isInteger(data.siSoToiDa) || data.siSoToiDa < 1) {
        throw new Error('Sĩ số tối đa phải là số nguyên lớn hơn 0.');
    }
    if (
        !Number.isFinite(data.donGiaMoiBuoi) ||
        data.donGiaMoiBuoi < 0
    ) {
        throw new Error('Đơn giá mỗi buổi phải là số không âm.');
    }
    if (await isClassCodeTaken(cleanCode)) {
        throw new Error(`Mã lớp "${cleanCode}" đã tồn tại.`);
    }

    await validateCoach(data.maHuanLuyenVien);

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        const request = new sql.Request(transaction);

        request.input('maSoLop', sql.VarChar(30), cleanCode);
        request.input('tenLop', sql.NVarChar(150), cleanName);
        request.input(
            'maHuanLuyenVien',
            sql.Int,
            data.maHuanLuyenVien ?? null
        );
        request.input('moTa', sql.NVarChar(sql.MAX), data.moTa?.trim() || null);
        request.input('capDo', sql.NVarChar(100), data.capDo?.trim() || null);
        request.input('siSoToiDa', sql.Int, data.siSoToiDa);
        request.input(
            'donGiaMoiBuoi',
            sql.Decimal(18, 2),
            data.donGiaMoiBuoi
        );
        request.input(
            'trangThai',
            sql.VarChar(20),
            data.trangThai || 'hoat_dong'
        );

        const result = await request.query<{ MaLop: number }>(`
      INSERT INTO LopHoc (
        MaSoLop,
        TenLop,
        MaHuanLuyenVien,
        MoTa,
        CapDo,
        SiSoToiDa,
        DonGiaMoiBuoi,
        TrangThai,
        NgayTao,
        NgayCapNhat
      )
      OUTPUT INSERTED.MaLop
      VALUES (
        @maSoLop,
        @tenLop,
        @maHuanLuyenVien,
        @moTa,
        @capDo,
        @siSoToiDa,
        @donGiaMoiBuoi,
        @trangThai,
        SYSDATETIME(),
        SYSDATETIME()
      )
    `);

        const newMaLop = result.recordset[0]?.MaLop;

        if (!newMaLop) {
            throw new Error('Không thể lấy mã lớp sau khi tạo.');
        }

        await transaction.commit();

        const createdClass = await getClassById(newMaLop);

        if (!createdClass) {
            throw new Error('Không tìm thấy lớp học vừa tạo.');
        }

        return createdClass;
    } catch (error) {
        try {
            await transaction.rollback();
        } catch {
            // Giao dịch có thể đã được rollback hoặc commit.
        }

        throw error;
    }
}

// Cập nhật thông tin lớp học
export async function updateClass(
    maLop: number,
    data: UpdateClassInput
): Promise<ClassItem> {
    const existing = await getClassById(maLop);

    if (!existing) {
        throw new Error('Lớp học không tồn tại trong hệ thống.');
    }
    if (
        !Number.isFinite(data.donGiaMoiBuoi) ||
        data.donGiaMoiBuoi < 0
    ) {
        throw new Error('Đơn giá mỗi buổi phải là số không âm.');
    }
    const cleanCode = data.maSoLop.trim().toUpperCase();
    const cleanName = data.tenLop.trim();

    if (!cleanCode || !cleanName) {
        throw new Error('Mã lớp và tên lớp không được để trống.');
    }

    if (!Number.isInteger(data.siSoToiDa) || data.siSoToiDa < 1) {
        throw new Error('Sĩ số tối đa phải là số nguyên lớn hơn 0.');
    }

    if (data.siSoToiDa < existing.siSoHienTai) {
        throw new Error(
            `Sĩ số tối đa không được nhỏ hơn sĩ số hiện tại (${existing.siSoHienTai}).`
        );
    }

    if (await isClassCodeTaken(cleanCode, maLop)) {
        throw new Error(`Mã lớp "${cleanCode}" đã được sử dụng.`);
    }

    await validateCoach(data.maHuanLuyenVien);

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        const request = new sql.Request(transaction);

        request.input('maLop', sql.Int, maLop);
        request.input('maSoLop', sql.VarChar(30), cleanCode);
        request.input('tenLop', sql.NVarChar(150), cleanName);
        request.input(
            'maHuanLuyenVien',
            sql.Int,
            data.maHuanLuyenVien ?? null
        );
        request.input('moTa', sql.NVarChar(sql.MAX), data.moTa?.trim() || null);
        request.input('capDo', sql.NVarChar(100), data.capDo?.trim() || null);
        request.input('siSoToiDa', sql.Int, data.siSoToiDa);
        request.input(
            'donGiaMoiBuoi',
            sql.Decimal(18, 2),
            data.donGiaMoiBuoi
        );
        request.input(
            'trangThai',
            sql.VarChar(20),
            data.trangThai || existing.trangThai
        );

        await request.query(`
      UPDATE LopHoc
      SET
        MaSoLop = @maSoLop,
        TenLop = @tenLop,
        MaHuanLuyenVien = @maHuanLuyenVien,
        MoTa = @moTa,
        CapDo = @capDo,
        SiSoToiDa = @siSoToiDa,
        DonGiaMoiBuoi = @donGiaMoiBuoi,
        TrangThai = @trangThai,
        NgayCapNhat = SYSDATETIME()
      WHERE MaLop = @maLop
    `);

        await transaction.commit();

        const updatedClass = await getClassById(maLop);

        if (!updatedClass) {
            throw new Error('Không tìm thấy lớp học sau khi cập nhật.');
        }

        return updatedClass;
    } catch (error) {
        try {
            await transaction.rollback();
        } catch {
            // Giao dịch có thể đã được rollback hoặc commit.
        }

        throw error;
    }
}

// Cập nhật trạng thái lớp học
export async function updateClassStatus(
    maLop: number,
    newStatus: ClassStatus
): Promise<ClassItem> {
    const existing = await getClassById(maLop);

    if (!existing) {
        throw new Error('Lớp học không tồn tại.');
    }

    const pool = await getConnection();
    const request = pool.request();

    request.input('maLop', sql.Int, maLop);
    request.input('trangThai', sql.VarChar(20), newStatus);

    await request.query(`
    UPDATE LopHoc
    SET
      TrangThai = @trangThai,
      NgayCapNhat = SYSDATETIME()
    WHERE MaLop = @maLop
  `);

    const updatedClass = await getClassById(maLop);

    if (!updatedClass) {
        throw new Error('Không tìm thấy lớp học sau khi cập nhật trạng thái.');
    }

    return updatedClass;
}