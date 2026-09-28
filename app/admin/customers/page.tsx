'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import Link from "next/link";
import { 
  Users, Loader2, Mail, Phone, Search, Menu, Package, Boxes, 
  ShoppingCart, Settings, Download, ShieldCheck, DollarSign, UserPlus, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers from Supabase
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter Customers based only on Search Query
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = 
      cust.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Calculations for Stats
  const totalCustomersCount = customers.length;
  const newCustomersCount = customers.filter(c => c.status === 'New').length;
  const activeCustomersCount = customers.filter(c => c.status === 'Active' || c.status === 'VIP' || c.status === 'Returning').length;
  const totalSpendSum = customers.reduce((acc, curr) => acc + Number(curr.total_spent || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans pb-16 md:pb-0">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative pb-12">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-sm md:text-base font-extrabold text-slate-900">Customers Management</h1>
              <p className="text-[10px] text-slate-500 hidden sm:block">Manage your store customers and view details.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone, or customer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-blue-600 transition-all"
            />
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Exporting customer data...')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">

          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Total Customers</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{totalCustomersCount.toLocaleString()}</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">New Customers</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{newCustomersCount}</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Active Customers</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{activeCustomersCount}</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Total Customer Spend</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Rs. {totalSpendSum.toLocaleString()}</h2>
            </div>
          </div>

          {/* Customers Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Customer List ({filteredCustomers.length})</h3>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-extrabold">
                Koi customer record nahi mila.
              </div>
            ) : (
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase">
                      <th className="py-3 px-4">Customer Name & ID</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-extrabold text-slate-900">
                    {filteredCustomers.map((cust) => {
                      const statusColor = 
                        cust.status === 'VIP' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        cust.status === 'New' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        cust.status === 'Returning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        cust.status === 'Inactive' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100';

                      // Format date nicely
                      const formattedDate = cust.created_at 
                        ? new Date(cust.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : '-';

                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Profile Picture & Customer Name + Customer ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {cust.avatar_url ? (
                                <img src={cust.avatar_url} alt={cust.name} className="w-9 h-9 rounded-xl object-cover shadow-sm" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                                  {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                              )}
                              <div>
                                <h4 className="font-extrabold text-slate-900">{cust.name || 'Unnamed'}</h4>
                                <span className="text-[10px] text-blue-600 font-bold">#CUST-{cust.id ? cust.id.slice(0, 6).toUpperCase() : '0000'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Mail size={13} className="text-slate-400 shrink-0" />
                              <span>{cust.email || '-'}</span>
                            </div>
                          </td>

                          {/* Phone Number */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-slate-400 shrink-0" />
                              <span>{cust.phone || '-'}</span>
                            </div>
                          </td>

                          {/* Account Creation Date */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusColor}`}>
                              {cust.status || 'Active'}
                            </span>
                          </td>

                          {/* Total Spent */}
                          <td className="py-3.5 px-4 text-right font-black text-slate-900">
                            Rs. {Number(cust.total_spent || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
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