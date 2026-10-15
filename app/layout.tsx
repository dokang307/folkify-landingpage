import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: "Folkify — Học nhạc cụ dân tộc Việt Nam",
  description:
    "Ứng dụng học đàn tranh, sáo trúc, đàn bầu và nhiều nhạc cụ truyền thống ngay trên điện thoại. Học theo từng bài, theo tốc độ của riêng bạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${GeistSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://folkify-backend.onrender.com" />
        <link rel="dns-prefetch" href="https://folkify-backend.onrender.com" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
      {/* Không có measurement ID (VD: chạy local) thì không nạp gtag. */}
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
