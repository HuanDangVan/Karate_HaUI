
import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

// GET: Danh sách lớp đang mở đăng ký
export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'hoc_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        const pool = await getConnection();
        const request = pool.request();

        request.input('maTaiKhoan', sql.Int, Number(session.userId));

        const studentResult = await request.query(`
            SELECT MaHocVien
            FROM HocVien
            WHERE MaTaiKhoan = @maTaiKhoan
              AND TrangThai = 'hoat_dong'
        `);

        if (studentResult.recordset.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy hồ sơ học viên hoạt động.' },
                { status: 404 }
            );
        }

        const maHocVien = studentResult.recordset[0].MaHocVien;

        const classRequest = pool.request();
        classRequest.input('maHocVien', sql.Int, maHocVien);

        const result = await classRequest.query(`
            SELECT
                lh.MaLop AS maLop,
                lh.MaSoLop AS maSoLop,
                lh.TenLop AS tenLop,
                lh.MoTa AS moTa,
                lh.CapDo AS capDo,
                lh.SiSoToiDa AS siSoToiDa,
                ISNULL(ss.SiSoHienTai, 0) AS siSoHienTai,
                lh.DonGiaMoiBuoi AS donGiaMoiBuoi,
                hlv.HoTenHLV AS tenHuanLuyenVien,
                hvl.TrangThai AS trangThaiDangKy,
                hvl.NgayDangKy AS ngayDangKy
            FROM LopHoc lh
            LEFT JOIN (
                SELECT MaLop, COUNT(*) AS SiSoHienTai
                FROM HocVien_LopHoc
                WHERE TrangThai = 'dang_hoc'
                GROUP BY MaLop
            ) ss ON lh.MaLop = ss.MaLop
            LEFT JOIN (
                SELECT
                    h.MaLop,
                    h.TrangThai,
                    h.NgayDangKy
                FROM HocVien_LopHoc h
                WHERE h.MaHocVien = @maHocVien
            ) hvl ON lh.MaLop = hvl.MaLop
            LEFT JOIN (
                SELECT
                    lh2.MaLop,
                    tk.HoTen AS HoTenHLV
                FROM LopHoc lh2
                LEFT JOIN HuanLuyenVien hlv
                    ON lh2.MaHuanLuyenVien = hlv.MaHuanLuyenVien
                LEFT JOIN TaiKhoan tk
                    ON hlv.MaTaiKhoan = tk.MaTaiKhoan
            ) hlv ON lh.MaLop = hlv.MaLop
            WHERE lh.TrangThai = 'hoat_dong'
            ORDER BY lh.TenLop ASC
        `);

        return NextResponse.json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error('GET /api/student/classes:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Lỗi khi lấy danh sách lớp học.',
            },
            { status: 500 }
        );
    }
}

// POST: Học viên gửi yêu cầu đăng ký lớp
export async function POST(request: NextRequest) {
    const transaction = null;

    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn chưa đăng nhập.' },
                { status: 401 }
            );
        }

        if (session.role !== 'hoc_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền đăng ký lớp.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const maLop = Number(body.maLop);

        if (!Number.isInteger(maLop) || maLop < 1) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const pool = await getConnection();
        const tx = new sql.Transaction(pool);

        await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        try {
            const studentRequest = new sql.Request(tx);
            studentRequest.input('maTaiKhoan', sql.Int, Number(session.userId));

            const studentResult = await studentRequest.query(`
                SELECT hv.MaHocVien
                FROM HocVien hv
                INNER JOIN TaiKhoan tk
                    ON hv.MaTaiKhoan = tk.MaTaiKhoan
                WHERE hv.MaTaiKhoan = @maTaiKhoan
                  AND hv.TrangThai = 'hoat_dong'
                  AND tk.TrangThai = 'hoat_dong'
                  AND tk.VaiTro = 'hoc_vien'
            `);

            if (studentResult.recordset.length === 0) {
                throw new Error('Không tìm thấy hồ sơ học viên hoạt động.');
            }

            const maHocVien = studentResult.recordset[0].MaHocVien;

            const classRequest = new sql.Request(tx);
            classRequest.input('maLop', sql.Int, maLop);

            const classResult = await classRequest.query(`
                SELECT MaLop, SiSoToiDa
                FROM LopHoc WITH (UPDLOCK, HOLDLOCK)
                WHERE MaLop = @maLop
                  AND TrangThai = 'hoat_dong'
            `);

            if (classResult.recordset.length === 0) {
                throw new Error('Lớp học không tồn tại hoặc không hoạt động.');
            }

            const existingRequest = new sql.Request(tx);
            existingRequest.input('maLop', sql.Int, maLop);
            existingRequest.input('maHocVien', sql.Int, maHocVien);

            const existingResult = await existingRequest.query(`
                SELECT TOP 1 MaDangKy, TrangThai
                FROM HocVien_LopHoc WITH (UPDLOCK, HOLDLOCK)
                WHERE MaLop = @maLop
                  AND MaHocVien = @maHocVien
            `);

            if (existingResult.recordset.length > 0) {
                throw new Error('Bạn đã đăng ký hoặc đã thuộc lớp này.');
            }

            const countRequest = new sql.Request(tx);
            countRequest.input('maLop', sql.Int, maLop);

            const countResult = await countRequest.query(`
                SELECT COUNT(*) AS SiSoHienTai
                FROM HocVien_LopHoc
                WHERE MaLop = @maLop
                AND TrangThai = 'dang_hoc'
            `);

            const siSo = countResult.recordset[0].SiSoHienTai;
            const siSoToiDa = classResult.recordset[0].SiSoToiDa;

            if (siSo >= siSoToiDa) {
                throw new Error('Lớp học đã đạt sĩ số tối đa.');
            }

            const insertRequest = new sql.Request(tx);
            insertRequest.input('maLop', sql.Int, maLop);
            insertRequest.input('maHocVien', sql.Int, maHocVien);

            await insertRequest.query(`
                INSERT INTO HocVien_LopHoc
                    (MaLop, MaHocVien, NgayDangKy, TrangThai)
                VALUES
                    (@maLop, @maHocVien, GETDATE(), 'cho_duyet')
            `);

            await tx.commit();

            return NextResponse.json(
                {
                    success: true,
                    message: 'Đăng ký lớp thành công. Vui lòng chờ quản trị viên phê duyệt.',
                },
                { status: 201 }
            );
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    } catch (error) {
        console.error('POST /api/student/classes:', error);

        const message = error instanceof Error
            ? error.message
            : 'Lỗi khi đăng ký lớp học.';

        const status = [
            'Không tìm thấy hồ sơ học viên hoạt động.',
            'Lớp học không tồn tại hoặc không hoạt động.',
            'Bạn đã đăng ký hoặc đã thuộc lớp này.',
            'Lớp học đã đạt sĩ số tối đa.',
        ].includes(message) ? 400 : 500;

        return NextResponse.json(
            { success: false, message },
            { status }
        );
    }
}
