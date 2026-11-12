export type ScheduleStatus =
    | 'da_len_lich'
    | 'da_hoan_thanh'
    | 'da_huy';

export interface ScheduleItem {
    maLichTap: number;
    maLop: number;
    maSoLop: string;
    tenLop: string;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem: string | null;
    noiDung: string | null;
    trangThai: ScheduleStatus;
    ngayTao?: string;
}

export interface CreateScheduleInput {
    maLop: number;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem?: string;
    noiDung?: string;
    trangThai?: ScheduleStatus;
}

export interface UpdateScheduleInput {
    maLop: number;
    ngayTap: string;
    gioBatDau: string;
    gioKetThuc: string;
    diaDiem?: string;
    noiDung?: string;
    trangThai?: ScheduleStatus;
}

export interface ScheduleClassOption {
    maLop: number;
    maSoLop: string;
    tenLop: string;
}