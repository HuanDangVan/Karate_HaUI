
export type TuitionStatus = 'chua_dong' | 'da_dong';

export interface TuitionItem {
    maHocPhi: number;
    maHocVien: number;
    maSoHocVien: string;
    hoTen: string;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    thang: number;
    nam: number;
    soBuoi: number;
    donGiaMoiBuoi: number;
    tongTien: number;
    trangThai: TuitionStatus;
    ngayCapNhat: string | null;
}

export interface TuitionSummary {
    tongHocPhi: number;
    daThu: number;
    conNo: number;
    soHocVien: number;
}

export interface TuitionFilter {
    thang?: number;
    nam?: number;
    maLop?: number;
    trangThai?: TuitionStatus;
}

export interface UpdateTuitionStatusInput {
    maHocPhi: number;
    trangThai: TuitionStatus;
}
