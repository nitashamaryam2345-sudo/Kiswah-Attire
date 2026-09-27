'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from "../../../components/AdminSidebar";
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Upload, Package, CheckCircle, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('Active');
  const [image, setImage] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const { data: catData } = await supabase.from('categories').select('*');
        if (catData) setCategories(catData);

        const { data: subCatData } = await supabase.from('sub_categories').select('*');
        if (subCatData) setSubCategories(subCatData);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setName(data.name || '');
          setCategory(data.category || '');
          setSubCategory(data.sub_category || '');
          setDescription(data.description || '');
          setPrice(data.price || '');
          setOldPrice(data.old_price || data.oldPrice || '');
          setStock(data.stock || '');
          setStatus(data.status || 'Active');
          setImage(data.image || '');
          setImagePreview(data.image || '');

          if (catData && data.category) {
            const matchedCat = catData.find((c: any) => c.name === data.category);
            if (matchedCat && subCatData) {
              setFilteredSubCategories(subCatData.filter((sub: any) => sub.category_id === matchedCat.id));
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        alert('Could not load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCategoryChange = (categoryName: string) => {
    setCategory(categoryName);
    setSubCategory('');
    
    const selectedCat = categories.find(c => c.name === categoryName);
    if (selectedCat) {
      setFilteredSubCategories(subCategories.filter(sub => sub.category_id === selectedCat.id));
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      let finalImageUrl = image;

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

        finalImageUrl = publicURLData.publicUrl;
      }

      const { error } = await supabase
        .from('products')
        .update({
          name,
          category,
          sub_category: subCategory,
          description,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          stock: Number(stock),
          status,
          image: finalImageUrl,
        })
        .eq('id', id);

      if (error) throw error;
      setSuccessModal(true);
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(`Failed to update product: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-base font-bold text-slate-900">Edit Product</h1>
          </div>
        </header>

        <div className="p-8 max-w-4xl w-full mx-auto">
          <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Product Information</h3>
                <p className="text-[11px] text-slate-500">Update details for this home textile item</p>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Subcategory <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">Select subcategory</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[10px] text-slate-400">Price & Stock</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Price (Rs.) <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Old Price (Optional)</label>
                    <input 
                      type="number" 
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Stock Quantity <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="mb-4">
                  <label className="block font-bold text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <label className="block font-bold text-slate-700 mb-1.5">Product Image <span className="text-rose-500">*</span></label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-550 hover:bg-slate-100 cursor-pointer">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Upload size={18} />
                      <span>Choose new image file</span>
                    </div>
                    <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <Link href="/admin/products" className="px-6 py-3 rounded-xl border text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50">Cancel</Link>
              <button type="submit" disabled={updating} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold cursor-pointer">
                {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Update Product</span>
              </button>
            </div>
          </form>
        </div>

        {successModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Successfully Updated!</h3>
              <button onClick={() => { setSuccessModal(false); router.push('/admin/products'); router.refresh(); }} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer">
                OK (Continue)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}