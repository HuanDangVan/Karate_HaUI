import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karate-HaUI - CLB Karate Đại học Công Nghiệp Hà Nội",
  description:
    "Hệ thống quản lý CLB Karate-HaUI trực thuộc Đại học Công Nghiệp Hà Nội. Địa chỉ: Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans selection:bg-pink-200 selection:text-pink-900">
        {children}
      </body>
    </html>
  );
}
