'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AdminSidebar from "../components/AdminSidebar";
import { Loader2, Search, Eye, Trash2, Package, CheckCircle, Clock, XCircle, AlertTriangle, Menu, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Search State & Ref for Active Icon
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Main container ref & scroll to top state
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Custom Delete Modal State
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Open custom delete modal
  const confirmDeleteOrder = (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToDelete(order);
  };

  // Actual delete function executed from custom modal
  const handleDeleteConfirmed = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      await supabase.from('order_items').delete().eq('order_id', orderToDelete.id);
      const { error } = await supabase.from('orders').delete().eq('id', orderToDelete.id);
      if (error) throw error;

      setOrders(orders.filter((order) => order.id !== orderToDelete.id));
      setOrderToDelete(null);
    } catch (error: any) {
      console.error('Error deleting order:', error);
      alert(`Failed to delete order: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Scroll Handler for Main Container
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (e.currentTarget.scrollTop > 200) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-900';
      case 'Shipped':
        return 'bg-purple-100 text-purple-900';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-900';
      default:
        return 'bg-amber-100 text-amber-900';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const idMatch = String(order.id).toLowerCase().includes(query);
    const nameMatch = String(order.customer_name || '').toLowerCase().includes(query);
    const phoneMatch = String(order.phone || '').toLowerCase().includes(query);
    return idMatch || nameMatch || phoneMatch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => !o.status || o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Shipped').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter((o) => o.status === 'Cancelled').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto relative"
      >
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base font-bold text-slate-900 hidden sm:block">Orders Management</h1>
          </div>
          
          <div className="flex-1 max-w-md relative">
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
              title="Click to search"
            >
              <Search size={16} />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search orders by ID, customer name or phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-500 focus:outline-blue-600 transition-all"
            />
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wider">TOTAL ORDERS</span>
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800"><Package size={18} /></div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{totalOrdersCount}</p>
              <p className="text-[11px] font-bold text-emerald-700">↑ Live data</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wider">PENDING</span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800"><Clock size={18} /></div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{pendingOrdersCount}</p>
              <p className="text-[11px] font-bold text-amber-700">Requires action</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wider">DELIVERED</span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800"><CheckCircle size={18} /></div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{deliveredOrdersCount}</p>
              <p className="text-[11px] font-bold text-emerald-700">Successfully completed</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wider">CANCELLED</span>
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800"><XCircle size={18} /></div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{cancelledOrdersCount}</p>
              <p className="text-[11px] font-bold text-rose-700">Cancelled orders</p>
            </div>
          </div>

          {/* Orders Table Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-2xs overflow-hidden">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">All Store Orders</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
                        Loading orders...
                      </td>
                    </tr>
                  ) : currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          #HL-{String(order.id).slice(0, 5).toUpperCase()}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-extrabold text-slate-900">{order.customer_name || 'N/A'}</p>
                          <p className="text-[11px] text-slate-500 font-bold">{order.phone || 'No phone'}</p>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          Rs. {Number(order.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700">
                          {order.payment_method || 'Cash on Delivery'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${getStatusBadge(order.status)}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all font-bold flex items-center gap-1"
                              title="View Order"
                            >
                              <Eye size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => confirmDeleteOrder(order, e)}
                              className="p-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition-all cursor-pointer font-bold flex items-center gap-1"
                              title="Delete Order"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                        No orders found in live database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-400 font-medium">
                Showing {filteredOrders.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-bold disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'}`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-bold disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Scroll to Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all z-30 cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Delete Confirmation Popup Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">Are you sure?</h3>
              <p className="text-xs font-bold text-slate-600">
                Do you want to delete order <span className="text-slate-900">#HL-{String(orderToDelete.id).slice(0, 5).toUpperCase()}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
              >
                No (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirmed}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                <span>Yes (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}