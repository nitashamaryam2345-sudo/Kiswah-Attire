'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Boxes, 
  Users, 
  Tag, 
  Settings,
  LogOut,
  Home,
  X,
  Heart,
  ArrowUp,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Window scroll position check karein taake har page par barabar kaam kare
      if (window.scrollY > 200 || document.documentElement.scrollTop > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Agar koi specific main container scroll ho raha ho toh usay bhi top par le aayein
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Discounts', href: '/admin/discounts', icon: Tag },
    { name: 'Admins', href: '/admin/admins', icon: ShieldCheck },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-[#0B132B] text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800
        transform transition-transform duration-300 ease-in-out overflow-hidden
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Relative Wrapper for Content */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            {/* Brand Logo Header */}
            <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-slate-900 font-bold flex items-center justify-center text-lg shadow-lg">
                  <Home size={22} className="text-slate-900" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-wide">Kiswa Attire</h1>
                  <p className="text-[10px] text-slate-400 font-medium">Bed Sheets & Sofa Covers</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close sidebar" className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" aria-label="Admin navigation">
              {menuItems.map((item) => {
                const Icon = item.icon;
                // Nested routes ke liye active state fix
                const isActive = item.href === '/admin/dashboard'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-4 pb-3 text-center">
              <p className="text-xs italic text-slate-300 font-serif tracking-wide">&ldquo;Better Home&rdquo;</p>
              <p className="text-xs italic text-slate-300 font-serif tracking-wide mb-2">Better Living</p>
              <div className="flex items-center justify-center text-rose-400">
                <div className="h-[1px] w-8 bg-slate-700/80 mr-2" />
                <Heart size={14} className="fill-rose-400/30 text-rose-400 animate-pulse" />
                <div className="h-[1px] w-8 bg-slate-700/80 ml-2" />
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 border-t border-slate-800/80">
              <button 
                onClick={async () => {
                  await fetch('/api/admin/logout', { method: 'POST' });
                  window.location.href = '/admin/login';
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center hover:scale-105"
          title="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-around z-40 shadow-lg" aria-label="Mobile admin navigation">
        {[
          { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { href: '/admin/products', icon: Package, label: 'Products' },
          { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
          { href: '/admin/customers', icon: Users, label: 'Customers' },
          { href: '/admin/settings', icon: Settings, label: 'Settings' },
        ].map((nav) => {
          const isActive = nav.href === '/admin/dashboard'
            ? pathname === nav.href
            : pathname === nav.href || pathname.startsWith(nav.href + '/');

          return (
            <Link 
              key={nav.label} 
              href={nav.href} 
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <nav.icon size={18} />
              <span>{nav.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}