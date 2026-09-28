import Link from "next/link";
import { ShieldCheck, Truck, CreditCard, Home as HomeIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-16">
      {/* Top "Why Choose" Bar with Corner Leaves */}
      <div className="relative bg-[#f2f6fb] border-t border-b border-blue-100/80 py-6 sm:py-8 overflow-hidden">
        <img 
          src="/homeloom_leaf_left.png" 
          alt="" 
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-12 sm:w-16 md:w-24 pointer-events-none select-none z-0 opacity-70 sm:opacity-100" 
        />
        <img 
          src="/homeloom_leaf_right.png" 
          alt="" 
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-12 sm:w-16 md:w-24 pointer-events-none select-none z-0 opacity-70 sm:opacity-100" 
        />

        <div className="relative z-10 max-w-[1350px] mx-auto px-5 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left shrink-0">
            <h2 className="font-serif text-lg sm:text-2xl font-black text-[#0f284e]">
              Why Choose Kiswah Attire?
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              We bring comfort, quality and style to your home.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-6 lg:gap-10 w-full lg:w-auto px-4 sm:px-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-blue-900/30 bg-blue-50/50 flex items-center justify-center text-blue-900 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Premium Quality</p>
                <p className="text-[10px] text-slate-500">Fabrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-blue-900/30 bg-blue-50/50 flex items-center justify-center text-blue-900 shrink-0">
                <Truck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Fast Delivery</p>
                <p className="text-[10px] text-slate-500">Across Pakistan</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-blue-900/30 bg-blue-50/50 flex items-center justify-center text-blue-900 shrink-0">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Cash on Delivery</p>
                <p className="text-[10px] text-slate-500">Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Navy Professional Footer */}
      <div className="bg-[#0f284e] text-slate-200 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="max-w-[1350px] mx-auto px-5 sm:px-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 text-xs">
            
            {/* Col 1: Brand Info */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <HomeIcon size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white leading-tight">Kiswah Attire</h3>
                  <p className="text-[10px] text-blue-200">Comfort for Every Home</p>
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
                Empowering homes with top-tier bed sheets, elegant sofa covers, and premium home textiles.
              </p>
            </div>

            {/* Col 2 & 3: Quick Links & Customer Care */}
            <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <h4 className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider">Quick Links</h4>
                <ul className="space-y-1.5 text-slate-300 text-xs">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                  <li><Link href="/shop?category=bed-sheets" className="hover:text-white transition-colors">Bed Sheets</Link></li>
                  <li><Link href="/shop?category=sofa-covers" className="hover:text-white transition-colors">Sofa Covers</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider">Customer Care</h4>
                <ul className="space-y-1.5 text-slate-300 text-xs">
                  <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
                  <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
                  <li><Link href="/returns" className="hover:text-white transition-colors">Return Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                </ul>
              </div>
            </div>

            {/* Col 4: Newsletter */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-3">
              <h4 className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider">Subscribe to Our Newsletter</h4>
              <p className="text-slate-300 text-xs">
                Get latest updates on new arrivals and exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                />
                <button 
                  type="button" 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shrink-0 transition-colors shadow-sm cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
            </div>

          </div>

          {/* Copyright Section */}
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-[11px] text-slate-400">
              © 2026 Kiswah Attire. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}