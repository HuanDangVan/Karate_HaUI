
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { CoachLayout as CoachDashboardLayout } from '@/components/layout/CoachLayout';

export default async function CoachLayout({
    children,
}: {
    children: ReactNode;
}) {
    // Chờ request thực tế, tránh prerender dữ liệu cookie
    await connection();

    const session = await getCurrentSession();

    if (!session) {
        redirect('/login');
    }

    if (session.role !== 'huan_luyen_vien') {
        redirect('/');
    }

    return (
        <CoachDashboardLayout pageTitle="Tổng quan huấn luyện viên">
            {children}
        </CoachDashboardLayout>
    );
}
