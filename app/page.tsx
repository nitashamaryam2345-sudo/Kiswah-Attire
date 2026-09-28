import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import {
  ShoppingCart, ChevronRight,
  Sparkles, Check, Tag
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 0;

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string; category?: string }> 
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.search || '';

  const { data: products } = await supabase.from('products').select('*');
  const { data: categories } = await supabase.from('categories').select('*');

  let displayProducts = products || [];

  // Agar home page par search kiya gaya hai toh products filter honge
  if (searchQuery && searchQuery !== 'open') {
    displayProducts = displayProducts.filter((p: any) => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const featuredProducts = displayProducts.slice(0, 6);
  const displayCategories = categories || [];

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-800 pb-20 sm:pb-0 space-y-8 sm:space-y-12">

      {/* ===== HERO SECTION ===== */}
      <section className="pt-2 sm:pt-4">
        <div className="relative w-full h-[320px] sm:h-[360px] lg:h-[400px] overflow-hidden rounded-2xl sm:rounded-3xl flex items-center shadow-lg">
          <img
            src="/bedroom_banner_clean.jpg"
            alt="Kiswah Attire — Premium Bed Sheets & Sofa Covers"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          
          <div className="relative z-10 px-6 sm:px-16 max-w-xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-wide text-white bg-white/25 backdrop-blur-md border border-white/30 px-3 py-0.5 rounded-full">
              <Sparkles size={12} /> Pakistan's Trusted Home Textile Brand
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-black text-white leading-[1.1] drop-shadow-md">
              Elevate Every Room With Timeless Comfort
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-md drop-shadow">
              Discover luxuriously soft bed sheets and premium sofa covers designed for modern Pakistani homes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-xl transition-all"
              >
                Shop Collection <ChevronRight size={16} />
              </Link>
              <Link
                href="#categories"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold px-4 py-2.5 rounded-full text-xs sm:text-sm transition-all"
              >
                Categories
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[10px] sm:text-xs font-semibold text-white/90">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Premium Fabric</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Fast Delivery</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Cash on Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEARCH INPUT BAR (Agar search=open ho toh yahan input show kar sakte hain ya featured products filter honge) ===== */}
      {searchQuery === 'open' && (
        <div className="bg-white p-4 rounded-2xl shadow-md border border-blue-100">
          <form action="/" method="GET" className="flex gap-2">
            <input 
              type="text" 
              name="search" 
              placeholder="Search products on home..." 
              className="flex-1 border border-slate-300 px-4 py-2 rounded-xl text-xs outline-none focus:border-blue-600"
              autoFocus
            />
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold">
              Search
            </button>
          </form>
        </div>
      )}

      {/* ===== SHOP BY CATEGORY ===== */}
      <section id="categories">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg sm:text-2xl font-black text-blue-950 border-l-4 border-blue-700 pl-3">
            Shop By Category
          </h2>
          <Link href="/shop" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {displayCategories.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <p className="text-xs text-slate-500">No categories added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayCategories.map((cat: any) => {
              const catSlug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${catSlug}`}
                  className="group relative rounded-2xl overflow-hidden h-[220px] sm:h-[260px] border border-white/60 shadow-md hover:shadow-xl transition-all"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-blue-50/80 flex items-center justify-center">
                      <Tag size={40} className="text-blue-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="font-serif text-lg sm:text-xl font-black text-white drop-shadow-md mb-1">
                      {cat.name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white/95 uppercase tracking-wide">
                      Shop Now <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg sm:text-2xl font-black text-blue-950 border-l-4 border-blue-700 pl-3">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Products'}
          </h2>
          <Link href="/shop" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
            View All Products <ChevronRight size={14} />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-xs text-slate-500 mb-4">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {featuredProducts.map((p: any) => {
              const discountPercent = p.original_price && p.original_price > p.price
                ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                : 0;

              return (
                <div key={p.id} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {discountPercent > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-blue-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow">
                        {discountPercent}% OFF
                      </span>
                    )}
                    <img
                      src={p.image || '/clear-blue-floral-bedroom.png'}
                      alt={p.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mb-2.5">{p.category || 'Home Textile'}</p>

                    <div className="flex items-baseline gap-1.5 mb-2.5 mt-auto">
                      <span className="text-sm font-black text-blue-800">Rs. {Number(p.price || 0).toLocaleString()}</span>
                      {p.original_price && p.original_price > p.price && (
                        <span className="text-[10px] text-slate-400 line-through">Rs. {Number(p.original_price).toLocaleString()}</span>
                      )}
                    </div>

                    <Link
                      href={`/products/${p.id}`}
                      className="w-full flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-full text-[11px] transition-all shadow-sm"
                    >
                      <ShoppingCart size={13} /> Add to Cart
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}