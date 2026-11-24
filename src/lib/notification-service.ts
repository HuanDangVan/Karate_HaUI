import { getConnection, sql } from '@/lib/db';

export type NotificationRecipientType =
    | 'hoc_vien'
    | 'huan_luyen_vien'
    | 'tat_ca'
    | 'chon_tai_khoan';

export interface CreateNotificationInput {
    tieuDe: string;
    noiDung: string;
    nguoiTao: number;
    loaiNguoiNhan: NotificationRecipientType;
    danhSachTaiKhoan?: number[];
}

export interface NotificationItem {
    maThongBao: number;
    tieuDe: string;
    noiDung: string;
    nguoiTao: number;
    tenNguoiTao: string;
    ngayTao: string;
    tongNguoiNhan: number;
    soNguoiDaDoc: number;
    soNguoiChuaDoc: number;
}

export interface NotificationRecipient {
    maTaiKhoan: number;
    hoTen: string;
    email: string;
    vaiTro: string;
    daDoc: boolean;
    thoiGianDoc: string | null;
}

// Tạo thông báo và lưu danh sách người nhận
export async function createNotification(
    input: CreateNotificationInput
): Promise<number> {
    const tieuDe = input.tieuDe.trim();
    const noiDung = input.noiDung.trim();

    if (!tieuDe || !noiDung) {
        throw new Error('Tiêu đề và nội dung không được để trống.');
    }

    if (tieuDe.length > 100) {
        throw new Error('Tiêu đề không được vượt quá 100 ký tự.');
    }

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

    try {
        // Xác định danh sách tài khoản nhận thông báo
        const recipientRequest = new sql.Request(transaction);

        let recipientQuery = `
      SELECT MaTaiKhoan
      FROM TaiKhoan
      WHERE TrangThai = 'hoat_dong'
    `;

        if (input.loaiNguoiNhan === 'hoc_vien') {
            recipientQuery += ` AND VaiTro = 'hoc_vien'`;
        } else if (input.loaiNguoiNhan === 'huan_luyen_vien') {
            recipientQuery += ` AND VaiTro = 'huan_luyen_vien'`;
        } else if (input.loaiNguoiNhan === 'chon_tai_khoan') {
            const ids = [...new Set(input.danhSachTaiKhoan || [])]
                .filter((id) => Number.isInteger(id) && id > 0);

            if (ids.length === 0) {
                throw new Error('Bạn chưa chọn tài khoản nhận thông báo.');
            }

            const placeholders = ids.map((_, index) => `@id${index}`);

            ids.forEach((id, index) => {
                recipientRequest.input(`id${index}`, sql.Int, id);
            });

            recipientQuery += ` AND MaTaiKhoan IN (${placeholders.join(', ')})`;
        } else if (input.loaiNguoiNhan !== 'tat_ca') {
            throw new Error('Loại người nhận không hợp lệ.');
        }

        const recipientResult = await recipientRequest.query<{
            MaTaiKhoan: number;
        }>(recipientQuery);

        const recipientIds = recipientResult.recordset.map(
            (item) => item.MaTaiKhoan
        );

        if (recipientIds.length === 0) {
            throw new Error('Không tìm thấy tài khoản nhận thông báo phù hợp.');
        }

        // Tạo thông báo
        const notificationRequest = new sql.Request(transaction);

        notificationRequest.input('tieuDe', sql.NVarChar(100), tieuDe);
        notificationRequest.input('noiDung', sql.NVarChar(sql.MAX), noiDung);
        notificationRequest.input('nguoiTao', sql.Int, input.nguoiTao);

        const notificationResult = await notificationRequest.query<{
            MaThongBao: number;
        }>(`
      INSERT INTO ThongBao (TieuDe, NoiDung, NguoiTao)
      OUTPUT INSERTED.MaThongBao
      VALUES (@tieuDe, @noiDung, @nguoiTao)
    `);

        const maThongBao = notificationResult.recordset[0].MaThongBao;

        // Lưu từng người nhận
        for (const maTaiKhoan of recipientIds) {
            const insertRequest = new sql.Request(transaction);

            insertRequest.input('maThongBao', sql.Int, maThongBao);
            insertRequest.input('maTaiKhoan', sql.Int, maTaiKhoan);

            await insertRequest.query(`
        INSERT INTO NguoiNhanThongBao (MaThongBao, MaTaiKhoan)
        VALUES (@maThongBao, @maTaiKhoan)
      `);
        }

        await transaction.commit();

        return maThongBao;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// Lấy danh sách thông báo
export async function getAllNotifications(): Promise<NotificationItem[]> {
    const pool = await getConnection();

    const result = await pool.request().query(`
    SELECT
      tb.MaThongBao,
      tb.TieuDe,
      tb.NoiDung,
      tb.NguoiTao,
      tk.HoTen AS TenNguoiTao,
      tb.NgayTao,
      COUNT(nn.MaNguoiNhan) AS TongNguoiNhan,
      SUM(CASE WHEN nn.DaDoc = 1 THEN 1 ELSE 0 END) AS SoNguoiDaDoc,
      SUM(CASE WHEN nn.DaDoc = 0 THEN 1 ELSE 0 END) AS SoNguoiChuaDoc
    FROM ThongBao tb
    INNER JOIN TaiKhoan tk ON tb.NguoiTao = tk.MaTaiKhoan
    LEFT JOIN NguoiNhanThongBao nn
      ON tb.MaThongBao = nn.MaThongBao
    GROUP BY
      tb.MaThongBao,
      tb.TieuDe,
      tb.NoiDung,
      tb.NguoiTao,
      tk.HoTen,
      tb.NgayTao
    ORDER BY tb.NgayTao DESC
  `);

    return result.recordset.map((row) => ({
        maThongBao: row.MaThongBao,
        tieuDe: row.TieuDe,
        noiDung: row.NoiDung,
        nguoiTao: row.NguoiTao,
        tenNguoiTao: row.TenNguoiTao,
        ngayTao: row.NgayTao
            ? new Date(row.NgayTao).toISOString()
            : '',
        tongNguoiNhan: Number(row.TongNguoiNhan),
        soNguoiDaDoc: Number(row.SoNguoiDaDoc),
        soNguoiChuaDoc: Number(row.SoNguoiChuaDoc),
    }));
}

// Lấy chi tiết một thông báo và danh sách người nhận
export async function getNotificationById(
    maThongBao: number
): Promise<{
    thongBao: NotificationItem;
    nguoiNhan: NotificationRecipient[];
} | null> {
    const pool = await getConnection();

    const notificationResult = await pool.request()
        .input('maThongBao', sql.Int, maThongBao)
        .query(`
      SELECT
        tb.MaThongBao,
        tb.TieuDe,
        tb.NoiDung,
        tb.NguoiTao,
        tk.HoTen AS TenNguoiTao,
        tb.NgayTao,
        COUNT(nn.MaNguoiNhan) AS TongNguoiNhan,
        SUM(CASE WHEN nn.DaDoc = 1 THEN 1 ELSE 0 END) AS SoNguoiDaDoc,
        SUM(CASE WHEN nn.DaDoc = 0 THEN 1 ELSE 0 END) AS SoNguoiChuaDoc
      FROM ThongBao tb
      INNER JOIN TaiKhoan tk ON tb.NguoiTao = tk.MaTaiKhoan
      LEFT JOIN NguoiNhanThongBao nn
        ON tb.MaThongBao = nn.MaThongBao
      WHERE tb.MaThongBao = @maThongBao
      GROUP BY
        tb.MaThongBao,
        tb.TieuDe,
        tb.NoiDung,
        tb.NguoiTao,
        tk.HoTen,
        tb.NgayTao
    `);

    if (notificationResult.recordset.length === 0) {
        return null;
    }

    const row = notificationResult.recordset[0];

    const thongBao: NotificationItem = {
        maThongBao: row.MaThongBao,
        tieuDe: row.TieuDe,
        noiDung: row.NoiDung,
        nguoiTao: row.NguoiTao,
        tenNguoiTao: row.TenNguoiTao,
        ngayTao: row.NgayTao
            ? new Date(row.NgayTao).toISOString()
            : '',
        tongNguoiNhan: Number(row.TongNguoiNhan),
        soNguoiDaDoc: Number(row.SoNguoiDaDoc),
        soNguoiChuaDoc: Number(row.SoNguoiChuaDoc),
    };

    const recipientResult = await pool.request()
        .input('maThongBao', sql.Int, maThongBao)
        .query(`
      SELECT
        tk.MaTaiKhoan,
        tk.HoTen,
        tk.Email,
        tk.VaiTro,
        nn.DaDoc,
        nn.ThoiGianDoc
      FROM NguoiNhanThongBao nn
      INNER JOIN TaiKhoan tk
        ON nn.MaTaiKhoan = tk.MaTaiKhoan
      WHERE nn.MaThongBao = @maThongBao
      ORDER BY tk.HoTen ASC
    `);

    const nguoiNhan: NotificationRecipient[] =
        recipientResult.recordset.map((item) => ({
            maTaiKhoan: item.MaTaiKhoan,
            hoTen: item.HoTen,
            email: item.Email,
            vaiTro: item.VaiTro,
            daDoc: Boolean(item.DaDoc),
            thoiGianDoc: item.ThoiGianDoc
                ? new Date(item.ThoiGianDoc).toISOString()
                : null,
        }));

    return { thongBao, nguoiNhan };
}
// Sửa nội dung thông báo
export async function updateNotification(
    maThongBao: number,
    tieuDe: string,
    noiDung: string
): Promise<boolean> {
    const title = tieuDe.trim();
    const content = noiDung.trim();

    if (!title || !content) {
        throw new Error('Tiêu đề và nội dung không được để trống.');
    }

    if (title.length > 100) {
        throw new Error('Tiêu đề không được vượt quá 100 ký tự.');
    }

    const pool = await getConnection();

    const result = await pool.request()
        .input('maThongBao', sql.Int, maThongBao)
        .input('tieuDe', sql.NVarChar(100), title)
        .input('noiDung', sql.NVarChar(sql.MAX), content)
        .query(`
            UPDATE ThongBao
            SET
                TieuDe = @tieuDe,
                NoiDung = @noiDung
            WHERE MaThongBao = @maThongBao;

            SELECT @@ROWCOUNT AS SoDong;
        `);

    return Number(result.recordset[0]?.SoDong || 0) > 0;
}

// Xóa thông báo
export async function deleteNotification(
    maThongBao: number
): Promise<boolean> {
    const pool = await getConnection();

    const result = await pool.request()
        .input('maThongBao', sql.Int, maThongBao)
        .query(`
            DELETE FROM ThongBao
            WHERE MaThongBao = @maThongBao;

            SELECT @@ROWCOUNT AS SoDong;
        `);

    return Number(result.recordset[0]?.SoDong || 0) > 0;
}
// Đánh dấu một thông báo là đã đọc cho tài khoản hiện tại
export async function markNotificationAsRead(
    maThongBao: number,
    maTaiKhoan: number
): Promise<boolean> {
    const pool = await getConnection();

    const result = await pool.request()
        .input('maThongBao', sql.Int, maThongBao)
        .input('maTaiKhoan', sql.Int, maTaiKhoan)
        .query(`
            UPDATE NguoiNhanThongBao
            SET
                DaDoc = 1,
                ThoiGianDoc = GETDATE()
            WHERE
                MaThongBao = @maThongBao
                AND MaTaiKhoan = @maTaiKhoan
                AND DaDoc = 0;

            SELECT @@ROWCOUNT AS SoDong;
        `);

    return Number(result.recordset[0]?.SoDong || 0) > 0;
}
// Lấy danh sách thông báo dành cho tài khoản hiện tại
export async function getMyNotifications(
    maTaiKhoan: number
): Promise<(NotificationItem & {
    daDoc: boolean;
    thoiGianDoc: string | null;
})[]> {
    const pool = await getConnection();

    const result = await pool.request()
        .input('maTaiKhoan', sql.Int, maTaiKhoan)
        .query(`
            SELECT
                tb.MaThongBao AS maThongBao,
                tb.TieuDe AS tieuDe,
                tb.NoiDung AS noiDung,
                tb.NguoiTao AS nguoiTao,
                tk.HoTen AS tenNguoiTao,
                tb.NgayTao AS ngayTao,
                nn.DaDoc AS daDoc,
                nn.ThoiGianDoc AS thoiGianDoc,
                (
                    SELECT COUNT(*)
                    FROM NguoiNhanThongBao nn2
                    WHERE nn2.MaThongBao = tb.MaThongBao
                ) AS tongNguoiNhan,
                (
                    SELECT COUNT(*)
                    FROM NguoiNhanThongBao nn2
                    WHERE nn2.MaThongBao = tb.MaThongBao
                      AND nn2.DaDoc = 1
                ) AS soNguoiDaDoc,
                (
                    SELECT COUNT(*)
                    FROM NguoiNhanThongBao nn2
                    WHERE nn2.MaThongBao = tb.MaThongBao
                      AND nn2.DaDoc = 0
                ) AS soNguoiChuaDoc
            FROM NguoiNhanThongBao nn
            INNER JOIN ThongBao tb
                ON nn.MaThongBao = tb.MaThongBao
            INNER JOIN TaiKhoan tk
                ON tb.NguoiTao = tk.MaTaiKhoan
            WHERE nn.MaTaiKhoan = @maTaiKhoan
            ORDER BY tb.NgayTao DESC
        `);

    return result.recordset.map((row) => ({
        maThongBao: row.maThongBao,
        tieuDe: row.tieuDe,
        noiDung: row.noiDung,
        nguoiTao: row.nguoiTao,
        tenNguoiTao: row.tenNguoiTao,
        ngayTao: row.ngayTao
            ? new Date(row.ngayTao).toISOString()
            : '',
        tongNguoiNhan: Number(row.tongNguoiNhan),
        soNguoiDaDoc: Number(row.soNguoiDaDoc),
        soNguoiChuaDoc: Number(row.soNguoiChuaDoc),
        daDoc: Boolean(row.daDoc),
        thoiGianDoc: row.thoiGianDoc
            ? new Date(row.thoiGianDoc).toISOString()
            : null,
    }));
}