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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
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
        .select('*')
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
      const stockNum = parseInt(newStock) || 0;
      const { error } = await supabase
        .from('products')
        .update({ stock: stockNum })
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

  // Unique Categories list for dropdown
  const categoriesList = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filtered Products calculation based on search, category & status dropdowns
  const filteredProducts = products.filter((item) => {
    const stockVal = Number(item.stock || 0);
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Dropdown Category filtering
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;

    // Dropdown Status filtering
    if (selectedStatus === 'In Stock' && stockVal <= 5) return false;
    if (selectedStatus === 'Low Stock' && (stockVal > 5 || stockVal <= 0)) return false;
    if (selectedStatus === 'Out of Stock' && stockVal > 0) return false;

    return true;
  });

  // Metrics Calculations
  const totalProductsCount = products.length;
  const inStockCount = products.filter(p => Number(p.stock || 0) > 5).length;
  const lowStockCount = products.filter(p => {
    const s = Number(p.stock || 0);
    return s > 0 && s <= 5;
  }).length;
  const outOfStockCount = products.filter(p => Number(p.stock || 0) <= 0).length;

  const lowStockPercentage = totalProductsCount ? Math.round((lowStockCount / totalProductsCount) * 100) : 0;
  const outOfStockPercentage = totalProductsCount ? Math.round((outOfStockCount / totalProductsCount) * 100) : 0;
  const inStockPercentage = totalProductsCount ? Math.round((inStockCount / totalProductsCount) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto relative pb-12"
      >
        {/* Header with Mobile Menu Toggle and Title */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-sm md:text-base font-extrabold text-slate-900">Inventory Management</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">Manage your product stock, update quantities and keep track of low stock items.</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-[1500px] w-full mx-auto space-y-6">

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Total Products</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{totalProductsCount}</h2>
              <p className="text-[10px] text-emerald-600 font-extrabold">Active in warehouse</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">In Stock</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{inStockCount}</h2>
              <p className="text-[10px] text-slate-400 font-extrabold">{inStockPercentage}% of total</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Low Stock</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{lowStockCount}</h2>
              <p className="text-[10px] text-amber-600 font-extrabold">{lowStockPercentage}% of total</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Out of Stock</span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Package size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{outOfStockCount}</h2>
              <p className="text-[10px] text-rose-600 font-extrabold">{outOfStockPercentage}% of total</p>
            </div>
          </div>

          {/* Main Inventory Section (Full Width) */}
          <div className="space-y-4">
            
            {/* Search & Dropdown Filters Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px] relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by product name, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-blue-600 transition-all"
                />
              </div>

              {/* Category Filter Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 focus:outline-blue-600 cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter Dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 focus:outline-blue-600 cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedStatus('All Status');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Products Table Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">Product Inventory List ({filteredProducts.length})</h3>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-extrabold">
                  Koi product inventory record nahi mila.
                </div>
              ) : (
                <div className="overflow-x-auto min-h-[350px]">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase">
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Stock Qty</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-extrabold text-slate-900">
                      {filteredProducts.map((item) => {
                        const stockNum = Number(item.stock || 0);
                        const isLow = stockNum > 0 && stockNum <= 5;
                        const isOut = stockNum <= 0;

                        const statusBadge = isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold border bg-rose-50 text-rose-600 border-rose-100">Out of Stock</span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold border bg-amber-50 text-amber-600 border-amber-100">Low Stock ({stockNum})</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold border bg-emerald-50 text-emerald-600 border-emerald-100">In Stock ({stockNum})</span>
                        );

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-9 h-9 rounded-xl object-cover shadow-xs" />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs shadow-xs">
                                    <Package size={16} />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-extrabold text-slate-900 line-clamp-1">{item.name || 'Unnamed Product'}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold">{item.color ? `Color: ${item.color}` : ''}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 font-bold">
                              {item.sku || `#SKU-${item.id ? item.id.slice(0, 5).toUpperCase() : '1000'}`}
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {item.category || '-'}
                            </td>

                            <td className="py-3.5 px-4">
                              {statusBadge}
                            </td>

                            <td className="py-3.5 px-4 text-slate-900 font-black">
                              Rs. {Number(item.price || 0).toLocaleString()}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenModal(item)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all cursor-pointer inline-flex items-center gap-1.5 font-extrabold text-[11px]"
                              >
                                <Edit size={13} />
                                <span>Update</span>
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