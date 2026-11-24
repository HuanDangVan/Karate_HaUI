'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Shield,
  MapPin,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Đăng nhập không thành công.');
        setIsLoading(false);
        return;
      }

      const destination = redirectPath !== '/' ? redirectPath : data.redirectUrl || '/';
      router.push(destination);
      router.refresh();
    } catch (err) {
      console.error('Lỗi kết nối khi đăng nhập:', err);
      setErrorMessage('Không thể kết nối đến máy chủ.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email tài khoản
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin.karate@haui.edu.vn"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Mật khẩu
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang xác thực...</span>
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            <span>Đăng nhập hệ thống</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <span className="font-serif text-xl font-bold">空</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Karate-HaUI
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Đại học Công Nghiệp Hà Nội
              </p>

              <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Chùa Tu Hoàng, cách ĐH Công Nghiệp 900m</span>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <p className="text-xs text-gray-400">Đang tải...</p>
                </div>
              }
            >
              <LoginForm />
            </Suspense>

            {/* Role notice */}
            <div className="mt-6 rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-[11px] text-gray-500">
                Phân quyền: Quản trị viên • Huấn luyện viên • Học viên
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>
            © 2026 Karate-HaUI — Đại học Công Nghiệp Hà Nội
          </p>
        </div>
      </div>
    </div>
  );
}
