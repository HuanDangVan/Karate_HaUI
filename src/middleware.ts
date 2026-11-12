import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SessionPayload } from '@/types/auth';

const AUTH_COOKIE_NAME = 'karate_session';
const SECRET_KEY = process.env.AUTH_SECRET || 'karate-haui-super-secret-jwt-key-2026-tam-tri-dung';
const ENCODED_SECRET = new TextEncoder().encode(SECRET_KEY);

// Các route công khai không cần đăng nhập
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/api/db-test'];

// Các route quản trị dành riêng cho vai trò quan_tri_vien
const ADMIN_PATHS = [
  '/',
  '/hoc-vien',
  '/huan-luyen-vien',
  '/lop-hoc',
  '/lich-tap',
  '/diem-danh',
  '/thong-bao',
  '/thong-ke',
  '/cai-dat',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các file tĩnh và tài nguyên hệ thống Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file có đuôi mở rộng (favicon.ico, ảnh, font...)
  ) {
    return NextResponse.next();
  }

  // Lấy token từ cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let session: SessionPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, ENCODED_SECRET, {
        algorithms: ['HS256'],
      });
      session = payload as unknown as SessionPayload;
    } catch {
      session = null;
    }
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // 1. Nếu chưa đăng nhập:
  if (!session) {
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Chặn API trái phép
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phiên làm việc hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.',
        },
        { status: 401 }
      );
    }

    // Chuyển hướng về trang đăng nhập kèm đường dẫn cần quay lại sau đó
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Nếu đã đăng nhập mà truy cập trang /login:
  if (pathname === '/login') {
    if (session.role === 'quan_tri_vien') {
      return NextResponse.redirect(new URL('/', request.url));
    } else if (session.role === 'huan_luyen_vien') {
      return NextResponse.redirect(new URL('/coach', request.url));
    } else {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  // 3. Phân quyền truy cập theo vai trò:
  const isAdminRoute = ADMIN_PATHS.some((path) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  });

  if (isAdminRoute && session.role !== 'quan_tri_vien') {
    if (session.role === 'huan_luyen_vien') {
      return NextResponse.redirect(new URL('/coach', request.url));
    }
    return NextResponse.redirect(new URL('/student', request.url));
  }

  if (pathname.startsWith('/coach') && session.role !== 'huan_luyen_vien' && session.role !== 'quan_tri_vien') {
    return NextResponse.redirect(new URL('/student', request.url));
  }

  if (pathname.startsWith('/student') && session.role !== 'hoc_vien' && session.role !== 'quan_tri_vien') {
    return NextResponse.redirect(new URL('/coach', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tất cả các request ngoại trừ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
