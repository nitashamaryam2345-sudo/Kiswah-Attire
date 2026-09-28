import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import ShopClient from './ShopClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop All Products | Kiswah Attire',
  description:
    'Browse our full collection of premium bed sheets, sofa covers and home textiles. Filter by category, price, size and color.',
  robots: { index: true, follow: true },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;

  const { data: categories, error: catError } = await supabase.from('categories').select('*');

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, category, price, stock, color, size, image, created_at')
    .order('created_at', { ascending: false });

  const dbError = catError?.message || prodError?.message || null;

  return (
    <div className="w-full">
      <ShopClient
        allProducts={products || []}
        allCategories={categories || []}
        initialCategory={resolvedParams.category || ''}
        initialSearch={resolvedParams.search || ''}
        dbError={dbError}
      />
    </div>
  );
}