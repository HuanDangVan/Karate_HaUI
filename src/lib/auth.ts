import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionPayload } from '@/types/auth';

export const AUTH_COOKIE_NAME = 'karate_session';

const SECRET_KEY = process.env.AUTH_SECRET || 'karate-haui-super-secret-jwt-key-2026-tam-tri-dung';
const ENCODED_SECRET = new TextEncoder().encode(SECRET_KEY);

/**
 * Tạo và ký JWT session token
 */
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(ENCODED_SECRET);
}

/**
 * Xác thực và giải mã JWT session token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ENCODED_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Lấy thông tin phiên đăng nhập hiện tại từ Cookies (cho Server Components / Server Actions)
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
