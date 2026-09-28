import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Star, ChevronRight, ShieldCheck, Truck, RotateCcw, Tag } from "lucide-react";
import ProductActions from "./ProductActions";
import ProductTabs from "./ProductTabs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const { data: product } = await supabase
    .from('products')
    .select('name, description, image')
    .eq('id', productId)
    .maybeSingle();

  if (!product) return { title: 'Product Not Found | Kiswah Attire' };

  return {
    title: `${product.name} | Kiswah Attire`,
    description: product.description || `Buy ${product.name} at best price.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = resolvedParams.id; 

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error) console.error('Product fetch error:', error);
  if (!product) notFound();

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false });
    
  const reviews = reviewsData || [];

  const priceNum = Number(product.price) || 0;
  const originalPriceNum = product.original_price ? Number(product.original_price) : null;
  const discountPercent = originalPriceNum && originalPriceNum > priceNum
    ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
    : 0;

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, name, price, image')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(4);

  const images: string[] = Array.isArray((product as any).images) && (product as any).images.length > 0
    ? (product as any).images
    : [product.image || '/clear-blue-floral-bedroom.png'];

  const inStock = product.stock === undefined || product.stock === null ? true : Number(product.stock) > 0;

  const sizeOptions: string[] = Array.isArray(product.sizes)
    ? product.sizes
    : product.size ? [product.size] : [];

  const colorOptions: string[] = Array.isArray(product.colors)
    ? product.colors
    : product.color ? [product.color] : [];

  const specs = [
    { label: 'Material', value: product.material },
    { label: 'Thread Count', value: product.thread_count },
    { label: 'Size', value: product.size },
    { label: 'Pattern', value: product.pattern },
    { label: 'Color', value: product.color },
  ].filter(s => s.value); 

  return (
    <div className="max-w-[1350px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-blue-600">Shop</Link>
        <ChevronRight size={12} />
        <span className="text-slate-700">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex gap-3">
          {images.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
              {images.slice(0, 5).map((img, i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-blue-500 transition-colors">
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 relative">
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-blue-800 text-white text-[10px] font-black px-2.5 py-1 rounded-full z-10">
                {discountPercent}% OFF
              </span>
            )}
            <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide flex items-center gap-1 mb-2">
            <Tag size={11} /> {product.category || 'Home Textile'}
          </p>
          <h1 className="font-serif text-xl sm:text-2xl font-black text-blue-950 mb-2">{product.name}</h1>

          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-4">
            <Star size={14} fill="currentColor" />
            <span className="text-slate-700">{product.rating || 'No rating yet'}</span>
            {reviews.length > 0 && (
              <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-2xl font-black text-blue-800">Rs. {priceNum.toLocaleString()}</span>
            {originalPriceNum && originalPriceNum > priceNum && (
              <span className="text-sm text-slate-400 line-through">Rs. {originalPriceNum.toLocaleString()}</span>
            )}
          </div>

          {product.description && (
            <p className="text-xs text-slate-600 leading-relaxed mb-5">{product.description}</p>
          )}

          <div className="mb-6">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                In Stock {product.stock ? `(${product.stock} left)` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <ProductActions
            product={product}
            inStock={inStock}
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
          />

          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center text-center gap-1.5">
              <ShieldCheck size={18} className="text-blue-600" />
              <p className="text-[10px] font-bold text-slate-600">Premium Quality</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <Truck size={18} className="text-blue-600" />
              <p className="text-[10px] font-bold text-slate-600">Fast Delivery</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <RotateCcw size={18} className="text-blue-600" />
              <p className="text-[10px] font-bold text-slate-600">7-Day Returns</p>
            </div>
          </div>
        </div>
      </div>

      <ProductTabs product={product} specs={specs} reviews={reviews} />

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <h2 className="font-serif text-lg sm:text-xl font-black text-blue-950 border-l-4 border-blue-700 pl-3 mb-5">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p: any) => (
              <Link key={p.id} href={`/products/${p.id}`} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img src={p.image || '/clear-blue-floral-bedroom.png'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                  <p className="text-xs font-black text-blue-800 mt-1">Rs. {Number(p.price || 0).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}