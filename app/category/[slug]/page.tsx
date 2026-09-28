import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { ShoppingCart, ChevronRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  console.log("URL Slug received:", slug);

  // 1. Fetch all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*');

  if (catError) {
    console.error('Categories fetch error:', catError);
  }

  const displayCategories = categories || [];

  // 2. Match category by slug or name-based slug
  const matchedCat = displayCategories.find(
    (c: any) => 
      c.slug === slug || 
      c.name?.toLowerCase().replace(/\s+/g, '-') === slug ||
      c.name?.toLowerCase() === slug.replace(/-/g, '_') ||
      c.name?.toLowerCase() === slug.replace(/-/g, ' ')
  );

  console.log("Matched Category:", matchedCat);

  if (!matchedCat) {
    notFound();
  }

  // 3. Fetch products belonging to this category
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*')
    .eq('category', matchedCat.name)
    .order('created_at', { ascending: false });

  if (prodError) {
    console.error('Products fetch error:', prodError);
  }

  const displayProducts = products || [];
  console.log("Fetched Products count:", displayProducts.length);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-16">
      
      {/* ===== HERO BANNER ===== */}
      <div className="w-full pt-4 sm:pt-6">
        <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-sm">
          {/* Banner Background Image */}
          <img 
            src="/bed_sheets_banner.jpg" 
            alt={matchedCat.name} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Light Overlay */}
          <div className="absolute inset-0 bg-black/5"></div>

          {/* Text Content over Image */}
          <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10 text-slate-900">
            <div className="flex items-center gap-1.5 text-[11px] text-blue-900 font-semibold mb-1.5">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight size={12} />
              <Link href="/shop" className="hover:text-blue-600">Shop</Link>
              <ChevronRight size={12} />
              <span className="text-slate-700">{matchedCat.name}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-black text-blue-950 mb-1 tracking-tight">
              {matchedCat.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 max-w-md">
              Soft, breathable and stylish {matchedCat.name.toLowerCase()} for a better night's sleep.
            </p>
          </div>
        </div>
      </div>

      {/* ===== PRODUCTS GRID ===== */}
      <div className="w-full py-6 sm:py-8">
        <p className="text-xs text-slate-400 mb-4">{displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} found</p>

        {displayProducts.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-12 text-center">
            <p className="text-xs text-slate-500 mb-4">No products found in this category yet.</p>
            <Link href="/shop" className="inline-block bg-blue-700 text-white font-bold px-5 py-2.5 rounded-full text-xs transition-all hover:bg-blue-800">
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {displayProducts.map((p: any) => {
              const discountPercent = p.original_price && p.original_price > p.price
                ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                : 0;

              return (
                <div key={p.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {discountPercent > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-blue-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10">
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
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mb-2">{p.name}</h3>

                    <div className="flex items-baseline gap-1.5 mb-3 mt-auto">
                      <span className="text-sm font-black text-blue-800">Rs. {Number(p.price || 0).toLocaleString()}</span>
                      {p.original_price && p.original_price > p.price && (
                        <span className="text-[10px] text-slate-400 line-through">Rs. {Number(p.original_price).toLocaleString()}</span>
                      )}
                    </div>

                    <Link
                      href={`/products/${p.id}`}
                      className="w-full flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-full text-[11px] transition-all"
                    >
                      <ShoppingCart size={13} /> View Product
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}