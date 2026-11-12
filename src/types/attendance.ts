export type AttendanceStatus =
    | 'co_mat'
    | 'vang'
    | 'di_muon'
    | 'co_phep';

export interface AttendanceSessionOption {
    maLichTap: number;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string | null;
}

export interface AttendanceStudentItem {
    maHocVien: number;
    maTaiKhoan: number;
    maSoHocVien: string;
    hoTen: string;
    anhDaiDien: string | null;
    trangThaiHocVien: string;
    trangThaiDiemDanh: AttendanceStatus | null;
    ghiChu: string | null;
    thoiGianDiemDanh: string | null;
}

export interface AttendanceRecord {
    maDiemDanh: number;
    maLichTap: number;
    maHocVien: number;
    hoTen: string;
    maSoHocVien: string;
    trangThai: AttendanceStatus;
    ghiChu: string | null;
    nguoiDiemDanh: number | null;
    thoiGianDiemDanh: string | null;
}

export interface SaveAttendanceInput {
    maLichTap: number;
    danhSach: {
        maHocVien: number;
        trangThai: AttendanceStatus;
        ghiChu?: string;
    }[];
}