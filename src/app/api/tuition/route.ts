
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
    getTuitionList,
    getTuitionSummary,
} from '@/lib/tuition-service';
import type {
    TuitionFilter,
    TuitionStatus,
} from '@/types/tuition';

const ADMIN_ROLE = 'quan_tri_vien';

export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== ADMIN_ROLE) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Bạn không có quyền truy cập.',
                },
                { status: 403 },
            );
        }

        const params = request.nextUrl.searchParams;

        const thangParam = params.get('thang');
        const namParam = params.get('nam');
        const maLopParam = params.get('maLop');
        const trangThaiParam = params.get('trangThai');

        const parseOptionalNumber = (
            value: string | null,
            min: number,
            max?: number,
        ): number | undefined => {
            if (value === null || value === '') return undefined;

            const number = Number(value);

            if (
                !Number.isInteger(number) ||
                number < min ||
                (max !== undefined && number > max)
            ) {
                throw new Error('Tham số lọc không hợp lệ.');
            }

            return number;
        };

        const thang = parseOptionalNumber(thangParam, 1, 12);
        const nam = parseOptionalNumber(namParam, 2000, 2100);
        const maLop = parseOptionalNumber(maLopParam, 1);

        let trangThai: TuitionStatus | undefined;

        if (trangThaiParam) {
            if (
                trangThaiParam !== 'da_dong' &&
                trangThaiParam !== 'chua_dong'
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Trạng thái thanh toán không hợp lệ.',
                    },
                    { status: 400 },
                );
            }

            trangThai = trangThaiParam;
        }

        const filter: TuitionFilter = {
            thang,
            nam,
            maLop,
            trangThai,
        };

        const [data, summary] = await Promise.all([
            getTuitionList(session.role, filter),
            getTuitionSummary(session.role, filter),
        ]);

        return NextResponse.json({
            success: true,
            data,
            summary,
        });

    } catch (error) {
        console.error('GET /api/tuition error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Không thể tải dữ liệu học phí.',
            },
            { status: 500 },
        );
    }
}
