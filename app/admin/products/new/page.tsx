'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "../../components/AdminSidebar";
import { Package, PlusCircle, CheckCircle2, ArrowLeft, Loader2, Upload, AlertCircle, X, Check } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    price: '',
    oldPrice: '',
    stock: '',
    status: 'Active',
    image: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchMetaData();
  }, []);

  const fetchMetaData = async () => {
    try {
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      const { data: subCatData } = await supabase.from('sub_categories').select('*');
      if (subCatData) setSubCategories(subCatData);
    } catch (err) {
      console.error('Error fetching meta data:', err);
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setFormData({ ...formData, category: categoryName, subCategory: '' });
    
    const selectedCat = categories.find(c => c.name === categoryName);
    if (selectedCat) {
      const subs = subCategories.filter(sub => sub.category_id === selectedCat.id);
      setFilteredSubCategories(subs);
    } else {
      setFilteredSubCategories([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmAndSave = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setSuccessMessage(false);

    try {
      let imageUrl = formData.image;

      // 1. Upload Image to Supabase Storage if file selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);

        const { data: publicURLData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrl = publicURLData.publicUrl;
      }

      // 2. Direct Insert into Supabase 'products' table
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            category: formData.category,
            sub_category: formData.subCategory,
            description: formData.description,
            price: Number(formData.price),
            old_price: formData.oldPrice ? Number(formData.oldPrice) : null,
            stock: Number(formData.stock),
            status: formData.status,
            image: imageUrl,
          }
        ]);

      if (insertError) throw new Error(insertError.message);

      setSuccessMessage(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1200);

    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(error.message || 'Something went wrong!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-base font-bold text-slate-900">Add New Product</h1>
          </div>
        </header>

        <div className="p-8 max-w-4xl w-full mx-auto">
          {successMessage && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Success!</p>
                <p className="text-[11px]">Product has been successfully added to the live database.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Product Information</h3>
                <p className="text-[10px] text-slate-400">Enter details for the new home textile item</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter product name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800 cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subcategory <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800 cursor-pointer"
                    disabled={!formData.category}
                  >
                    <option value="">Select subcategory</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                  {formData.category && (
                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                      <Check size={12} /> Subcategories loaded based on selected category.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Enter product description" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[10px] text-slate-400">Price & Stock</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      placeholder="Rs. 0.00" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Old Price (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="Rs. 0.00" 
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock Quantity <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      placeholder="0" 
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="mb-4">
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-600 text-slate-800 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <label className="block font-bold text-slate-700 mb-1">Product Images <span className="text-rose-500">*</span></label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <Upload size={18} />
                      <span>Click to upload or drag and drop</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Supports: JPG, PNG, WEBP (Max 5MB)</span>
                    <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden relative shrink-0 shadow-sm">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full cursor-pointer">
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link href="/admin/products" className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</Link>
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                <span>Save Product</span>
              </button>
            </div>
          </form>
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Are you sure?</h3>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-600 cursor-pointer">Cancel</button>
                <button onClick={confirmAndSave} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">Save</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}