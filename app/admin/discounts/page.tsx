'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import { Tag, Loader2, Plus, CheckCircle, Trash2, Calendar, Edit, Menu, Search, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [value, setValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  // Fetch Discounts
  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error: any) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setValue('');
    setExpiryDate('');
    setExpiryTime('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: any) => {
    setEditingCoupon(item);
    setCode(item.code || '');
    setDiscountType(item.discount_type || 'percentage');
    setValue(item.value?.toString() || '');
    
    if (item.expiry_date) {
      const parts = item.expiry_date.split('T');
      setExpiryDate(parts[0] || '');
      setExpiryTime(parts[1] ? parts[1].slice(0, 5) : '');
    } else {
      setExpiryDate('');
      setExpiryTime('');
    }

    setIsModalOpen(true);
  };

  // Save (Create or Update) Discount
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalExpiry = null;
      if (expiryDate) {
        finalExpiry = expiryTime ? `${expiryDate}T${expiryTime}:00` : `${expiryDate}T23:59:00`;
      }

      if (editingCoupon) {
        // Update
        const { error } = await supabase
          .from('discounts')
          .update({
            code: code.toUpperCase().trim(),
            discount_type: discountType,
            value: parseFloat(value),
            expiry_date: finalExpiry,
          })
          .eq('id', editingCoupon.id);

        if (error) throw error;
        setSuccessModal({ show: true, message: 'Discount coupon updated successfully!' });
      } else {
        // Insert
        const { error } = await supabase
          .from('discounts')
          .insert([{
            code: code.toUpperCase().trim(),
            discount_type: discountType,
            value: parseFloat(value),
            expiry_date: finalExpiry,
            is_active: true
          }]);

        if (error) throw error;
        setSuccessModal({ show: true, message: 'Discount coupon created successfully!' });
      }

      setIsModalOpen(false);
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      alert(`Failed to save coupon: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Trigger
  const confirmDelete = (id: any) => {
    setDeleteModal({ show: true, id });
  };

  // Execute Delete Discount
  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', deleteModal.id);

      if (error) throw error;
      setDeleteModal({ show: false, id: null });
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error deleting discount:', error);
    }
  };

  // Filter discounts based on search query
  const filteredDiscounts = discounts.filter((item) =>
    item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.discount_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 hidden sm:block">Discounts & Coupons</h1>
          </div>

          <div className="flex-1 max-w-md relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search coupons by code or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-blue-600 transition-all"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create Coupon</span>
          </button>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Active Promo Codes</h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : filteredDiscounts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-extrabold">
                No discount coupons found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-900 uppercase">
                      <th className="py-3 px-4">Coupon Code</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Value</th>
                      <th className="py-3 px-4">Expiry Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-extrabold text-slate-900">
                    {filteredDiscounts.map((item) => {
                      const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
                      const isActive = item.is_active !== false && !isExpired;

                      const formattedExpiry = item.expiry_date 
                        ? new Date(item.expiry_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                        : 'No Expiry';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-4 px-4 font-extrabold text-slate-900 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Tag size={16} />
                            </div>
                            <span className="tracking-wider uppercase">{item.code}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-900 capitalize">{item.discount_type}</td>
                          <td className="py-4 px-4 font-extrabold text-slate-900">
                            {item.discount_type === 'percentage' ? `${item.value}%` : `Rs. ${Number(item.value).toLocaleString()}`}
                          </td>
                          <td className="py-4 px-4 text-slate-900">
                            {item.expiry_date ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-400 shrink-0" />
                                <span>{formattedExpiry}</span>
                              </div>
                            ) : (
                              'No Expiry'
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] border ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                              {isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Edit Coupon"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => confirmDelete(item.id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
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

        {/* Create / Edit Discount Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingCoupon ? 'Edit Discount Coupon' : 'Create New Discount Coupon'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-extrabold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveDiscount} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. WELCOME10"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 uppercase focus:outline-blue-600 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-blue-600 bg-slate-50/50 cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                      Value <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-blue-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Separate Fields for Date and Time with Hand Cursor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5 flex items-center gap-1">
                      <Calendar size={13} className="text-blue-600" />
                      <span>Select Date</span>
                    </label>
                    <input 
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-blue-600 bg-slate-50/50 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1.5 flex items-center gap-1">
                      <Clock size={13} className="text-blue-600" />
                      <span>Select Time</span>
                    </label>
                    <input 
                      type="time"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-blue-600 bg-slate-50/50 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span>{editingCoupon ? 'Update Coupon' : 'Save Coupon'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Are you sure?</h3>
                <p className="text-xs font-extrabold text-slate-500">Do you really want to delete this coupon? This action cannot be undone.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Success!</h3>
                <p className="text-xs font-extrabold text-slate-500">{successModal.message}</p>
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