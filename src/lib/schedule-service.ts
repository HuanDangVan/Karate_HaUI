import { getCoachIdByUserId } from '@/lib/coach-class-service';
import { getConnection, sql } from '@/lib/db';
import type {
    ScheduleItem,
    ScheduleStatus,
    CreateScheduleInput,
    UpdateScheduleInput,
    ScheduleClassOption,
} from '@/types/schedule';

interface RawScheduleRow {
    MaLichTap: number;
    MaLop: number;
    MaSoLop: string;
    TenLop: string;
    NgayTap: Date | string;
    GioBatDau: string;
    GioKetThuc: string;
    DiaDiem: string | null;
    NoiDung: string | null;
    TrangThai: ScheduleStatus;
    NgayTao: Date | string;
}

interface ScheduleFilters {
    search?: string;
    status?: string;
    maLop?: number;
    fromDate?: string;
    toDate?: string;
}

const SCHEDULE_SELECT = `
  SELECT
    lt.MaLichTap,
    lt.MaLop,
    lh.MaSoLop,
    lh.TenLop,
    lt.NgayTap,
    CONVERT(VARCHAR(8), lt.GioBatDau, 108) AS GioBatDau,
    CONVERT(VARCHAR(8), lt.GioKetThuc, 108) AS GioKetThuc,
    lt.DiaDiem,
    lt.NoiDung,
    lt.TrangThai,
    lt.NgayTao
  FROM LichTap lt
  INNER JOIN LopHoc lh ON lt.MaLop = lh.MaLop
`;

function mapSchedule(row: RawScheduleRow): ScheduleItem {
    return {
        maLichTap: row.MaLichTap,
        maLop: row.MaLop,
        maSoLop: row.MaSoLop,
        tenLop: row.TenLop,
        ngayTap:
            row.NgayTap instanceof Date
                ? row.NgayTap.toISOString().split('T')[0]
                : String(row.NgayTap).split('T')[0],
        gioBatDau: row.GioBatDau,
        gioKetThuc: row.GioKetThuc,
        diaDiem: row.DiaDiem,
        noiDung: row.NoiDung,
        trangThai: row.TrangThai,
        ngayTao:
            row.NgayTao instanceof Date
                ? row.NgayTao.toISOString()
                : String(row.NgayTao),
    };
}

// Lấy danh sách lịch tập
export async function getAllSchedules(filters: ScheduleFilters = {}) {
    const pool = await getConnection();

    const request = pool.request();

    let query = SCHEDULE_SELECT + ' WHERE 1 = 1';

    if (filters.search?.trim()) {
        request.input('search', sql.NVarChar(200), `%${filters.search.trim()}%`);
        query += `
      AND (
        lh.MaSoLop LIKE @search
        OR lh.TenLop LIKE @search
        OR lt.DiaDiem LIKE @search
        OR lt.NoiDung LIKE @search
      )
    `;
    }

    if (filters.status) {
        request.input('status', sql.VarChar(20), filters.status);
        query += ' AND lt.TrangThai = @status';
    }

    if (filters.maLop) {
        request.input('maLop', sql.Int, filters.maLop);
        query += ' AND lt.MaLop = @maLop';
    }

    if (filters.fromDate) {
        request.input('fromDate', sql.Date, filters.fromDate);
        query += ' AND lt.NgayTap >= @fromDate';
    }

    if (filters.toDate) {
        request.input('toDate', sql.Date, filters.toDate);
        query += ' AND lt.NgayTap <= @toDate';
    }

    query += ' ORDER BY lt.NgayTap DESC, lt.GioBatDau ASC';

    const result = await request.query(query);

    return (result.recordset as RawScheduleRow[]).map(mapSchedule);
}

// Lấy chi tiết một lịch tập
export async function getScheduleById(id: number) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`${SCHEDULE_SELECT} WHERE lt.MaLichTap = @id`);

    const row = result.recordset[0] as RawScheduleRow | undefined;

    return row ? mapSchedule(row) : null;
}

// Lấy danh sách lớp học đang hoạt động
export async function getAvailableScheduleClasses(): Promise<ScheduleClassOption[]> {
    const pool = await getConnection();

    const result = await pool.request().query(`
    SELECT MaLop, MaSoLop, TenLop
    FROM LopHoc
    WHERE TrangThai = 'hoat_dong'
    ORDER BY TenLop ASC
  `);

    return result.recordset.map((row) => ({
        maLop: row.MaLop,
        maSoLop: row.MaSoLop,
        tenLop: row.TenLop,
    }));
}

// Kiểm tra lớp học có tồn tại và đang hoạt động
async function validateScheduleClass(maLop: number) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input('maLop', sql.Int, maLop)
        .query(`
      SELECT MaLop
      FROM LopHoc
      WHERE MaLop = @maLop
        AND TrangThai = 'hoat_dong'
    `);

    if (result.recordset.length === 0) {
        throw new Error('Lớp học không tồn tại hoặc đã ngừng hoạt động.');
    }
}

// Kiểm tra giờ tập
function validateScheduleTime(gioBatDau: string, gioKetThuc: string) {
    if (!gioBatDau || !gioKetThuc || gioKetThuc <= gioBatDau) {
        throw new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
    }
}

