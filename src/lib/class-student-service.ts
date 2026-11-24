
import { getConnection, sql } from '@/lib/db';

export interface ClassStudentItem {
  maHocVien: number;
  maSoHocVien: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  ngayDangKy: string | null;
  trangThaiDangKy: string;
}

interface RawClassStudent {
  MaHocVien: number;
  MaSoHocVien: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string | null;
  NgayDangKy: Date | null;
  TrangThaiDangKy: string;
}

function mapStudent(row: RawClassStudent): ClassStudentItem {
  return {
    maHocVien: row.MaHocVien,
    maSoHocVien: row.MaSoHocVien,
    hoTen: row.HoTen,
    email: row.Email,
    soDienThoai: row.SoDienThoai,
    ngayDangKy: row.NgayDangKy
      ? new Date(row.NgayDangKy).toISOString().split('T')[0]
      : null,
    trangThaiDangKy: row.TrangThaiDangKy,
  };
}

// Lấy danh sách học viên đã thuộc lớp
export async function getClassStudents(
  maLop: number
): Promise<ClassStudentItem[]> {
  const pool = await getConnection();
  const request = pool.request();

  request.input('maLop', sql.Int, maLop);

  const result = await request.query<RawClassStudent>(`
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
    ORDER BY tk.HoTen ASC
  `);

  return result.recordset.map(mapStudent);
}

// Lấy danh sách học viên hoạt động chưa thuộc lớp
export async function getAvailableStudents(
  maLop: number,
  search?: string
): Promise<ClassStudentItem[]> {
  const pool = await getConnection();
  const request = pool.request();

  request.input('maLop', sql.Int, maLop);
  request.input(
    'searchPattern',
    sql.NVarChar(255),
    search?.trim() ? `%${search.trim()}%` : null
  );

  const result = await request.query<RawClassStudent>(`
    SELECT
      hv.MaHocVien,
      hv.MaSoHocVien,
      tk.HoTen,
      tk.Email,
      tk.SoDienThoai,
      NULL AS NgayDangKy,
      'chua_phan_lop' AS TrangThaiDangKy
    FROM HocVien hv
    INNER JOIN TaiKhoan tk
      ON hv.MaTaiKhoan = tk.MaTaiKhoan
    WHERE hv.TrangThai = 'hoat_dong'
      AND tk.TrangThai = 'hoat_dong'
      AND tk.VaiTro = 'hoc_vien'
      AND NOT EXISTS (
        SELECT 1
        FROM HocVien_LopHoc hvl
        WHERE hvl.MaLop = @maLop
          AND hvl.MaHocVien = hv.MaHocVien
      )
      AND (
        @searchPattern IS NULL
        OR hv.MaSoHocVien LIKE @searchPattern
        OR tk.HoTen LIKE @searchPattern
        OR tk.Email LIKE @searchPattern
      )
    ORDER BY tk.HoTen ASC
  `);

  return result.recordset.map(mapStudent);
}

// Thêm học viên vào lớp
export async function addStudentToClass(
  maLop: number,
  maHocVien: number
): Promise<void> {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  // SERIALIZABLE giúp tránh hai yêu cầu đồng thời vượt sĩ số tối đa
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

  try {
    const classRequest = new sql.Request(transaction);
    classRequest.input('maLop', sql.Int, maLop);

    const classResult = await classRequest.query<{
      MaLop: number;
      SiSoToiDa: number;
    }>(`
      SELECT MaLop, SiSoToiDa
      FROM LopHoc WITH (UPDLOCK, HOLDLOCK)
      WHERE MaLop = @maLop
    `);

    const classItem = classResult.recordset[0];

    if (!classItem) {
      throw new Error('Lớp học không tồn tại.');
    }

    const studentRequest = new sql.Request(transaction);
    studentRequest.input('maHocVien', sql.Int, maHocVien);

    const studentResult = await studentRequest.query(`
      SELECT hv.MaHocVien
      FROM HocVien hv
      INNER JOIN TaiKhoan tk
        ON hv.MaTaiKhoan = tk.MaTaiKhoan
      WHERE hv.MaHocVien = @maHocVien
        AND hv.TrangThai = 'hoat_dong'
        AND tk.TrangThai = 'hoat_dong'
        AND tk.VaiTro = 'hoc_vien'
    `);

    if (studentResult.recordset.length === 0) {
      throw new Error('Học viên không tồn tại hoặc không hoạt động.');
    }

    const existingRequest = new sql.Request(transaction);
    existingRequest.input('maLop', sql.Int, maLop);
    existingRequest.input('maHocVien', sql.Int, maHocVien);

    const existingResult = await existingRequest.query(`
      SELECT TOP 1 MaDangKy
      FROM HocVien_LopHoc
      WHERE MaLop = @maLop
        AND MaHocVien = @maHocVien
    `);

    if (existingResult.recordset.length > 0) {
      throw new Error('Học viên đã thuộc lớp này.');
    }

    const countRequest = new sql.Request(transaction);
    countRequest.input('maLop', sql.Int, maLop);

    const countResult = await countRequest.query<{
      SiSoHienTai: number;
    }>(`
            SELECT COUNT(*) AS SiSoHienTai
      FROM HocVien_LopHoc
      WHERE MaLop = @maLop
        AND TrangThai = 'dang_hoc'
    `);

    const siSoHienTai = countResult.recordset[0].SiSoHienTai;

    if (siSoHienTai >= classItem.SiSoToiDa) {
      throw new Error('Lớp học đã đạt sĩ số tối đa.');
    }

    const insertRequest = new sql.Request(transaction);
    insertRequest.input('maLop', sql.Int, maLop);
    insertRequest.input('maHocVien', sql.Int, maHocVien);

    await insertRequest.query(`
      INSERT INTO HocVien_LopHoc (MaLop, MaHocVien)
      VALUES (@maLop, @maHocVien)
    `);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Xóa học viên khỏi lớp
export async function removeStudentFromClass(
  maLop: number,
  maHocVien: number
): Promise<void> {
  const pool = await getConnection();
  const request = pool.request();

  request.input('maLop', sql.Int, maLop);
  request.input('maHocVien', sql.Int, maHocVien);

  const result = await request.query(`
    DELETE FROM HocVien_LopHoc
    WHERE MaLop = @maLop
      AND MaHocVien = @maHocVien
  `);

  if (result.rowsAffected[0] === 0) {
    throw new Error('Học viên không thuộc lớp này.');
  }
}
