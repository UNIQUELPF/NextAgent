import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/layout/site-header";
import { CurrentUserProvider } from "@/components/providers/current-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { HeaderVisibilityProvider } from "@/components/providers/header-visibility";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "企标邦",
  description:
    "AI Agent 平台，助力企业完成软件著作权、执行标准备案、消字号批文、条码注册等全流程自动化。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <HeaderVisibilityProvider>
            <CurrentUserProvider>
              <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
                <SiteHeader />
                <main className="pb-16 pt-10">{children}</main>
              </div>
            </CurrentUserProvider>
          </HeaderVisibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
