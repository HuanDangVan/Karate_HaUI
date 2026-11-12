import { getConnection, sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {
  StudentItem,
  StudentStatus,
  CreateStudentInput,
  UpdateStudentInput,
} from '@/types/student';

interface RawStudentRow {
  MaHocVien: number;
  MaTaiKhoan: number;
  MaSoHocVien: string;
  NgayThamGia: Date | null;
  TrangThai: StudentStatus;
  GhiChu: string | null;
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

function formatDateToIsoString(date: Date | null): string | null {
  if (!date) return null;
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function mapRowToStudentItem(row: RawStudentRow): StudentItem {
  return {
    maHocVien: row.MaHocVien,
    maTaiKhoan: row.MaTaiKhoan,
    maSoHocVien: row.MaSoHocVien,
    hoTen: row.HoTen,
    email: row.Email,
    soDienThoai: row.SoDienThoai,
    diaChi: row.DiaChi,
    ngaySinh: formatDateToIsoString(row.NgaySinh),
    gioiTinh: row.GioiTinh,
    ngayThamGia: formatDateToIsoString(row.NgayThamGia),
    trangThai: row.TrangThai,
    trangThaiTaiKhoan: row.TrangThaiTaiKhoan,
    ghiChu: row.GhiChu,
    anhDaiDien: row.AnhDaiDien,
    ngayTao: formatDateToIsoString(row.NgayTao) || undefined,
  };
}

/**
 * Lấy danh sách học viên từ database SQL Server kèm tìm kiếm và lọc
 */
export async function getAllStudents(params?: {
  search?: string;
  status?: string;
}): Promise<StudentItem[]> {
  const pool = await getConnection();
  const request = pool.request();

  const search = params?.search?.trim() || '';
  const status = params?.status?.trim() || '';

  request.input('status', sql.VarChar(20), status || null);
  request.input('searchPattern', sql.NVarChar(255), search ? `%${search}%` : null);

  const query = `
    SELECT
      hv.MaHocVien,
      hv.MaTaiKhoan,
      hv.MaSoHocVien,
      hv.NgayThamGia,
      hv.TrangThai,
      hv.GhiChu,
      tk.HoTen,
      tk.Email,
      tk.SoDienThoai,
      tk.DiaChi,
      tk.NgaySinh,
      tk.GioiTinh,
      tk.AnhDaiDien,
      tk.TrangThai AS TrangThaiTaiKhoan,
      tk.NgayTao
    FROM HocVien hv
    INNER JOIN TaiKhoan tk ON hv.MaTaiKhoan = tk.MaTaiKhoan
    WHERE tk.VaiTro = 'hoc_vien'
      AND (@status IS NULL OR @status = '' OR @status = 'tat_ca' OR hv.TrangThai = @status)
      AND (
        @searchPattern IS NULL OR
        tk.HoTen LIKE @searchPattern OR
        tk.Email LIKE @searchPattern OR
        hv.MaSoHocVien LIKE @searchPattern OR
        tk.SoDienThoai LIKE @searchPattern
      )
    ORDER BY hv.MaHocVien DESC
  `;

  const result = await request.query<RawStudentRow>(query);
  return result.recordset.map(mapRowToStudentItem);
}

/**
 * Lấy thông tin chi tiết một học viên theo Mã học viên
 */
export async function getStudentById(maHocVien: number): Promise<StudentItem | null> {
  const pool = await getConnection();
  const request = pool.request();
  request.input('maHocVien', sql.Int, maHocVien);

  const query = `
    SELECT TOP 1
      hv.MaHocVien,
      hv.MaTaiKhoan,
      hv.MaSoHocVien,
      hv.NgayThamGia,
      hv.TrangThai,
      hv.GhiChu,
      tk.HoTen,
      tk.Email,
      tk.SoDienThoai,
      tk.DiaChi,
      tk.NgaySinh,
      tk.GioiTinh,
      tk.AnhDaiDien,
      tk.TrangThai AS TrangThaiTaiKhoan,
      tk.NgayTao
    FROM HocVien hv
    INNER JOIN TaiKhoan tk ON hv.MaTaiKhoan = tk.MaTaiKhoan
    WHERE hv.MaHocVien = @maHocVien
  `;

  const result = await request.query<RawStudentRow>(query);
  if (!result.recordset || result.recordset.length === 0) {
    return null;
  }

  return mapRowToStudentItem(result.recordset[0]);
}

/**
 * Kiểm tra Email đã tồn tại hay chưa
 */
export async function isEmailTaken(email: string, excludeMaTaiKhoan?: number): Promise<boolean> {
  const pool = await getConnection();
  const request = pool.request();
  request.input('email', sql.VarChar(150), email.trim().toLowerCase());
  request.input('excludeMaTaiKhoan', sql.Int, excludeMaTaiKhoan || null);

  const query = `
    SELECT TOP 1 MaTaiKhoan
    FROM TaiKhoan
    WHERE LOWER(LTRIM(RTRIM(Email))) = LOWER(@email)
      AND (@excludeMaTaiKhoan IS NULL OR MaTaiKhoan != @excludeMaTaiKhoan)
  `;

  const result = await request.query(query);
  return result.recordset.length > 0;
}

/**
 * Kiểm tra Mã số học viên đã tồn tại hay chưa
 */
export async function isMaSoHocVienTaken(
  maSoHocVien: string,
  excludeMaHocVien?: number
): Promise<boolean> {
  const pool = await getConnection();
  const request = pool.request();
  request.input('maSoHocVien', sql.VarChar(30), maSoHocVien.trim().toUpperCase());
  request.input('excludeMaHocVien', sql.Int, excludeMaHocVien || null);

  const query = `
    SELECT TOP 1 MaHocVien
    FROM HocVien
    WHERE UPPER(LTRIM(RTRIM(MaSoHocVien))) = UPPER(@maSoHocVien)
      AND (@excludeMaHocVien IS NULL OR MaHocVien != @excludeMaHocVien)
  `;

  const result = await request.query(query);
  return result.recordset.length > 0;
}

/**
 * Tạo tự động mã số học viên gợi ý (ví dụ: HV26001)
 */
export async function generateNextMaSoHocVien(): Promise<string> {
  const pool = await getConnection();
  const currentYearSuffix = new Date().getFullYear().toString().slice(-2);
  const prefix = `HV${currentYearSuffix}`;

  const request = pool.request();
  request.input('prefixPattern', sql.VarChar(10), `${prefix}%`);

  const result = await request.query<{ maxCode: string | null }>(`
    SELECT MAX(MaSoHocVien) AS maxCode
    FROM HocVien
    WHERE MaSoHocVien LIKE @prefixPattern
  `);

  const maxCode = result.recordset[0]?.maxCode;
  if (!maxCode) {
    return `${prefix}001`;
  }

  const numberPart = maxCode.replace(prefix, '');
  const nextNum = parseInt(numberPart, 10) + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

/**
 * Thêm mới học viên với SQL Transaction đồng thời bảng TaiKhoan và HocVien
 */
export async function createStudent(data: CreateStudentInput): Promise<StudentItem> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanMaSoHocVien = data.maSoHocVien.trim().toUpperCase();

  // Kiểm tra trùng Email
  if (await isEmailTaken(cleanEmail)) {
    throw new Error(`Email "${cleanEmail}" đã được sử dụng trong hệ thống.`);
  }

  // Kiểm tra trùng Mã số học viên
  if (await isMaSoHocVienTaken(cleanMaSoHocVien)) {
    throw new Error(`Mã số học viên "${cleanMaSoHocVien}" đã tồn tại.`);
  }

  // Băm mật khẩu bằng bcryptjs
  const passwordHash = await bcrypt.hash(data.matKhau, 12);

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    // 1. Tạo bản ghi TaiKhoan
    const taiKhoanRequest = new sql.Request(transaction);
    taiKhoanRequest.input('HoTen', sql.NVarChar(150), data.hoTen.trim());
    taiKhoanRequest.input('Email', sql.VarChar(150), cleanEmail);
    taiKhoanRequest.input('MatKhauMaHoa', sql.NVarChar(255), passwordHash);
    taiKhoanRequest.input('SoDienThoai', sql.VarChar(20), data.soDienThoai?.trim() || null);
    taiKhoanRequest.input('DiaChi', sql.NVarChar(255), data.diaChi?.trim() || null);
    taiKhoanRequest.input('NgaySinh', sql.Date, data.ngaySinh ? new Date(data.ngaySinh) : null);
    taiKhoanRequest.input('GioiTinh', sql.NVarChar(10), data.gioiTinh?.trim() || null);
    taiKhoanRequest.input('TrangThai', sql.VarChar(50), 'hoat_dong');

    const taiKhoanInsert = await taiKhoanRequest.query<{ MaTaiKhoan: number }>(`
      INSERT INTO TaiKhoan (
        HoTen, Email, MatKhauMaHoa, SoDienThoai, DiaChi, NgaySinh, GioiTinh, VaiTro, TrangThai, NgayTao, NgayCapNhat
      )
      OUTPUT INSERTED.MaTaiKhoan
      VALUES (
        @HoTen, @Email, @MatKhauMaHoa, @SoDienThoai, @DiaChi, @NgaySinh, @GioiTinh, 'hoc_vien', @TrangThai, SYSDATETIME(), SYSDATETIME()
      )
    `);

    const newMaTaiKhoan = taiKhoanInsert.recordset[0]?.MaTaiKhoan;
    if (!newMaTaiKhoan) {
      throw new Error('Không thể lấy mã tài khoản sau khi tạo.');
    }

    // 2. Tạo bản ghi HocVien
    const hocVienRequest = new sql.Request(transaction);
    const studentStatus: StudentStatus = data.trangThai || 'hoat_dong';
    const ngayThamGia = data.ngayThamGia ? new Date(data.ngayThamGia) : new Date();

    hocVienRequest.input('MaTaiKhoan', sql.Int, newMaTaiKhoan);
    hocVienRequest.input('MaSoHocVien', sql.VarChar(30), cleanMaSoHocVien);
    hocVienRequest.input('NgayThamGia', sql.Date, ngayThamGia);
    hocVienRequest.input('TrangThai', sql.VarChar(20), studentStatus);
    hocVienRequest.input('GhiChu', sql.NVarChar(sql.MAX), data.ghiChu?.trim() || null);

    const hocVienInsert = await hocVienRequest.query<{ MaHocVien: number }>(`
      INSERT INTO HocVien (
        MaTaiKhoan, MaSoHocVien, NgayThamGia, TrangThai, GhiChu
      )
      OUTPUT INSERTED.MaHocVien
      VALUES (
        @MaTaiKhoan, @MaSoHocVien, @NgayThamGia, @TrangThai, @GhiChu
      )
    `);

    const newMaHocVien = hocVienInsert.recordset[0]?.MaHocVien;

    await transaction.commit();

    const createdStudent = await getStudentById(newMaHocVien);
    if (!createdStudent) {
      throw new Error('Không tìm thấy học viên vừa tạo.');
    }

    return createdStudent;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Cập nhật thông tin học viên bằng SQL Transaction
 */
export async function updateStudent(
  maHocVien: number,
  data: UpdateStudentInput
): Promise<StudentItem> {
  const existing = await getStudentById(maHocVien);
  if (!existing) {
    throw new Error('Học viên không tồn tại trong hệ thống.');
  }

  const cleanMaSoHocVien = data.maSoHocVien.trim().toUpperCase();

  // Kiểm tra trùng Mã số học viên với người khác
  if (await isMaSoHocVienTaken(cleanMaSoHocVien, maHocVien)) {
    throw new Error(`Mã số học viên "${cleanMaSoHocVien}" đã được dùng bởi học viên khác.`);
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    const studentStatus: StudentStatus = data.trangThai || existing.trangThai;

    // 1. Cập nhật bảng TaiKhoan
    const taiKhoanRequest = new sql.Request(transaction);
    taiKhoanRequest.input('MaTaiKhoan', sql.Int, existing.maTaiKhoan);
    taiKhoanRequest.input('HoTen', sql.NVarChar(150), data.hoTen.trim());
    taiKhoanRequest.input('SoDienThoai', sql.VarChar(20), data.soDienThoai?.trim() || null);
    taiKhoanRequest.input('DiaChi', sql.NVarChar(255), data.diaChi?.trim() || null);
    taiKhoanRequest.input('NgaySinh', sql.Date, data.ngaySinh ? new Date(data.ngaySinh) : null);
    taiKhoanRequest.input('GioiTinh', sql.NVarChar(10), data.gioiTinh?.trim() || null);

    // Đồng bộ trạng thái tài khoản: Nếu học viên ngưng hoạt động -> tài khoản ngưng hoạt động
    const accountStatus = studentStatus === 'ngung_hoat_dong' ? 'ngung_hoat_dong' : 'hoat_dong';
    taiKhoanRequest.input('TrangThai', sql.VarChar(50), accountStatus);

    await taiKhoanRequest.query(`
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

    // 2. Cập nhật bảng HocVien
    const hocVienRequest = new sql.Request(transaction);
    hocVienRequest.input('MaHocVien', sql.Int, maHocVien);
    hocVienRequest.input('MaSoHocVien', sql.VarChar(30), cleanMaSoHocVien);
    hocVienRequest.input('NgayThamGia', sql.Date, data.ngayThamGia ? new Date(data.ngayThamGia) : null);
    hocVienRequest.input('TrangThai', sql.VarChar(20), studentStatus);
    hocVienRequest.input('GhiChu', sql.NVarChar(sql.MAX), data.ghiChu?.trim() || null);

    await hocVienRequest.query(`
      UPDATE HocVien
      SET
        MaSoHocVien = @MaSoHocVien,
        NgayThamGia = @NgayThamGia,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu
      WHERE MaHocVien = @MaHocVien
    `);

    await transaction.commit();

    const updated = await getStudentById(maHocVien);
    if (!updated) {
      throw new Error('Lỗi truy xuất dữ liệu sau khi cập nhật.');
    }

    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Đổi trạng thái học viên (hoat_dong / tam_dung / ngung_hoat_dong)
 */
export async function updateStudentStatus(
  maHocVien: number,
  newStatus: StudentStatus
): Promise<StudentItem> {
  const existing = await getStudentById(maHocVien);
  if (!existing) {
    throw new Error('Học viên không tồn tại.');
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // Cập nhật trạng thái HocVien
    const hvReq = new sql.Request(transaction);
    hvReq.input('MaHocVien', sql.Int, maHocVien);
    hvReq.input('TrangThai', sql.VarChar(20), newStatus);
    await hvReq.query(`
      UPDATE HocVien
      SET TrangThai = @TrangThai
      WHERE MaHocVien = @MaHocVien
    `);

    // Đồng bộ trạng thái TaiKhoan
    const tkReq = new sql.Request(transaction);
    const accountStatus = newStatus === 'ngung_hoat_dong' ? 'ngung_hoat_dong' : 'hoat_dong';
    tkReq.input('MaTaiKhoan', sql.Int, existing.maTaiKhoan);
    tkReq.input('TrangThai', sql.VarChar(50), accountStatus);
    await tkReq.query(`
      UPDATE TaiKhoan
      SET TrangThai = @TrangThai, NgayCapNhat = SYSDATETIME()
      WHERE MaTaiKhoan = @MaTaiKhoan
    `);

    await transaction.commit();

    const updated = await getStudentById(maHocVien);
    if (!updated) throw new Error('Không tìm thấy học viên sau khi đổi trạng thái.');
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
