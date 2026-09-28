import type { Metadata, Viewport } from "next";
import { Barlow, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow" });
const zen = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], variable: "--font-zen", preload: false });

export const metadata: Metadata = {
  title: "同期図鑑",
  description: "同期のプロフィールと共通点、誕生日の寄せ書き",
  appleWebApp: {
    capable: true,
    title: "同期図鑑",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${barlow.variable} ${zen.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
