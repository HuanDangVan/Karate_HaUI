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
  Sparkles,
  MapPin,
  Building2,
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
        setErrorMessage(data.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      // Đăng nhập thành công -> chuyển hướng theo phân quyền
      const destination = redirectPath !== '/' ? redirectPath : data.redirectUrl || '/';
      router.push(destination);
      router.refresh();
    } catch (err) {
      console.error('Lỗi kết nối khi đăng nhập:', err);
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-pink-200 bg-pink-50/80 p-3.5 text-xs text-pink-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-pink-600" />
          <span className="leading-relaxed font-medium">{errorMessage}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          Email tài khoản
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
            className="w-full rounded-2xl border border-pink-200/80 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-pink-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-200 transition-all shadow-xs"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          Mật khẩu
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
            className="w-full rounded-2xl border border-pink-200/80 bg-white/90 py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-pink-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-200 transition-all shadow-xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-pink-600 transition-colors"
            title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button in pastel gradient */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-sky-400 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200/50 hover:from-pink-500 hover:to-sky-500 focus:outline-hidden focus:ring-2 focus:ring-pink-300 disabled:cursor-not-allowed disabled:opacity-60 transition-all cursor-pointer"
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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-sky-50 to-pink-50 p-4 font-sans text-slate-800 overflow-hidden">
      {/* Pastel decorative ambient glow circles */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />

      {/* Background Decorative Kanji */}
      <div className="pointer-events-none fixed -top-10 -right-10 select-none font-serif text-[180px] font-black text-pink-300/10 sm:text-[260px]">
        空手
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Pastel Glass Card */}
        <div className="overflow-hidden rounded-3xl border border-pink-200/80 bg-white/95 shadow-2xl shadow-pink-200/40 backdrop-blur-md">
          {/* Top Banner Accent in pastel gradient */}
          <div className="h-2.5 w-full bg-gradient-to-r from-pink-400 via-rose-300 to-sky-400" />

          <div className="p-8 sm:p-10">
            {/* Header Branding */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-300 to-sky-400 text-white shadow-lg shadow-pink-200/50 ring-4 ring-pink-100">
                <span className="font-serif text-2xl font-black">空</span>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-sky-200 shadow-xs">
                  <Sparkles className="h-3 w-3 text-pink-500" />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
                  Karate-HaUI
                </h1>
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-700 ring-1 ring-pink-200">
                  CLB
                </span>
              </div>

              <p className="mt-1 text-xs font-bold tracking-wide text-sky-700">
                Đại học Công Nghiệp Hà Nội
              </p>

              {/* Address Badge */}
              <div className="mt-2.5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-50 to-sky-50 border border-pink-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                <span>Chùa Tu Hoàng, cách ĐH Công Nghiệp 900m</span>
              </div>

              <p className="mt-1.5 text-[11px] font-bold text-pink-600">
                Tâm • Trí • Dũng — Karate-dō
              </p>
            </div>

            {/* Suspense wrapper for Client Component using useSearchParams */}
            <Suspense
              fallback={
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                  <p className="text-xs text-slate-400">Đang tải biểu mẫu đăng nhập...</p>
                </div>
              }
            >
              <LoginForm />
            </Suspense>

            {/* Role Notice */}
            <div className="mt-7 rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50/50 via-white to-sky-50/50 p-3.5 text-center shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500">
                Phân quyền truy cập 3 cấp bậc:
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold">
                <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-pink-700 ring-1 ring-pink-200">
                  Quản trị viên
                </span>
                <span className="text-pink-300">•</span>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sky-700 ring-1 ring-sky-200">
                  Huấn luyện viên
                </span>
                <span className="text-pink-300">•</span>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-purple-700 ring-1 ring-purple-200">
                  Học viên
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            © 2026 <strong className="text-pink-600">Karate-HaUI</strong> — Đại học Công Nghiệp Hà Nội
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Địa chỉ: Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m
          </p>
        </div>
      </div>
    </div>
  );
}
