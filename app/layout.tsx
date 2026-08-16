import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metis · 四六级督学工作台",
  description: "每天打开就知道该学什么，学多少。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
