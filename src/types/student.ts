export type StudentStatus = 'hoat_dong' | 'tam_dung' | 'ngung_hoat_dong';

export interface StudentItem {
  maHocVien: number;
  maTaiKhoan: number;
  maSoHocVien: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  diaChi: string | null;
  ngaySinh: string | null;
  gioiTinh: string | null;
  ngayThamGia: string | null;
  trangThai: StudentStatus;
  trangThaiTaiKhoan?: string;
  ghiChu: string | null;
  anhDaiDien: string | null;
  ngayTao?: string;
  tongBuoiThamGia?: number;
  tongBuoiVang?: number;
}

export interface CreateStudentInput {
  hoTen: string;
  email: string;
  matKhau: string;
  maSoHocVien: string;
  soDienThoai?: string;
  diaChi?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  ngayThamGia?: string;
  ghiChu?: string;
  trangThai?: StudentStatus;
}

export interface UpdateStudentInput {
  hoTen: string;
  maSoHocVien: string;
  soDienThoai?: string;
  diaChi?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  ngayThamGia?: string;
  ghiChu?: string;
  trangThai?: StudentStatus;
}
