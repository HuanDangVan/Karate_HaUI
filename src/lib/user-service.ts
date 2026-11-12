import { getConnection, sql } from '@/lib/db';
import { UserRole, AccountStatus } from '@/types/auth';

export interface DbUserRecord {
  MaTaiKhoan: number;
  HoTen: string;
  Email: string;
  MatKhauMaHoa: string;
  VaiTro: UserRole;
  TrangThai: AccountStatus;
  AnhDaiDien: string | null;
  SoDienThoai: string | null;
}

/**
 * Tìm tài khoản theo Email từ database SQL Server KarateClub
 */
export async function findUserByEmail(email: string): Promise<DbUserRecord | null> {
  const pool = await getConnection();
  const request = pool.request();

  const cleanEmail = email.trim().toLowerCase();
  request.input('email', sql.VarChar(255), cleanEmail);

  const result = await request.query<DbUserRecord>(`
    SELECT TOP 1
      MaTaiKhoan,
      HoTen,
      Email,
      MatKhauMaHoa,
      VaiTro,
      TrangThai,
      AnhDaiDien,
      SoDienThoai
    FROM TaiKhoan
    WHERE LOWER(LTRIM(RTRIM(Email))) = LOWER(@email)
  `);

  if (!result.recordset || result.recordset.length === 0) {
    return null;
  }

  return result.recordset[0];
}

/**
 * Lấy thông tin tài khoản theo ID (không kèm mật khẩu)
 */
/**
 * Lấy đầy đủ thông tin tài khoản theo ID (không kèm mật khẩu)
 */
export async function findUserById(id: number) {
  const pool = await getConnection();
  const request = pool.request();

  request.input('id', sql.Int, id);

  const result = await request.query(`
    SELECT TOP 1
      MaTaiKhoan,
      HoTen,
      Email,
      VaiTro,
      TrangThai,
      AnhDaiDien,
      SoDienThoai,
      DiaChi,
      NgaySinh,
      GioiTinh
    FROM TaiKhoan
    WHERE MaTaiKhoan = @id
  `);

  if (!result.recordset || result.recordset.length === 0) {
    return null;
  }

  return result.recordset[0];
}
export interface UpdateUserProfileInput {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  ngaySinh: string | null;
  gioiTinh: string | null;
}

/**
 * Cập nhật thông tin cá nhân tài khoản
 */
export async function updateUserProfile(
  input: UpdateUserProfileInput
): Promise<boolean> {
  const pool = await getConnection();

  const result = await pool.request()
    .input('id', sql.Int, input.id)
    .input('hoTen', sql.NVarChar(100), input.hoTen.trim())
    .input('email', sql.VarChar(255), input.email.trim().toLowerCase())
    .input('soDienThoai', sql.VarChar(20), input.soDienThoai.trim())
    .input('diaChi', sql.NVarChar(255), input.diaChi.trim())
    .input('ngaySinh', sql.Date, input.ngaySinh || null)
    .input('gioiTinh', sql.NVarChar(20), input.gioiTinh || null)
    .query(`
      UPDATE TaiKhoan
      SET
        HoTen = @hoTen,
        Email = @email,
        SoDienThoai = @soDienThoai,
        DiaChi = @diaChi,
        NgaySinh = @ngaySinh,
        GioiTinh = @gioiTinh,
        NgayCapNhat = GETDATE()
      WHERE MaTaiKhoan = @id;

      SELECT @@ROWCOUNT AS SoDong;
    `);

  return Number(result.recordset[0]?.SoDong || 0) > 0;
}