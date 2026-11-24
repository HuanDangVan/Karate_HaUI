import { getConnection, sql } from '@/lib/db';
import type { UserRole } from '@/types/auth';
import type {
  AttendanceSessionOption,
  AttendanceStudentItem,
  AttendanceStatus,
  SaveAttendanceInput,
} from '@/types/attendance';

// Lấy danh sách buổi tập
export async function getAttendanceSessions(
  role: UserRole,
  userId: number,
): Promise<AttendanceSessionOption[]> {
  const pool = await getConnection();

  const request = pool.request()
    .input('role', sql.VarChar(30), role)
    .input('userId', sql.Int, userId);

  const result = await request.query(`
    SELECT
      lt.MaLichTap AS maLichTap,
      lt.MaLop AS maLop,
      lh.MaSoLop AS maSoLop,
      lh.TenLop AS tenLop,
      CONVERT(VARCHAR(10), lt.NgayTap, 23) AS ngayTap,
      CONVERT(VARCHAR(8), lt.GioBatDau, 108) AS gioBatDau,
      CONVERT(VARCHAR(8), lt.GioKetThuc, 108) AS gioKetThuc,
      lt.DiaDiem AS diaDiem
    FROM LichTap lt
    INNER JOIN LopHoc lh ON lt.MaLop = lh.MaLop
    LEFT JOIN HuanLuyenVien hlv
      ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
    WHERE lt.TrangThai <> 'da_huy'
      AND lh.TrangThai = 'hoat_dong'
      AND (
        @role = 'quan_tri_vien'
        OR (
          @role = 'huan_luyen_vien'
          AND hlv.MaTaiKhoan = @userId
        )
      )
    ORDER BY lt.NgayTap DESC, lt.GioBatDau DESC
  `);

  return result.recordset as AttendanceSessionOption[];
}

// Lấy danh sách học viên và trạng thái điểm danh của một buổi
export async function getAttendanceStudents(
  maLichTap: number,
  role: UserRole,
  userId: number,
): Promise<AttendanceStudentItem[]> {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input('maLichTap', sql.Int, maLichTap)
    .input('role', sql.VarChar(30), role)
    .input('userId', sql.Int, userId)
    .query(`
      SELECT
        hv.MaHocVien AS maHocVien,
        tk.MaTaiKhoan AS maTaiKhoan,
        hv.MaSoHocVien AS maSoHocVien,
        tk.HoTen AS hoTen,
        tk.AnhDaiDien AS anhDaiDien,
        hv.TrangThai AS trangThaiHocVien,
        dd.TrangThai AS trangThaiDiemDanh,
        dd.GhiChu AS ghiChu,
        CONVERT(VARCHAR(19), dd.ThoiGianDiemDanh, 120)
          AS thoiGianDiemDanh
      FROM LichTap lt
      INNER JOIN LopHoc lh ON lt.MaLop = lh.MaLop
      INNER JOIN HocVien_LopHoc hvl ON lt.MaLop = hvl.MaLop
      INNER JOIN HocVien hv ON hvl.MaHocVien = hv.MaHocVien
      INNER JOIN TaiKhoan tk ON hv.MaTaiKhoan = tk.MaTaiKhoan
      LEFT JOIN DiemDanh dd
        ON dd.MaLichTap = lt.MaLichTap
        AND dd.MaHocVien = hv.MaHocVien
      LEFT JOIN HuanLuyenVien hlv
        ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
      WHERE lt.MaLichTap = @maLichTap
        AND lt.TrangThai <> 'da_huy'
        AND hv.TrangThai = 'hoat_dong'
        AND tk.TrangThai = 'hoat_dong'
        AND (
          @role = 'quan_tri_vien'
          OR (
            @role = 'huan_luyen_vien'
            AND hlv.MaTaiKhoan = @userId
          )
        )
      ORDER BY tk.HoTen ASC
    `);

  return result.recordset as AttendanceStudentItem[];
}

