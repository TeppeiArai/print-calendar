import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "プリント管理",
  description: "写真を撮るだけでカレンダーに登録",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
