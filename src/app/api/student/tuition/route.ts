
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getMyTuition } from '@/lib/tuition-service';
import type { TuitionFilter } from '@/types/tuition';

export async function GET(request: Request) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Bạn chưa đăng nhập.' },
                { status: 401 },
            );
        }

        if (session.role !== 'hoc_vien') {
            return NextResponse.json(
                { message: 'Bạn không có quyền truy cập.' },
                { status: 403 },
            );
        }

        const { searchParams } = new URL(request.url);

        const filter: TuitionFilter = {};

        const thang = searchParams.get('thang');
        const nam = searchParams.get('nam');

        if (thang) {
            const value = Number(thang);

            if (!Number.isInteger(value) || value < 1 || value > 12) {
                return NextResponse.json(
                    { message: 'Tháng không hợp lệ.' },
                    { status: 400 },
                );
            }

            filter.thang = value;
        }

        if (nam) {
            const value = Number(nam);

            if (!Number.isInteger(value) || value < 2000 || value > 2100) {
                return NextResponse.json(
                    { message: 'Năm không hợp lệ.' },
                    { status: 400 },
                );
            }

            filter.nam = value;
        }

        const data = await getMyTuition(session.userId, filter);

        const summary = data.reduce(
            (result, item) => {
                result.tongHocPhi += Number(item.tongTien) || 0;

                if (item.trangThai === 'da_dong') {
                    result.daThu += Number(item.tongTien) || 0;
                } else {
                    result.conNo += Number(item.tongTien) || 0;
                }

                return result;
            },
            {
                tongHocPhi: 0,
                daThu: 0,
                conNo: 0,
            },
        );

        return NextResponse.json({
            success: true,
            data,
            summary: {
                ...summary,
                soKhoanHocPhi: data.length,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy học phí học viên:', error);

        return NextResponse.json(
            { message: 'Không thể tải thông tin học phí.' },
            { status: 500 },
        );
    }
}