// Lưu điểm danh cho một buổi tập
export async function saveAttendance(
  input: SaveAttendanceInput,
  nguoiDiemDanh: number,
  role: UserRole,
): Promise<void> {
  const pool = await getConnection();

  const transaction = new sql.Transaction(pool);

  const validStatuses: AttendanceStatus[] = [
    'co_mat',
    'vang',
    'di_muon',
    'co_phep',
  ];

  if (!Number.isInteger(input.maLichTap) || input.maLichTap <= 0) {
    throw new Error('Mã lịch tập không hợp lệ.');
  }

  if (!Array.isArray(input.danhSach)) {
    throw new Error('Danh sách điểm danh không hợp lệ.');
  }

  const seenStudents = new Set<number>();

  for (const item of input.danhSach) {
    if (
      !Number.isInteger(item.maHocVien) ||
      item.maHocVien <= 0 ||
      !validStatuses.includes(item.trangThai) ||
      seenStudents.has(item.maHocVien)
    ) {
      throw new Error('Thông tin điểm danh không hợp lệ.');
    }

    seenStudents.add(item.maHocVien);
  }

  await transaction.begin();

  try {
    const checkRequest = new sql.Request(transaction);

    const sessionResult = await checkRequest
      .input('maLichTap', sql.Int, input.maLichTap)
      .input('role', sql.VarChar(30), role)
      .input('nguoiDiemDanh', sql.Int, nguoiDiemDanh)
      .query(`
    SELECT
        lt.MaLichTap,
        lt.MaLop,
        MONTH(lt.NgayTap) AS Thang,
        YEAR(lt.NgayTap) AS Nam
    FROM LichTap lt
        INNER JOIN LopHoc lh ON lt.MaLop = lh.MaLop
        LEFT JOIN HuanLuyenVien hlv
          ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
        WHERE lt.MaLichTap = @maLichTap
          AND lt.TrangThai <> 'da_huy'
          AND (
            @role = 'quan_tri_vien'
            OR (
              @role = 'huan_luyen_vien'
              AND hlv.MaTaiKhoan = @nguoiDiemDanh
            )
          )
      `);

    if (sessionResult.recordset.length === 0) {
      throw new Error('Buổi tập không tồn tại hoặc đã bị hủy.');
    }
    const session = sessionResult.recordset[0];
    for (const item of input.danhSach) {
      // Kiểm tra học viên có thuộc lớp của buổi tập không
      const studentCheck = await new sql.Request(transaction)
        .input('maLichTap', sql.Int, input.maLichTap)
        .input('maHocVien', sql.Int, item.maHocVien)
        .query(`
      SELECT hv.MaHocVien
      FROM LichTap lt
      INNER JOIN HocVien_LopHoc hvl
        ON lt.MaLop = hvl.MaLop
      INNER JOIN HocVien hv
        ON hvl.MaHocVien = hv.MaHocVien
      INNER JOIN TaiKhoan tk
        ON hv.MaTaiKhoan = tk.MaTaiKhoan
      WHERE lt.MaLichTap = @maLichTap
        AND hv.MaHocVien = @maHocVien
        AND hv.TrangThai = 'hoat_dong'
        AND tk.TrangThai = 'hoat_dong'
    `);

      if (studentCheck.recordset.length === 0) {
        throw new Error(
          `Học viên mã ${item.maHocVien} không thuộc buổi tập này hoặc đã ngừng hoạt động.`,
        );
      }

      const request = new sql.Request(transaction);

      await request
        .input('maLichTap', sql.Int, input.maLichTap)
        .input('maHocVien', sql.Int, item.maHocVien)
        .input('trangThai', sql.VarChar(20), item.trangThai)
        .input('ghiChu', sql.NVarChar(sql.MAX), item.ghiChu || null)
        .input('nguoiDiemDanh', sql.Int, nguoiDiemDanh)
        .query(`
          IF EXISTS (
            SELECT 1
            FROM DiemDanh
            WHERE MaLichTap = @maLichTap
              AND MaHocVien = @maHocVien
          )
          BEGIN
            UPDATE DiemDanh
            SET
              TrangThai = @trangThai,
              GhiChu = @ghiChu,
              NguoiDiemDanh = @nguoiDiemDanh,
              ThoiGianDiemDanh = SYSDATETIME()
            WHERE MaLichTap = @maLichTap
              AND MaHocVien = @maHocVien
          END
          ELSE
          BEGIN
            INSERT INTO DiemDanh (
              MaLichTap,
              MaHocVien,
              TrangThai,
              GhiChu,
              NguoiDiemDanh,
              ThoiGianDiemDanh
            )
            VALUES (
              @maLichTap,
              @maHocVien,
              @trangThai,
              @ghiChu,
              @nguoiDiemDanh,
              SYSDATETIME()
            )
          END
        `);
    }
    // Tự động tính lại học phí cho các học viên vừa điểm danh
    for (const item of input.danhSach) {
      const tuitionRequest = new sql.Request(transaction);

      await tuitionRequest
        .input('MaHocVien', sql.Int, item.maHocVien)
        .input('MaLop', sql.Int, session.MaLop)
        .input('Thang', sql.Int, session.Thang)
        .input('Nam', sql.Int, session.Nam)
        .execute('sp_TinhHocPhi');
    }

    // Hoàn tất giao dịch
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}