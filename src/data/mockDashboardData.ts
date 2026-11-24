import {
  StatItem,
  StudentGrowthData,
  BeltDistributionData,
  AttendanceDayData,
  UpcomingSession,
  AnnouncementItem,
  AdminUser,
} from '@/types/dashboard';

export const MOCK_ADMIN_USER: AdminUser = {
  name: 'Admin',
  email: 'admin.karate@haui.edu.vn',
  role: 'Chủ nhiệm Karate-HaUI',
  belt: 'Đai đen 4 Đẳng',
};

export const MOCK_STAT_ITEMS: StatItem[] = [
  {
    id: 'total-students',
    title: 'Tổng số học viên',
    value: 248,
    unit: 'học viên',
    change: '+12.5%',
    isPositive: true,
    description: 'Tăng 28 học viên so với tháng trước',
    iconName: 'users',
  },
  {
    id: 'total-coaches',
    title: 'Tổng số huấn luyện viên',
    value: 14,
    unit: 'HLV & Trợ giảng',
    change: '+2 người',
    isPositive: true,
    description: '100% đạt chuẩn đai đen quốc gia',
    iconName: 'coaches',
  },
  {
    id: 'total-classes',
    title: 'Tổng số lớp học',
    value: 8,
    unit: 'lớp đang mở',
    change: '+1 lớp',
    isPositive: true,
    description: 'Cơ bản, Nâng cao & Đội tuyển Kata/Kumite',
    iconName: 'classes',
  },
  {
    id: 'weekly-sessions',
    title: 'Số buổi tập trong tuần',
    value: 18,
    unit: 'buổi / tuần',
    change: 'Đầy đủ',
    isPositive: true,
    description: 'Tại Chùa Tu Hoàng, cách ĐHCN 900m',
    iconName: 'schedule',
  },
];

export const MOCK_STUDENT_GROWTH: StudentGrowthData[] = [
  { month: 'Tháng 5', hocVienMoi: 22, tongHocVien: 180 },
  { month: 'Tháng 6', hocVienMoi: 35, tongHocVien: 205 },
  { month: 'Tháng 7', hocVienMoi: 28, tongHocVien: 218 },
  { month: 'Tháng 8', hocVienMoi: 40, tongHocVien: 232 },
  { month: 'Tháng 9', hocVienMoi: 45, tongHocVien: 242 },
  { month: 'Tháng 10', hocVienMoi: 32, tongHocVien: 248 },
];

export const MOCK_BELT_DISTRIBUTION: BeltDistributionData[] = [
  { belt: 'Đai trắng', count: 86, color: '#fbcfe8' },
  { belt: 'Đai vàng', count: 52, color: '#fef08a' },
  { belt: 'Đai xanh lá', count: 44, color: '#a7f3d0' },
  { belt: 'Đai xanh dương', count: 32, color: '#bae6fd' },
  { belt: 'Đai nâu', count: 22, color: '#d6d3d1' },
  { belt: 'Đai đen', count: 12, color: '#334155' },
];

export const MOCK_ATTENDANCE_DATA: AttendanceDayData[] = [
  { day: 'Thứ 2', date: '27/10', coMat: 88, vangMat: 8, tyLe: 91.6 },
  { day: 'Thứ 3', date: '28/10', coMat: 72, vangMat: 10, tyLe: 87.8 },
  { day: 'Thứ 4', date: '29/10', coMat: 95, vangMat: 5, tyLe: 95.0 },
  { day: 'Thứ 5', date: '30/10', coMat: 68, vangMat: 12, tyLe: 85.0 },
  { day: 'Thứ 6', date: '31/10', coMat: 92, vangMat: 6, tyLe: 93.8 },
  { day: 'Thứ 7', date: '01/11', coMat: 110, vangMat: 9, tyLe: 92.4 },
  { day: 'Chủ Nhật', date: '02/11', coMat: 85, vangMat: 7, tyLe: 92.3 },
];

export const MOCK_UPCOMING_SESSIONS: UpcomingSession[] = [
  {
    id: 'sess-1',
    className: 'Karate-HaUI Cơ Bản - K19',
    category: 'Cơ bản',
    time: '18:00 - 19:30',
    date: 'Hôm nay, 02/11',
    location: 'Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m',
    instructor: 'HLV. Nguyễn Văn Hùng',
    expectedStudents: 42,
    status: 'SapDienRa',
  },
  {
    id: 'sess-2',
    className: 'Đội Tuyển Kumite Đối Kháng',
    category: 'Kumite',
    time: '19:45 - 21:15',
    date: 'Hôm nay, 02/11',
    location: 'Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m',
    instructor: 'HLV. Trần Thị Mai (Đai đen 3 Đẳng)',
    expectedStudents: 20,
    status: 'SapDienRa',
  },
  {
    id: 'sess-3',
    className: 'Quyền Pháp Kata Nâng Cao',
    category: 'Kata',
    time: '06:00 - 07:30',
    date: 'Sáng mai, 03/11',
    location: 'Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m',
    instructor: 'Võ sư. Lê Hoàng Long',
    expectedStudents: 26,
    status: 'SapDienRa',
  },
  {
    id: 'sess-4',
    className: 'Tân Môn Sinh Nhập Môn K20',
    category: 'Cơ bản',
    time: '17:30 - 19:00',
    date: 'Chiều mai, 03/11',
    location: 'Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m',
    instructor: 'Trợ giảng. Vũ Đức Anh',
    expectedStudents: 38,
    status: 'SapDienRa',
  },
];

export const MOCK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Kỳ thi Thăng cấp đai Quý 4/2026 - Karate-HaUI',
    summary: 'Ban chuyên môn thông báo lịch kiểm tra thể lực, quyền pháp (Kata) và đối kháng (Kumite) cho toàn thể môn sinh tại Chùa Tu Hoàng.',
    category: 'Thi đai',
    date: '15/11/2026',
    author: 'Ban Chuyên Môn',
    priority: 'high',
    read: false,
  },
  {
    id: 'ann-2',
    title: 'Tập huấn chuẩn bị Giải Karate Sinh viên Hà Nội 2026',
    summary: 'Triệu tập các VĐV đội tuyển Kata và Kumite Karate-HaUI tham gia đợt tập huấn nâng cao thể lực.',
    category: 'Giải đấu',
    date: '08/11/2026',
    author: 'Ban Chủ Nhiệm',
    priority: 'high',
    read: false,
  },
  {
    id: 'ann-3',
    title: 'Thông báo phát võ phục Karate-HaUI đợt 2',
    summary: 'Các bạn tân sinh viên đã đăng ký võ phục đợt 2 vui lòng đến bàn tiếp nhận tại Chùa Tu Hoàng để nhận võ phục.',
    category: 'Thông báo chung',
    date: '04/11/2026',
    author: 'Ban Hậu Cần',
    priority: 'medium',
    read: true,
  },
  {
    id: 'ann-4',
    title: 'Điều chỉnh lịch tập nhân ngày Nhà giáo Việt Nam 20/11',
    summary: 'Toàn thể CLB Karate-HaUI sẽ tổ chức lễ tri ân các Thầy/Cô và Huấn luyện viên, lịch tập tối thứ 6 sẽ dời sang chủ nhật.',
    category: 'Lịch tập',
    date: '01/11/2026',
    author: 'Ban Truyền Thông',
    priority: 'normal',
    read: true,
  },
];
