import { getConnection, sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getClassStudents,
    getAvailableStudents,
    addStudentToClass,
    removeStudentFromClass,
} from '@/lib/class-student-service';

type RouteContext = {
    params: Promise<{ id: string }>;
};

function parseId(id: string): number | null {
    const value = Number(id);
    return Number.isInteger(value) && value > 0 ? value : null;
}

// GET: Lấy danh sách học viên của lớp hoặc học viên chưa được phân lớp
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền thực hiện chức năng này.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const maLop = parseId(id);

        if (!maLop) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type');
        const search = searchParams.get('search') || '';

        if (type === 'available') {
            const students = await getAvailableStudents(maLop, search);

            return NextResponse.json({
                success: true,
                data: students,
            });
        }

        const students = await getClassStudents(maLop);

        return NextResponse.json({
            success: true,
            data: students,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách học viên của lớp:', error);

        return NextResponse.json(
            { success: false, message: 'Lỗi máy chủ khi lấy danh sách học viên.' },
            { status: 500 }
        );
    }
}

// POST: Thêm học viên vào lớp
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền phân học viên vào lớp.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const maLop = parseId(id);

        if (!maLop) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const maHocVien = Number(body.maHocVien);

        if (!Number.isInteger(maHocVien) || maHocVien < 1) {
            return NextResponse.json(
                { success: false, message: 'Mã học viên không hợp lệ.' },
                { status: 400 }
            );
        }

        await addStudentToClass(maLop, maHocVien);

        return NextResponse.json({
            success: true,
            message: 'Phân học viên vào lớp thành công!',
        });
    } catch (error) {
        console.error('Lỗi khi phân học viên vào lớp:', error);

        const message =
            error instanceof Error ? error.message : 'Lỗi hệ thống.';

        const status =
            message.includes('không tồn tại') ||
                message.includes('không hoạt động') ||
                message.includes('đã đạt sĩ số') ||
                message.includes('đã thuộc lớp')
                ? 400
                : 500;

        return NextResponse.json(
            { success: false, message },
            { status }
        );
    }
}

// DELETE: Xóa học viên khỏi lớp
export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                { success: false, message: 'Bạn không có quyền xóa học viên khỏi lớp.' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const maLop = parseId(id);

        if (!maLop) {
            return NextResponse.json(
                { success: false, message: 'Mã lớp không hợp lệ.' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const maHocVien = Number(body.maHocVien);

        if (!Number.isInteger(maHocVien) || maHocVien < 1) {
            return NextResponse.json(
                { success: false, message: 'Mã học viên không hợp lệ.' },
                { status: 400 }
            );
        }

        await removeStudentFromClass(maLop, maHocVien);

        return NextResponse.json({
            success: true,
            message: 'Đã xóa học viên khỏi lớp!',
        });
    } catch (error) {
        console.error('Lỗi khi xóa học viên khỏi lớp:', error);

        const message =
            error instanceof Error ? error.message : 'Lỗi hệ thống.';

        return NextResponse.json(
            { success: false, message },
            { status: message.includes('không thuộc lớp') ? 404 : 500 }
        );
    }
}

// PATCH: Duyệt hoặc từ chối yêu cầu đăng ký lớp của học viên
export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    const session = await getCurrentSession();

    if (!session || session.role !== 'quan_tri_vien') {
        return NextResponse.json(
            { success: false, message: 'Bạn không có quyền thực hiện chức năng này.' },
            { status: 403 }
        );
    }

    const { id } = await context.params;
    const maLop = parseId(id);

    if (!maLop) {
        return NextResponse.json(
            { success: false, message: 'Mã lớp không hợp lệ.' },
            { status: 400 }
        );
    }

    let transaction: sql.Transaction | null = null;

    try {
        const body = await request.json();
        const maHocVien = Number(body.maHocVien);
        const action = body.action;

        if (!Number.isInteger(maHocVien) || maHocVien < 1) {
            return NextResponse.json(
                { success: false, message: 'Mã học viên không hợp lệ.' },
                { status: 400 }
            );
        }

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json(
                { success: false, message: 'Thao tác không hợp lệ.' },
                { status: 400 }
            );
        }

        const pool = await getConnection();
        transaction = new sql.Transaction(pool);

        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        // Khóa thông tin lớp để tránh duyệt vượt sĩ số khi có nhiều yêu cầu đồng thời.
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

        // Chỉ xử lý yêu cầu đang chờ duyệt.
        const pendingRequest = new sql.Request(transaction);
        pendingRequest.input('maLop', sql.Int, maLop);
        pendingRequest.input('maHocVien', sql.Int, maHocVien);

        const pendingResult = await pendingRequest.query(`
            SELECT MaDangKy
            FROM HocVien_LopHoc
            WHERE MaLop = @maLop
              AND MaHocVien = @maHocVien
              AND TrangThai = 'cho_duyet'
        `);

        if (pendingResult.recordset.length === 0) {
            throw new Error('Không tìm thấy yêu cầu đăng ký đang chờ duyệt.');
        }

        if (action === 'approve') {
            // Đếm số học viên đã được duyệt, không tính yêu cầu đang chờ.
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

            if (
                countResult.recordset[0].SiSoHienTai >=
                classItem.SiSoToiDa
            ) {
                throw new Error('Lớp học đã đạt sĩ số tối đa, không thể duyệt thêm.');
            }

            const updateRequest = new sql.Request(transaction);
            updateRequest.input('maLop', sql.Int, maLop);
            updateRequest.input('maHocVien', sql.Int, maHocVien);

            await updateRequest.query(`
                UPDATE HocVien_LopHoc
                SET TrangThai = 'dang_hoc'
                WHERE MaLop = @maLop
                  AND MaHocVien = @maHocVien
                  AND TrangThai = 'cho_duyet'
            `);
        } else {
            // Từ chối bằng cách xóa yêu cầu để học viên có thể đăng ký lại.
            const deleteRequest = new sql.Request(transaction);
            deleteRequest.input('maLop', sql.Int, maLop);
            deleteRequest.input('maHocVien', sql.Int, maHocVien);

            await deleteRequest.query(`
                DELETE FROM HocVien_LopHoc
                WHERE MaLop = @maLop
                  AND MaHocVien = @maHocVien
                  AND TrangThai = 'cho_duyet'
            `);
        }

        await transaction.commit();

        return NextResponse.json({
            success: true,
            message: action === 'approve'
                ? 'Đã duyệt học viên vào lớp thành công.'
                : 'Đã từ chối yêu cầu đăng ký lớp.',
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Lỗi rollback giao dịch:', rollbackError);
            }
        }

        console.error('Lỗi xử lý yêu cầu đăng ký lớp:', error);

        const message = error instanceof Error
            ? error.message
            : 'Lỗi hệ thống.';

        return NextResponse.json(
            { success: false, message },
            {
                status:
                    message.includes('không tồn tại') ||
                        message.includes('Không tìm thấy') ||
                        message.includes('đạt sĩ số tối đa')
                        ? 400
                        : 500,
            }
        );
    }
}
