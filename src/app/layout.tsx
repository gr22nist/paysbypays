import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard.css";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaysByPays Dashboard",
  description: "Payment Gateway Dashboard - 결제대행사 대시보드",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased bg-[var(--background)] text-[var(--text-strong)]">
        <AppProviders>
          {children}
          <ScrollToTop />
        </AppProviders>
      </body>
    </html>
  );
}
