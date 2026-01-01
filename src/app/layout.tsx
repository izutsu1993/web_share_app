import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "料理メモ",
  description: "レシピにメモを追加",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "料理メモ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}

