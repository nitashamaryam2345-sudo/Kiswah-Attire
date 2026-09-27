'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from "../../components/AdminSidebar";
import { Plus, Trash2, Edit, Loader2, CheckCircle, Tag, AlertTriangle, Menu, Search, ChevronDown, ChevronRight, Layers, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search State & Ref for Active Icon
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Main container ref & scroll to top state
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Expanded Categories State for Accordion
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);

  // Confirmation Modal states
  const [isConfirmAddModalOpen, setIsConfirmAddModalOpen] = useState(false);
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
  const [isConfirmAddSubModalOpen, setIsConfirmAddSubModalOpen] = useState(false);
  
  // Form fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  
  // Sub-category form specific fields
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Success & Delete Modals state
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null; type: 'category' | 'subcategory' | null }>({ 
    show: false, 
    id: null,
    type: null
  });

  // Fetch Data from Supabase
  const fetchData = async () => {
    try {
      const [catRes, subCatRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: false }),
        supabase.from('sub_categories').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false })
      ]);

      if (catRes.error) throw catRes.error;
      if (subCatRes.error) throw subCatRes.error;
      if (prodRes.error) throw prodRes.error;

      setCategories(catRes.data || []);
      setSubCategories(subCatRes.data || []);
      setProducts(prodRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setSubCategoryName('');
    setSelectedCategoryId('');
  };

  // --- Category Actions ---
  const handlePreAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { alert('Please enter category name.'); return; }
    setIsConfirmAddModalOpen(true);
  };

  const handleAddCategory = async () => {
    setIsConfirmAddModalOpen(false);
    setSubmitting(true);
    try {
      const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
      const { error } = await supabase.from('categories').insert([{ name, slug: generatedSlug }]);
      if (error) throw error;
      resetForm();
      setIsAddModalOpen(false);
      fetchData();
      setSuccessModal({ show: true, message: 'Category added successfully!' });
    } catch (error: any) {
      alert(`Failed to add category: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug || '');
    setIsEditModalOpen(true);
  };

  const handlePreUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!name.trim()) { alert('Please enter category name.'); return; }
    setIsConfirmEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    setIsConfirmEditModalOpen(false);
    setSubmitting(true);
    try {
      const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
      const { error } = await supabase.from('categories').update({ name, slug: generatedSlug }).eq('id', editingId);
      if (error) throw error;
      resetForm();
      setEditingId(null);
      setIsEditModalOpen(false);
      fetchData();
      setSuccessModal({ show: true, message: 'Category updated successfully!' });
    } catch (error: any) {
      alert(`Failed to update category: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Sub-Category Actions ---
  const handleOpenAddSub = (catId: string) => {
    resetForm();
    setSelectedCategoryId(catId);
    setIsAddSubModalOpen(true);
  };

  const handlePreAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !subCategoryName.trim()) { alert('Please enter sub-category name.'); return; }
    setIsConfirmAddSubModalOpen(true);
  };

  const handleAddSubCategory = async () => {
    setIsConfirmAddSubModalOpen(false);
    setSubmitting(true);
    try {
      const { error } = await supabase.from('sub_categories').insert([
        { category_id: selectedCategoryId, name: subCategoryName }
      ]);
      if (error) throw error;
      resetForm();
      setIsAddSubModalOpen(false);
      fetchData();
      setSuccessModal({ show: true, message: 'Sub-Category added successfully!' });
    } catch (error: any) {
      alert(`Failed to add sub-category: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    try {
      const tableName = deleteModal.type === 'category' ? 'categories' : 'sub_categories';
      const { error } = await supabase.from(tableName).delete().eq('id', deleteModal.id);
      if (error) throw error;
      setDeleteModal({ show: false, id: null, type: null });
      fetchData();
      setSuccessModal({ show: true, message: `${deleteModal.type === 'category' ? 'Category' : 'Sub-category'} deleted successfully!` });
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto relative"
      >
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <Menu size={22} />
            </button>
            <h1 className="text-base font-bold text-slate-900 hidden sm:block">Categories Management</h1>
          </div>

          {/* Active Search Bar in Header */}
          <div className="flex-1 max-w-md relative">
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
              title="Click to search"
            >
              <Search size={16} />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-600 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </header>

        {/* Content Section */}
        <div className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-2xs">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-900">Categories Management</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage your product categories and subcategories. Organize your store structure for better navigation.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No categories found. Click "Add Category" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Table Header - Improved Boldness & Spacing */}
                <div className="min-w-[700px] grid grid-cols-12 px-4 py-3.5 bg-slate-100 border-b border-slate-200 text-xs font-extrabold text-slate-700 uppercase tracking-wider rounded-t-xl">
                  <div className="col-span-4">Category / Subcategory</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Products</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="min-w-[700px] divide-y divide-slate-100">
                  {filteredCategories.map((cat) => {
                    const catSubCategories = subCategories.filter(
                      (sub) => sub.category_id === cat.id || sub.category === cat.name
                    );
                    const catProducts = products.filter(
                      (prod) => prod.category === cat.name || prod.category_id === cat.id
                    );
                    const isExpanded = expandedCategories[cat.id];

                    return (
                      <div key={cat.id} className="group hover:bg-slate-50/70 transition-colors">
                        {/* Parent Category Row */}
                        <div className="grid grid-cols-12 px-4 py-4 items-center">
                          <div className="col-span-4 flex items-center gap-3">
                            <button type="button" onClick={() => toggleCategoryExpand(cat.id)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-slate-200">
                              <Tag size={14} />
                            </div>
                            <span className="font-extrabold text-slate-900 text-xs">{cat.name}</span>
                          </div>

                          <div className="col-span-2">
                            <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold">Parent</span>
                          </div>

                          <div className="col-span-2">
                            <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 w-fit">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                            </span>
                          </div>

                          <div className="col-span-2 text-xs font-bold text-slate-800">
                            {catProducts.length}
                          </div>

                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAddSub(cat.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Plus size={13} /> Add Subcategory
                            </button>
                            <button type="button" onClick={() => handleOpenEdit(cat)} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all cursor-pointer">
                              <Edit size={13} />
                            </button>
                            <button type="button" onClick={() => setDeleteModal({ show: true, id: cat.id, type: 'category' })} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Sub-Categories Accordion Rows */}
                        {isExpanded && (
                          <div className="bg-slate-50/90 border-t border-slate-100 divide-y divide-slate-100/80 pl-8">
                            {catSubCategories.length === 0 ? (
                              <div className="py-3 px-4 text-xs text-slate-400 font-medium">No subcategories found. Click "Add Subcategory" above.</div>
                            ) : (
                              catSubCategories.map((sub) => {
                                const subProductsCount = products.filter(
                                  (prod) => prod.sub_category === sub.name || prod.sub_category_id === sub.id
                                ).length;

                                return (
                                  <div key={sub.id} className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-slate-100/80 transition-colors">
                                    <div className="col-span-4 flex items-center gap-2.5 pl-6">
                                      <Layers size={13} className="text-slate-500" />
                                      <span className="text-xs text-slate-800 font-bold">{sub.name}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-[11px] bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-md font-bold">Subcategory</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1.5 w-fit">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                                      </span>
                                    </div>
                                    <div className="col-span-2 text-xs font-bold text-slate-800">
                                      {subProductsCount}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                      <button type="button" onClick={() => setDeleteModal({ show: true, id: sub.id, type: 'subcategory' })} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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

        {/* Add Category Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handlePreAddCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name <span className="text-rose-500">*</span></label>
                  <input type="text" required placeholder="e.g. Bedding" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-slate-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Slug (Optional)</label>
                  <input type="text" placeholder="e.g. bedding" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-slate-50/50" />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span>{submitting ? 'Saving...' : 'Save Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Sub-Category Modal */}
        {isAddSubModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Add Sub-Category</h3>
                <button type="button" onClick={() => setIsAddSubModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handlePreAddSubCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Parent Category <span className="text-rose-500">*</span></label>
                  <select 
                    required 
                    value={selectedCategoryId} 
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-slate-50/50"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Sub-Category Name <span className="text-rose-500">*</span></label>
                  <input type="text" required placeholder="e.g. Zipper Mattress Cover" value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-slate-50/50" />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsAddSubModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span>{submitting ? 'Saving...' : 'Save Sub-Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Edit Category</h3>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handlePreUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name <span className="text-rose-500">*</span></label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-slate-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Slug (Optional)</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-slate-50/50" />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                    <span>{submitting ? 'Updating...' : 'Update Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modals */}
        {isConfirmAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto"><AlertTriangle size={24} /></div>
              <h3 className="text-sm font-bold text-slate-900">Are you sure?</h3>
              <p className="text-xs text-slate-500">Do you want to save this category?</p>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsConfirmAddModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer">No</button>
                <button type="button" onClick={handleAddCategory} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">Yes</button>
              </div>
            </div>
          </div>
        )}

        {isConfirmAddSubModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto"><AlertTriangle size={24} /></div>
              <h3 className="text-sm font-bold text-slate-900">Are you sure?</h3>
              <p className="text-xs text-slate-500">Do you want to save this sub-category?</p>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsConfirmAddSubModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer">No</button>
                <button type="button" onClick={handleAddSubCategory} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">Yes</button>
              </div>
            </div>
          </div>
        )}

        {isConfirmEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto"><AlertTriangle size={24} /></div>
              <h3 className="text-sm font-bold text-slate-900">Are you sure?</h3>
              <p className="text-xs text-slate-500">Do you want to update this category?</p>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsConfirmEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer">No</button>
                <button type="button" onClick={handleUpdateCategory} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">Yes</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto"><AlertTriangle size={24} /></div>
              <h3 className="text-sm font-bold text-slate-900">Are you sure?</h3>
              <p className="text-xs text-slate-500">Do you want to delete this item? This action cannot be undone.</p>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setDeleteModal({ show: false, id: null, type: null })} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer">No</button>
                <button type="button" onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer">Yes (Delete)</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle size={24} /></div>
              <h3 className="text-sm font-bold text-slate-900">Success!</h3>
              <p className="text-xs text-slate-500">{successModal.message}</p>
              <button type="button" onClick={() => setSuccessModal({ show: false, message: '' })} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">OK</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}