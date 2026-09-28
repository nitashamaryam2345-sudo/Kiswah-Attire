'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home as HomeIcon, Grid, Search, ShoppingCart } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  // Admin pages par customer nav show nahi hoga
  if (!pathname || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#071328] border-t border-slate-800 text-white flex items-center justify-around py-2.5 shadow-2xl">
      <Link href="/" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium">
        <HomeIcon size={18} />
        <span>HOME</span>
      </Link>
      
      <Link href="/shop" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium">
        <Grid size={18} />
        <span>SHOP</span>
      </Link>

      {/* Search link jo home page par hi search open karega */}
      <Link href="/?search=open" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium">
        <Search size={18} />
        <span>SEARCH</span>
      </Link>

      <Link href="/cart" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium relative">
        <ShoppingCart size={18} />
        <span>CART</span>
      </Link>
    </div>
  );
}