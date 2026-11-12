
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { updateTuitionStatus } from '@/lib/tuition-service';
import type { TuitionStatus } from '@/types/tuition';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'quan_tri_vien') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Bạn không có quyền cập nhật học phí.',
                },
                { status: 403 },
            );
        }

        const { id } = await context.params;
        const maHocPhi = Number(id);

        if (!Number.isInteger(maHocPhi) || maHocPhi <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Mã học phí không hợp lệ.',
                },
                { status: 400 },
            );
        }

        const body: unknown = await request.json();

        if (
            !body ||
            typeof body !== 'object' ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Dữ liệu cập nhật không hợp lệ.',
                },
                { status: 400 },
            );
        }

        const trangThai = (body as Record<string, unknown>).trangThai;

        if (
            trangThai !== 'da_dong' &&
            trangThai !== 'chua_dong'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Trạng thái thanh toán không hợp lệ.',
                },
                { status: 400 },
            );
        }

        await updateTuitionStatus(
            maHocPhi,
            trangThai as TuitionStatus,
            session.role,
        );

        return NextResponse.json({
            success: true,
            message: 'Cập nhật trạng thái thanh toán thành công.',
        });

    } catch (error) {
        console.error('PATCH /api/tuition/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể cập nhật trạng thái thanh toán.',
            },
            { status: 500 },
        );
    }
}
