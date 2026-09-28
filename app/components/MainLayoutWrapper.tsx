"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav"; // Apne folder path ke mutabiq check kar lein (jaise '@/components/MobileNav')

export default function MainLayoutWrapper({ 
  children, 
  categories, 
  settings 
}: { 
  children: React.ReactNode; 
  categories: any[]; 
  settings: any 
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isCheckout = pathname?.startsWith('/checkout');
  const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/signup');

  // Agar admin, checkout, login ya signup page hai toh header, footer aur mobile nav hide rahenge
  if (isAdmin || isCheckout || isAuth) {
    return (
      <>
        <main className="flex-1 w-full">
          {children}
        </main>
      </>
    );
  }

  // Baqi customer pages ke liye Header, Footer aur sath mein MobileNav har page par nazar aayega
  return (
    <>
      <Header categories={categories} settings={settings} />
      <main className="flex-1 w-full max-w-[1250px] mx-auto px-5 pb-20 sm:pb-8">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}