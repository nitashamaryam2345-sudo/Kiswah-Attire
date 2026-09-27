'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import { Users, Loader2, Mail, Phone, ShoppingBag, DollarSign, Menu, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers from Supabase (Database logic untouched)
  const fetchCustomers = async () => {
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

  // Filter customers based on search query (Name or Email)
  const filteredCustomers = customers.filter((cust) =>
    cust.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Header with Mobile Menu Toggle and Search Bar */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base font-bold text-slate-900 hidden sm:block">Customers Management</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-600 transition-all"
            />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">All Store Customers</h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No customers found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4 text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : <Users size={16} />}
                          </div>
                          <span>{cust.name || 'Unnamed'}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} className="text-slate-400 shrink-0" />
                            <span>{cust.email || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{cust.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                            {cust.total_orders || 0} orders
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-900">
                          Rs. {Number(cust.total_spent || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}