// Thêm lịch tập
export async function createSchedule(input: CreateScheduleInput) {
    validateScheduleTime(input.gioBatDau, input.gioKetThuc);
    await validateScheduleClass(input.maLop);

    const pool = await getConnection();

    const result = await pool
        .request()
        .input('maLop', sql.Int, input.maLop)
        .input('ngayTap', sql.Date, input.ngayTap)
        .input('gioBatDau', sql.Time, input.gioBatDau)
        .input('gioKetThuc', sql.Time, input.gioKetThuc)
        .input('diaDiem', sql.NVarChar(200), input.diaDiem?.trim() || null)
        .input('noiDung', sql.NVarChar(sql.MAX), input.noiDung?.trim() || null)
        .input('trangThai', sql.VarChar(20), input.trangThai || 'da_len_lich')
        .query(`
      INSERT INTO LichTap (
        MaLop,
        NgayTap,
        GioBatDau,
        GioKetThuc,
        DiaDiem,
        NoiDung,
        TrangThai
      )
      OUTPUT INSERTED.MaLichTap
      VALUES (
        @maLop,
        @ngayTap,
        @gioBatDau,
        @gioKetThuc,
        @diaDiem,
        @noiDung,
        @trangThai
      )
    `);

    return getScheduleById(result.recordset[0].MaLichTap);
}

// Cập nhật thông tin lịch tập
export async function updateSchedule(id: number, input: UpdateScheduleInput) {
    validateScheduleTime(input.gioBatDau, input.gioKetThuc);
    await validateScheduleClass(input.maLop);

    const pool = await getConnection();

    const existing = await getScheduleById(id);

    if (!existing) {
        throw new Error('Không tìm thấy lịch tập.');
    }

    await pool
        .request()
        .input('id', sql.Int, id)
        .input('maLop', sql.Int, input.maLop)
        .input('ngayTap', sql.Date, input.ngayTap)
        .input('gioBatDau', sql.Time, input.gioBatDau)
        .input('gioKetThuc', sql.Time, input.gioKetThuc)
        .input('diaDiem', sql.NVarChar(200), input.diaDiem?.trim() || null)
        .input('noiDung', sql.NVarChar(sql.MAX), input.noiDung?.trim() || null)
        .input('trangThai', sql.VarChar(20), input.trangThai || existing.trangThai)
        .query(`
      UPDATE LichTap
      SET
        MaLop = @maLop,
        NgayTap = @ngayTap,
        GioBatDau = @gioBatDau,
        GioKetThuc = @gioKetThuc,
        DiaDiem = @diaDiem,
        NoiDung = @noiDung,
        TrangThai = @trangThai
      WHERE MaLichTap = @id
    `);

    return getScheduleById(id);
}

// Cập nhật trạng thái lịch tập
export async function updateScheduleStatus(
    id: number,
    status: ScheduleStatus
) {
    const pool = await getConnection();

    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .input('status', sql.VarChar(20), status)
        .query(`
      UPDATE LichTap
      SET TrangThai = @status
      WHERE MaLichTap = @id
    `);

    if (result.rowsAffected[0] === 0) {
        throw new Error('Không tìm thấy lịch tập.');
    }

    return getScheduleById(id);
}
// Lấy lịch tập của các lớp do huấn luyện viên phụ trách
export async function getCoachSchedules(
    userId: number,
    filters: ScheduleFilters = {},
): Promise<ScheduleItem[]> {
    const coachId = await getCoachIdByUserId(userId);
    const pool = await getConnection();
    const request = pool.request();

    request.input('coachId', sql.Int, coachId);

    let query = `
        ${SCHEDULE_SELECT}
        WHERE lh.MaHuanLuyenVien = @coachId
    `;

    if (filters.search?.trim()) {
        request.input(
            'search',
            sql.NVarChar(200),
            `%${filters.search.trim()}%`,
        );

        query += `
            AND (
                lh.MaSoLop LIKE @search
                OR lh.TenLop LIKE @search
                OR lt.DiaDiem LIKE @search
                OR lt.NoiDung LIKE @search
            )
        `;
    }

    if (filters.status) {
        request.input('status', sql.VarChar(20), filters.status);
        query += ' AND lt.TrangThai = @status';
    }

    if (filters.maLop) {
        request.input('maLop', sql.Int, filters.maLop);
        query += ' AND lt.MaLop = @maLop';
    }

    if (filters.fromDate) {
        request.input('fromDate', sql.Date, filters.fromDate);
        query += ' AND lt.NgayTap >= @fromDate';
    }

    if (filters.toDate) {
        request.input('toDate', sql.Date, filters.toDate);
        query += ' AND lt.NgayTap <= @toDate';
    }

    query += `
        ORDER BY lt.NgayTap ASC, lt.GioBatDau ASC
    `;

    const result = await request.query(query);

    return (result.recordset as RawScheduleRow[]).map(mapSchedule);
}
// Kiểm tra huấn luyện viên có phụ trách lớp học hay không
export async function validateCoachScheduleClass(
    userId: number,
    maLop: number,
): Promise<void> {
    const coachId = await getCoachIdByUserId(userId);
    const pool = await getConnection();

    const result = await pool
        .request()
        .input('coachId', sql.Int, coachId)
        .input('maLop', sql.Int, maLop)
        .query(`
            SELECT MaLop
            FROM LopHoc
            WHERE MaLop = @maLop
              AND MaHuanLuyenVien = @coachId
              AND TrangThai = 'hoat_dong'
        `);

    if (result.recordset.length === 0) {
        throw new Error(
            'Bạn không được phân công phụ trách lớp học này.'
        );
    }
}

// Kiểm tra lịch tập có thuộc lớp HLV phụ trách hay không
export async function validateCoachSchedule(
    userId: number,
    maLichTap: number,
): Promise<void> {
    const schedule = await getScheduleById(maLichTap);

    if (!schedule) {
        throw new Error('Không tìm thấy lịch tập.');
    }

    await validateCoachScheduleClass(userId, schedule.maLop);
}