export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change: string;
  isPositive: boolean;
  description: string;
  iconName: 'users' | 'coaches' | 'classes' | 'schedule';
}

export interface StudentGrowthData {
  month: string;
  hocVienMoi: number;
  tongHocVien: number;
}

export interface BeltDistributionData {
  belt: string;
  count: number;
  color: string;
}

export interface AttendanceDayData {
  day: string;
  date: string;
  coMat: number;
  vangMat: number;
  tyLe: number;
}

export interface UpcomingSession {
  id: string;
  className: string;
  category: 'Kata' | 'Kumite' | 'Cơ bản' | 'Nâng cao';
  time: string;
  date: string;
  location: string;
  instructor: string;
  instructorAvatar?: string;
  expectedStudents: number;
  status: 'SapDienRa' | 'DangDienRa' | 'DaKetThuc';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  category: 'Thi đai' | 'Giải đấu' | 'Lịch tập' | 'Thông báo chung';
  date: string;
  author: string;
  priority: 'high' | 'medium' | 'normal';
  read: boolean;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  belt: string;
  avatarUrl?: string;
}
