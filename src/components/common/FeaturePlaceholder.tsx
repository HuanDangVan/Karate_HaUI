'use client';

import React from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Hammer, ArrowLeft, Shield, Sparkles } from 'lucide-react';

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  moduleName: string;
}

export function FeaturePlaceholder({
  title,
  description,
  moduleName,
}: FeaturePlaceholderProps) {
  return (
    <AdminLayout pageTitle={title}>
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed border-pink-200 bg-white/95 p-8 text-center shadow-xs backdrop-blur-xs">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-sky-100 text-pink-600 ring-8 ring-pink-50/50">
          <Hammer className="h-8 w-8 animate-bounce text-pink-500" />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-sky-200">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          </div>
        </div>

        <span className="rounded-full bg-gradient-to-r from-pink-100 to-sky-100 px-3 py-1 text-xs font-bold text-pink-700 ring-1 ring-pink-200">
          Karate-HaUI • {moduleName}
        </span>

        <h2 className="mt-3 text-xl font-bold text-slate-800 sm:text-2xl">
          {title}
        </h2>

        <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-sky-400 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-200/50 hover:from-pink-500 hover:to-sky-500 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Tổng quan
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
