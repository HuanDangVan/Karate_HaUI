export type CoachStatus =
    | 'hoat_dong'
    | 'tam_dung'
    | 'ngung_hoat_dong';

export interface CoachItem {
    maHuanLuyenVien: number;
    maTaiKhoan: number;
    maSoHuanLuyenVien: string;

    hoTen: string;
    email: string;
    soDienThoai: string | null;
    diaChi: string | null;
    ngaySinh: string | null;
    gioiTinh: string | null;

    chuyenMon: string | null;
    soNamKinhNghiem: number | null;
    ngayBatDau: string | null;

    trangThai: CoachStatus;
    trangThaiTaiKhoan?: string;
    anhDaiDien: string | null;
    ngayTao?: string;
}

export interface CreateCoachInput {
    hoTen: string;
    email: string;
    matKhau: string;
    maSoHuanLuyenVien: string;

    soDienThoai?: string;
    diaChi?: string;
    ngaySinh?: string;
    gioiTinh?: string;

    chuyenMon?: string;
    soNamKinhNghiem?: number;
    ngayBatDau?: string;
    trangThai?: CoachStatus;
}

export interface UpdateCoachInput {
    hoTen: string;
    maSoHuanLuyenVien: string;

    soDienThoai?: string;
    diaChi?: string;
    ngaySinh?: string;
    gioiTinh?: string;

    chuyenMon?: string;
    soNamKinhNghiem?: number;
    ngayBatDau?: string;
    trangThai?: CoachStatus;
}