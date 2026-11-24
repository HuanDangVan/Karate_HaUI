
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { StudentLayout as StudentDashboardLayout } from '@/components/layout/StudentLayout';

export default async function StudentLayout({
    children,
}: {
    children: ReactNode;
}) {
    await connection();

    const session = await getCurrentSession();

    if (!session) {
        redirect('/login');
    }

    if (session.role !== 'hoc_vien') {
        redirect('/');
    }

    return (
        <StudentDashboardLayout>
            {children}
        </StudentDashboardLayout>
    );
}
