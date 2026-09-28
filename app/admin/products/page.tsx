'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import Link from 'next/link';
import { Plus, Trash2, Edit, AlertCircle, Loader2, Menu, Search, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search State & Ref for Active Icon
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Main container ref & scroll to top state
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Pagination States for Unlimited Pages
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Products fetch karne ke liye function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete confirm hone par run hoga
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(`Failed to delete product: ${error.message}`);
    } finally {
      setDeleting(false);
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

  // Filter products based on search query
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar with Mobile Drawer Support */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto relative"
      >
        {/* Header with Mobile Menu, Active Search Bar, and Add Button */}
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
            <h1 className="text-base font-bold text-slate-900 hidden sm:block">Products Management</h1>
          </div>

          {/* Active Search Bar in Header */}
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
              placeholder="Search product by name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-500 focus:outline-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/admin/products/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Product</span>
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-2xs overflow-hidden">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">All Store Products</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category & Subcategory</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                        <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
                        Loading products...
                      </td>
                    </tr>
                  ) : currentProducts.length > 0 ? (
                    currentProducts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-800 shadow-xs">
                            {p.image ? (
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="w-12 h-12 min-w-[48px] min-h-[48px] object-cover rounded-xl" 
                              />
                            ) : (
                              <span>{p.name?.[0]}</span>
                            )}
                          </div>
                          <span className="font-extrabold text-slate-900">{p.name}</span>
                        </td>
                        
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">
                            {p.category || 'N/A'}
                          </div>
                          {p.sub_category && (
                            <div className="text-[11px] text-blue-700 font-bold mt-0.5">
                              ↳ {p.sub_category}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 font-extrabold text-slate-900">Rs. {Number(p.price).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${p.stock > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/admin/products/edit/${p.id}`}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all font-bold"
                              title="Edit Product"
                            >
                              <Edit size={14} />
                            </Link>

                            <button 
                              type="button"
                              onClick={() => setDeleteId(p.id)}
                              className="p-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition-all cursor-pointer font-bold"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold text-xs">
                        No products found in live database. Click &quot;Add New Product&quot; to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Unlimited Dynamic Pagination Bar */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-400 font-medium">
                Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
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
        {deleteId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Are you sure?</h3>
                <p className="text-xs font-bold text-slate-600">Do you want to delete this product? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  No (Cancel)
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  <span>Yes (Delete)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}