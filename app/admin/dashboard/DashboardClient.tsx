'use client';
import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle,
  FileText,
  Boxes,
  Bell,
  Calendar,
  ChevronDown,
  AlertCircle,
  X,
  Menu,
  Search,
  Loader2,
  Users,
  Settings,
  ArrowUp,
  User as UserIcon
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Product {
  id: string | number;
  name: string;
  price?: number;
  image?: string;
  stock?: number;
  sold?: number;
}

export interface Order {
  id: string | number;
  customer_name?: string;
  customer?: string;
  total_amount?: number;
  status?: string;
  created_at?: string | number;
}

interface DashboardClientProps {
  totalProducts?: number;
  products?: Product[];
  totalOrders?: number;
  pendingOrdersCount?: number;
  completedOrdersCount?: number;
  totalSalesAmount?: number;
  currentMonthSales?: number;
  monthGrowthPercent?: number;
  recentOrders?: Order[];
  lowStockProducts?: Product[];
  topSellingProducts?: Product[];
  orderStatusCounts?: {
    Pending: number;
    Confirmed: number;
    Shipped: number;
    Delivered: number;
    Cancelled: number;
  };
  salesLast7Days?: number[];
  dbError?: string | null;
}

function Sparkline({ color, points }: { color: string; points: number[] }) {
  const w = 100, h = 32;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(h - ((p - min) / range) * h).toFixed(1)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardClient({ 
  totalProducts = 0, 
  products = [], 
  totalOrders = 0, 
  pendingOrdersCount = 0, 
  completedOrdersCount = 0, 
  totalSalesAmount = 0, 
  currentMonthSales = 0,
  monthGrowthPercent = 0,
  recentOrders = [],
  lowStockProducts = [],
  topSellingProducts = [],
  orderStatusCounts = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 },
  salesLast7Days = [0, 0, 0, 0, 0, 0, 0],
  dbError 
}: DashboardClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  
  const searchIdRef = useRef(0);
  const calendarRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLElement>(null);
  
  const [isClient, setIsClient] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  
  const [notificationsList, setNotificationsList] = useState<Array<{
    id: number;
    title: string;
    desc: string;
    time: string;
    icon: string;
  }>>([]);

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setCustomDate(`${year}-${month}-${day}`);
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCustomTime(`${hours}:${minutes}`);

    setCurrentDay(now.toLocaleDateString('en-US', { weekday: 'long' }));

    const timer = setInterval(() => {
      const liveNow = new Date();
      setCurrentDay(liveNow.toLocaleDateString('en-US', { weekday: 'long' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (e.currentTarget.scrollTop > 250) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const list = [];
    
    if (lowStockProducts && lowStockProducts.length > 0) {
      list.push({
        id: 1,
        title: 'Low Stock Alert',
        desc: `${lowStockProducts.length} product(s) are running low on stock.`,
        time: 'Just now',
        icon: 'stock'
      });
    }

    if (recentOrders && recentOrders.length > 0) {
      recentOrders.slice(0, 5).forEach((ord, idx) => {
        list.push({
          id: 100 + idx,
          title: 'New Order Received!',
          desc: `Order #ORD-${String(ord.id).slice(0, 4)} by ${ord.customer_name || ord.customer || 'Customer'} (Rs. ${Number(ord.total_amount || 0).toLocaleString()})`,
          time: ord.created_at ? new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          icon: 'order'
        });
      });
    }

    const readIds = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    const filteredList = list.filter(n => !readIds.includes(n.id));
    setNotificationsList(filteredList);
  }, [lowStockProducts, recentOrders]);

  const unreadCount = notificationsList.length;

  useEffect(() => {
    const sanitized = searchQuery.trim();
    
    if (!sanitized) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const currentId = ++searchIdRef.current;

    const delayDebounce = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${sanitized}%`)
          .limit(10);

        if (currentId === searchIdRef.current) {
          if (!error && data) {
            setSearchResults(data);
          } else {
            setSearchResults([]);
          }
          setIsSearching(false);
        }
      } catch (err) {
        if (currentId === searchIdRef.current) {
          console.error('Search error:', err);
          setSearchResults([]);
          setIsSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = { 
              id: Date.now(), 
              title: 'New Order Received!', 
              desc: `Order #ORD-${String(payload.new.id).slice(0, 4)} has been placed successfully.`, 
              time: 'Just now', 
              icon: 'order' 
            };
            setNotificationsList(prev => [newNotif, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const newNotif = { 
              id: Date.now(), 
              title: 'Order Status Updated!', 
              desc: `Order #ORD-${String(payload.new.id).slice(0, 4)} status changed to ${payload.new.status}.`, 
              time: 'Just now', 
              icon: 'order' 
            };
            setNotificationsList(prev => [newNotif, ...prev]);
          }
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const markAllAsread = () => {
    const allIds = notificationsList.map(n => n.id);
    const readIds = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    localStorage.setItem('admin_read_notifications', JSON.stringify([...readIds, ...allIds]));
    setNotificationsList([]);
  };

  const totalStatOrders = totalOrders > 0 ? totalOrders : 1; 
  const getPct = (val: number = 0) => Math.round((val / totalStatOrders) * 100);
  const displayedOrders = recentOrders;

  const chartW = 700, chartH = 200, padX = 10, padY = 20;
  const maxSale = Math.max(...salesLast7Days, 1000);
  const stepX = (chartW - padX * 2) / (salesLast7Days.length - 1 || 1);
  const pointFor = (val: number, idx: number) => {
    const x = padX + idx * stepX;
    const y = chartH - padY - (val / maxSale) * (chartH - padY * 2);
    return { x, y };
  };
  const linePath = salesLast7Days
    .map((v, i) => {
      const { x, y } = pointFor(v, i);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPath = `${linePath} L ${padX + (salesLast7Days.length - 1) * stepX} ${chartH} L ${padX} ${chartH} Z`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/50 flex font-sans pb-16 md:pb-0">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main 
        ref={mainContainerRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative"
      >
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 min-h-[5rem] px-6 sm:px-8 pt-4 pb-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs gap-4">
          <div className="flex items-center gap-3 w-full max-w-md">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <Menu size={22} />
            </button>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search live products by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs focus:outline-none focus:border-blue-600 transition-all text-slate-800 shadow-inner"
              />
              {isSearching ? (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
              ) : searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={14} />
                </button>
              )}

              {searchQuery.trim() && (
                <div className="fixed left-4 right-4 sm:left-auto sm:right-auto sm:absolute sm:w-80 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Live Product Suggestions
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map((prod) => (
                      <Link 
                        key={prod.id} 
                        href={`/admin/products`}
                        onClick={() => setSearchQuery('')}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50/50 transition-colors text-xs"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={14} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{prod.name}</p>
                          <p className="text-[10px] text-slate-400">Stock: {prod.stock ?? 0} | Price: Rs. {prod.price ?? 0}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No live products found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative" ref={calendarRef}>
              <button 
                onClick={() => { setShowCalendar(prev => !prev); setShowNotifications(false); setShowAdminDropdown(false); }}
                className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                <Calendar size={16} className="text-blue-600 shrink-0" />
                <span className="hidden sm:inline">
                  {isClient && customDate ? new Date(customDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                </span>
                <span className="sm:hidden font-bold tabular-nums text-blue-600">{customTime || '--:--'}</span>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </button>

              {showCalendar && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">Customize Date & Time</span>
                    <button onClick={() => setShowCalendar(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs text-slate-600">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Date</label>
                      <input 
                        type="date" 
                        value={customDate} 
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Time</label>
                      <input 
                        type="time" 
                        value={customTime} 
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                      <span>Day: <strong className="text-slate-800">{currentDay}</strong></span>
                      <button 
                        onClick={() => {
                          const now = new Date();
                          setCustomDate(now.toISOString().split('T')[0]);
                          setCustomTime(now.toTimeString().slice(0,5));
                        }} 
                        className="text-blue-600 font-bold hover:underline cursor-pointer text-[10px]"
                      >
                        Reset to Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => { setShowNotifications(prev => !prev); setShowCalendar(false); setShowAdminDropdown(false); }}
                className="relative cursor-pointer text-slate-600 hover:text-slate-900 transition-colors p-2.5 rounded-xl hover:bg-slate-50"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
                    {notificationsList.length > 0 ? (
                      notificationsList.map((item) => (
                        <div key={item.id} className="p-3 transition-colors flex gap-3 items-start hover:bg-slate-50 bg-blue-50/30">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            item.icon === 'order' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {item.icon === 'order' ? <ShoppingCart size={14} /> : <AlertCircle size={14} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-800">{item.title}</p>
                              <span className="text-[9px] text-slate-400">{item.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No new notifications right now. 👍
                      </div>
                    )}
                  </div>

                  {notificationsList.length > 0 && (
                    <div className="p-2.5 text-center bg-slate-50 border-t border-slate-100">
                      <button onClick={markAllAsread} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Top Right Admin Profile Section with Clean Unknown/User Avatar */}
            <div className="relative pl-4 border-l border-slate-200" ref={adminDropdownRef}>
              <button 
                onClick={() => { setShowAdminDropdown(prev => !prev); setShowCalendar(false); setShowNotifications(false); }}
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">Admin</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Super Admin</p>
                </div>
                
                <div className="relative flex items-center gap-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-blue-50 flex items-center justify-center text-blue-700">
                    <UserIcon size={18} />
                  </div>
                  {/* Active Green Dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                <svg className="w-4 h-4 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdminDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 divide-y divide-slate-100">
                  <div className="px-4 py-3 sm:hidden">
                    <p className="text-xs font-bold text-slate-900">Admin</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Super Admin</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/admin/settings" 
                      onClick={() => setShowAdminDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings size={15} className="text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={async () => {
                        setShowAdminDropdown(false);
                        try {
                          await fetch('/api/admin/logout', { method: 'POST' });
                        } catch (err) {
                          console.error('Logout error:', err);
                        }
                        window.location.href = '/admin/login';
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {dbError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
              ⚠️ Database Warning: {dbError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Package, label: 'Total Products', value: totalProducts, color: '#2563eb', bg: 'bg-blue-100', text: 'text-blue-600' },
              { icon: ShoppingCart, label: 'Total Orders', value: totalOrders, color: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-600' },
              { icon: Clock, label: 'Pending Orders', value: pendingOrdersCount, color: '#d97706', bg: 'bg-amber-100', text: 'text-amber-600' },
              { icon: CheckCircle2, label: 'Completed Orders', value: completedOrdersCount, color: '#7c3aed', bg: 'bg-purple-100', text: 'text-purple-600' },
              { icon: TrendingUp, label: 'Total Sales', value: `Rs. ${totalSalesAmount.toLocaleString()}`, color: '#e11d48', bg: 'bg-rose-100', text: 'text-rose-600', span: true },
            ].map((s, i) => (
              <div key={i} className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 ${s.span ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.text} flex items-center justify-center`}>
                    <s.icon size={18} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 tracking-wide">{s.label}</p>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">{s.value}</h3>
                </div>
                <Sparkline color={s.color} points={[4, 6, 5, 8, 7, 9, 12, 10, 14]} />
                <p className="text-[10px] font-medium text-slate-400 -mt-1">from last month</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">Sales Overview</h3>
                <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-600 font-semibold">This Month: Rs. {currentMonthSales.toLocaleString()}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-xl font-extrabold text-slate-900">Rs. {totalSalesAmount.toLocaleString()}</h2>
                <span className={`text-xs font-bold ${monthGrowthPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {monthGrowthPercent >= 0 ? `↑ ${monthGrowthPercent}%` : `↓ ${Math.abs(monthGrowthPercent)}%`}
                </span>
                <span className="text-[10px] text-slate-400">vs. last month</span>
              </div>

              <div className="relative">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((i) => (
                    <line key={i} x1="0" x2={chartW} y1={(chartH / 4) * i} y2={(chartH / 4) * i} stroke="#f1f5f9" strokeWidth="1" />
                  ))}
                  <path d={areaPath} fill="url(#salesGradient)" />
                  <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
                  {salesLast7Days.map((v, i) => {
                    const { x, y } = pointFor(v, i);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={hoverIdx === i ? 6 : 4}
                        fill="#fff"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                        className="cursor-pointer"
                      />
                    );
                  })}
                </svg>
                {hoverIdx !== null && (
                  <div
                    className="absolute bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${(pointFor(salesLast7Days[hoverIdx], hoverIdx).x / chartW) * 100}%`,
                      top: `${(pointFor(salesLast7Days[hoverIdx], hoverIdx).y / chartH) * 100}%`,
                      transform: 'translate(-50%, -140%)',
                    }}
                  >
                    Rs. {salesLast7Days[hoverIdx].toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                <span>7 days ago</span>
                <span>Today</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900">Orders by Status</h3>
              <div className="space-y-2.5 pt-1">
                {[
                  { label: 'Pending', color: 'bg-amber-500', val: orderStatusCounts.Pending },
                  { label: 'Confirmed', color: 'bg-blue-500', val: orderStatusCounts.Confirmed },
                  { label: 'Shipped', color: 'bg-indigo-500', val: orderStatusCounts.Shipped },
                  { label: 'Delivered', color: 'bg-emerald-500', val: orderStatusCounts.Delivered },
                  { label: 'Cancelled', color: 'bg-rose-500', val: orderStatusCounts.Cancelled },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-2 text-slate-700"><span className={`w-2.5 h-2.5 rounded-full ${row.color}`}></span>{row.label}</span>
                      <span className="text-slate-900">{row.val} ({getPct(row.val)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${row.color} h-full rounded-full`} style={{ width: `${getPct(row.val)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
                <Link href="/admin/orders" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayedOrders.length > 0 ? (
                      displayedOrders.map((o) => {
                        const statusColor = 
                          o.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                          o.status === 'Confirmed' ? 'bg-blue-50 text-blue-700' :
                          o.status === 'Shipped' ? 'bg-indigo-50 text-indigo-700' :
                          'bg-emerald-50 text-emerald-700';

                        return (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-bold text-slate-900">#ORD-{String(o.id).slice(0, 4)}</td>
                            <td className="py-3 px-3 text-slate-700">{o.customer_name || o.customer || 'Guest Customer'}</td>
                            <td className="py-3 px-3 font-semibold text-slate-900">Rs. {Number(o.total_amount || 0).toLocaleString()}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
                                {o.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{new Date(o.created_at || Date.now()).toLocaleDateString()}</td>
                            <td className="py-3 px-3 text-right">
                              <Link href={`/admin/orders/${o.id}`} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all">
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No recent orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { href: '/admin/products', icon: PlusCircle, label: 'Add New Product', bg: 'bg-blue-50/60 hover:bg-blue-50 border-blue-100/50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
                  { href: '/admin/orders', icon: ShoppingCart, label: 'Manage Orders', bg: 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-100/50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
                  { href: '/admin/inventory', icon: Boxes, label: 'Update Inventory', bg: 'bg-purple-50/60 hover:bg-purple-50 border-purple-100/50', iconBg: 'bg-purple-100', text: 'text-purple-600' },
                  { href: '/admin/reports', icon: FileText, label: 'View Reports', bg: 'bg-amber-50/60 hover:bg-amber-50 border-amber-100/50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
                ].map((a) => (
                  <Link key={a.label} href={a.href} className={`flex flex-col items-start gap-2 p-3 rounded-2xl border transition-all text-xs font-bold text-slate-800 ${a.bg}`}>
                    <div className={`w-8 h-8 rounded-lg ${a.iconBg} ${a.text} flex items-center justify-center`}>
                      <a.icon size={16} />
                    </div>
                    <span className="leading-tight">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Top Selling Products</h3>
                <Link href="/admin/products" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topSellingProducts.length > 0 ? (
                  topSellingProducts.map((p, idx) => (
                    <div key={idx} className="relative bg-slate-50 border border-slate-100 rounded-2xl p-3">
                      <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                        {idx + 1}
                      </span>
                      <div className="w-full aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden mb-2 flex items-center justify-center font-bold text-slate-400 text-lg">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : (p.name?.[0] || '?')}
                      </div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-400">Sold: {p.sold || 0}</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">Rs. {Number(p.price || 0).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 col-span-4">No products found.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Low Stock Alert</h3>
                <Link href="/admin/inventory" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
              </div>
              <div className="space-y-2.5">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 3).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : (p.name?.[0] || '?')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">Stock left: {p.stock}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${Number(p.stock) === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {Number(p.stock) === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">All products have sufficient stock! 👍</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl transition-all cursor-pointer flex items-center justify-center"
            title="Scroll to top"
          >
            <ArrowUp size={18} />
          </button>
        )}

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-around z-40 shadow-lg">
          {[
            { href: '/admin/dashboard', icon: Package, label: 'Dashboard' },
            { href: '/admin/products', icon: Boxes, label: 'Products' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
            { href: '/admin/customers', icon: Users, label: 'Customers' },
            { href: '/admin/settings', icon: Settings, label: 'Settings' },
          ].map((nav) => (
            <Link key={nav.label} href={nav.href} className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors">
              <nav.icon size={18} />
              <span>{nav.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}