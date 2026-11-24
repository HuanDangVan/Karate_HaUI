export type UserRole = 'quan_tri_vien' | 'huan_luyen_vien' | 'hoc_vien';

export type AccountStatus = 'hoat_dong' | 'bi_khoa' | 'ngung_hoat_dong';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string;
  phone?: string;
}

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  [key: string]: unknown;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
}
