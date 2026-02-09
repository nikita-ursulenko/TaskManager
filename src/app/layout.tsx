import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import localFont from "next/font/local";

const scandiaMedium = localFont({
  src: "../../public/font/Cascadia_Code/static/CascadiaCode-Medium.ttf",
  variable: "--font-scandia",
});

export const metadata: Metadata = {
  title: "Task Blazar",
  description: "Project management for Admin and Developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${scandiaMedium.variable} antialiased font-sans`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
