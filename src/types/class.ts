export type ClassStatus =
    | 'hoat_dong'
    | 'tam_dung'
    | 'ngung_hoat_dong';

export interface ClassItem {
    maLop: number;
    maSoLop: string;
    tenLop: string;
    maHuanLuyenVien: number | null;
    tenHuanLuyenVien: string | null;
    moTa: string | null;
    capDo: string | null;
    siSoToiDa: number;
    siSoHienTai: number;
    donGiaMoiBuoi: number;
    trangThai: ClassStatus;
    ngayTao?: string;
    ngayCapNhat?: string;
}

export interface CreateClassInput {
    maSoLop: string;
    tenLop: string;
    maHuanLuyenVien?: number | null;
    moTa?: string;
    capDo?: string;
    siSoToiDa: number;
    donGiaMoiBuoi: number;
    trangThai?: ClassStatus;
}

export interface UpdateClassInput {
    maSoLop: string;
    tenLop: string;
    maHuanLuyenVien?: number | null;
    moTa?: string;
    capDo?: string;
    siSoToiDa: number;
    donGiaMoiBuoi: number;
    trangThai?: ClassStatus;
}