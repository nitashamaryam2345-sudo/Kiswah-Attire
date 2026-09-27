'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import { Package, Loader2, CheckCircle, AlertTriangle, Edit, Menu, Search, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search State & Ref
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Main container ref & scroll to top state
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Edit stock modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  // Fetch products stock from Supabase
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, price, category, image')
        .order('name', { ascending: true });

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching inventory:', error);
        }
      }

      setProducts(data || []);
    } catch (error: any) {
      console.error('Unexpected error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

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

  // Open Edit Stock Modal
  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setNewStock(product.stock?.toString() || '0');
    setIsModalOpen(true);
  };

  // Update Stock in Database
  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: parseInt(newStock) || 0 })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setIsModalOpen(false);
      fetchInventory();
      setSuccessModal({ show: true, message: 'Inventory stock updated successfully!' });
    } catch (error: any) {
      console.error('Error updating stock:', error);
      alert(`Failed to update stock: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto relative"
      >
        {/* Header with Mobile Menu Toggle and Search Bar */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base font-bold text-slate-900 hidden sm:block">Inventory Management</h1>
          </div>

          {/* Active Search Bar */}
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
              placeholder="Search inventory by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-500 focus:outline-blue-600 transition-all"
            />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-2xs">
            <div className="mb-5">
              <h3 className="text-sm font-extrabold text-slate-900">Stock Levels & Warehouse</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Manage and monitor inventory stock quantities across your product listings.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-xs">
                No products found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-xs font-extrabold text-slate-900 uppercase tracking-wider rounded-t-xl">
                      <th className="py-3.5 px-4">Product Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock Quantity</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold">
                    {filteredProducts.map((item) => {
                      const isLowStock = Number(item.stock) <= 5;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/75 transition-all">
                          <td className="py-4 px-4 font-extrabold text-slate-900 flex items-center gap-3">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" 
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-slate-200">
                                <Package size={16} />
                              </div>
                            )}
                            <span className="text-slate-900">{item.name}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-400 font-bold">{item.category || '-'}</td>
                          <td className="py-4 px-4 text-slate-900 font-extrabold">Rs. {Number(item.price || 0).toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                              isLowStock 
                                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                                : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                            }`}>
                              {item.stock} in stock {isLowStock && '(Low)'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenModal(item)}
                              className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 transition-all cursor-pointer inline-flex items-center gap-1.5 font-extrabold text-[11px]"
                            >
                              <Edit size={14} />
                              <span>Update Stock</span>
                            </button>
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

        {/* Update Stock Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900">Update Stock: {selectedProduct?.name}</h3>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 text-xs font-extrabold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateStock} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                    New Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="e.g. 50"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-blue-600 bg-slate-50/50"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                    <span>Save Stock</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Popup Modal */}
        {successModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Success!</h3>
                <p className="text-xs font-bold text-slate-400">{successModal.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccessModal({ show: false, message: '' })}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}