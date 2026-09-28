import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@supabase/supabase-js";
import MainLayoutWrapper from "./components/MainLayoutWrapper";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiswah Attire - Admin Panel",
  description: "E-commerce dashboard for Kiswah Attire",
  icons: {
    icon: "/favicon.ico",
  },
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: any[] = [];
  let settings: any = null;

  try {
    const catRes = await supabase.from('categories').select('*');
    if (catRes.data) categories = catRes.data;

    const setRes = await supabase.from('settings').select('*').single();
    if (setRes.data) settings = setRes.data;
  } catch (err) {
    console.error("Layout data fetch error:", err);
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f0f6fb] min-h-screen flex flex-col`}>
        <MainLayoutWrapper categories={categories} settings={settings}>
          {children}
        </MainLayoutWrapper>
      </body>
    </html>
  );
}