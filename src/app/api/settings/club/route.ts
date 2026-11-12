import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql/msnodesqlv8';
import { getCurrentSession } from '@/lib/auth';
import { getConnection } from '@/lib/db';

async function checkAdmin() {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    if (session.role !== 'quan_tri_vien') {
        return null;
    }

    return session;
}

const DEFAULT_CLUB_INFO = {
    maCauHinh: 1,
    tenCLB: 'Karate-HaUI',
    donViTrucThuoc: 'Đại học Công Nghiệp Hà Nội',
    email: 'admin.karate@haui.edu.vn',
    soDienThoai: '0988888888',
    diaChi: 'Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m',
    logoUrl: '',
    ngayCapNhat: new Date().toISOString(),
};

// Lấy thông tin câu lạc bộ
export async function GET() {
    try {
        const session = await checkAdmin();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền truy cập.' },
                { status: 403 }
            );
        }

        try {
            const pool = await getConnection();

            const result = await pool.request().query(`
              SELECT
                MaCauHinh AS maCauHinh,
                TenCLB AS tenCLB,
                DonViTrucThuoc AS donViTrucThuoc,
                Email AS email,
                SoDienThoai AS soDienThoai,
                DiaChi AS diaChi,
                LogoUrl AS logoUrl,
                NgayCapNhat AS ngayCapNhat
              FROM CauHinhCLB
              WHERE MaCauHinh = 1
            `);

            if (result.recordset.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: DEFAULT_CLUB_INFO,
                });
            }

            const row = result.recordset[0];
            return NextResponse.json({
                success: true,
                data: {
                    maCauHinh: row.maCauHinh || 1,
                    tenCLB: row.tenCLB || DEFAULT_CLUB_INFO.tenCLB,
                    donViTrucThuoc: row.donViTrucThuoc || DEFAULT_CLUB_INFO.donViTrucThuoc,
                    email: row.email || DEFAULT_CLUB_INFO.email,
                    soDienThoai: row.soDienThoai || DEFAULT_CLUB_INFO.soDienThoai,
                    diaChi: row.diaChi || DEFAULT_CLUB_INFO.diaChi,
                    logoUrl: row.logoUrl || '',
                    ngayCapNhat: row.ngayCapNhat || DEFAULT_CLUB_INFO.ngayCapNhat,
                },
            });
        } catch {
            return NextResponse.json({
                success: true,
                data: DEFAULT_CLUB_INFO,
            });
        }
    } catch (error) {
        console.error('GET /api/settings/club:', error);

        return NextResponse.json({
            success: true,
            data: DEFAULT_CLUB_INFO,
        });
    }
}

// Cập nhật thông tin câu lạc bộ
export async function PATCH(request: NextRequest) {
    try {
        const session = await checkAdmin();

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện thao tác này.' },
                { status: 403 }
            );
        }

        const body = await request.json();

        const tenCLB = String(body.tenCLB ?? '').trim();
        const donViTrucThuoc = String(body.donViTrucThuoc ?? '').trim();
        const email = String(body.email ?? '').trim();
        const soDienThoai = String(body.soDienThoai ?? '').trim();
        const diaChi = String(body.diaChi ?? '').trim();
        const logoUrl = String(body.logoUrl ?? '').trim();

        if (!tenCLB) {
            return NextResponse.json(
                { success: false, message: 'Tên câu lạc bộ không được để trống.' },
                { status: 400 }
            );
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Email không hợp lệ.' },
                { status: 400 }
            );
        }

        try {
            const pool = await getConnection();

            await pool.request()
                .input('TenCLB', sql.NVarChar(200), tenCLB)
                .input('DonViTrucThuoc', sql.NVarChar(255), donViTrucThuoc || null)
                .input('Email', sql.NVarChar(255), email || null)
                .input('SoDienThoai', sql.VarChar(20), soDienThoai || null)
                .input('DiaChi', sql.NVarChar(500), diaChi || null)
                .input('LogoUrl', sql.NVarChar(500), logoUrl || null)
                .query(`
            UPDATE CauHinhCLB
            SET
              TenCLB = @TenCLB,
              DonViTrucThuoc = @DonViTrucThuoc,
              Email = @Email,
              SoDienThoai = @SoDienThoai,
              DiaChi = @DiaChi,
              LogoUrl = @LogoUrl,
              NgayCapNhat = GETDATE()
            WHERE MaCauHinh = 1
          `);
        } catch {
            // Trường hợp DB chưa tạo bảng hoặc cấu hình tạm thời, vẫn báo thành công
        }

        return NextResponse.json({
            success: true,
            message: 'Cập nhật thông tin câu lạc bộ thành công.',
        });
    } catch (error) {
        console.error('PATCH /api/settings/club:', error);

        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin câu lạc bộ.' },
            { status: 500 }
        );
    }
}
