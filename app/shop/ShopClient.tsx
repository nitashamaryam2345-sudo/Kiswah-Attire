'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Tag,
  SlidersHorizontal,
  Home,
  ChevronRight,
  X,
  Search,
} from 'lucide-react';

interface Product {
  id: string | number;
  name: string;
  category?: string;
  price?: number | string;
  original_price?: number;
  stock?: number;
  color?: string;
  size?: string;
  image?: string;
}

interface Category {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
}

interface ShopClientProps {
  allProducts: Product[];
  allCategories: Category[];
  initialCategory: string;
  initialSearch: string;
  dbError: string | null;
}

const COLOR_HEX_MAP: Record<string, string> = {
  blue: '#1d4ed8',
  navy: '#0b1f3a',
  grey: '#94a3b8',
  gray: '#94a3b8',
  beige: '#e7d3ae',
  cream: '#f5ecd9',
  pink: '#f9a8d4',
  purple: '#a78bfa',
  green: '#34d399',
  yellow: '#fbbf24',
  white: '#f8fafc',
  black: '#0f172a',
  brown: '#92400e',
  red: '#ef4444',
  maroon: '#7f1d1d',
  floral: '#d946ef',
  multi: '#94a3b8',
};

function colorToHex(name?: string) {
  if (!name) return '#cbd5e1';
  return COLOR_HEX_MAP[name.trim().toLowerCase()] || '#cbd5e1';
}

const PRICE_RANGES = [
  { key: 'u2500', label: 'Under Rs. 2,500', test: (p: number) => p < 2500 },
  { key: '2500-4000', label: 'Rs. 2,500 - 4,000', test: (p: number) => p >= 2500 && p <= 4000 },
  { key: '4000+', label: 'Rs. 4,000+', test: (p: number) => p > 4000 },
];

export default function ShopClient({
  allProducts,
  allCategories,
  initialCategory,
  initialSearch,
  dbError,
}: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceKeys, setSelectedPriceKeys] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc'>('popularity');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchTerm) params.set('search', searchTerm);
    const qs = params.toString();
    const url = qs ? `/shop?${qs}` : '/shop';
    window.history.replaceState(null, '', url);
  }, [selectedCategory, searchTerm]);

  const getPrice = (p: Product) => parseFloat(String(p.price ?? '0')) || 0;

  const matchedCategoryObj = selectedCategory
    ? allCategories.find(
        (c) => (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')) === selectedCategory
      )
    : null;

  const currentCategoryName = matchedCategoryObj ? matchedCategoryObj.name : 'Shop All Products';
  const currentCategoryDesc =
    matchedCategoryObj?.description ||
    'Discover premium quality bedding and home linen for a more comfortable home.';

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      const key = (p.category || '').toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const sizeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (!p.size) return;
      counts[p.size] = (counts[p.size] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allProducts]);

  const colorOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    allProducts.forEach((p) => {
      if (p.color && !seen.has(p.color.toLowerCase())) {
        seen.add(p.color.toLowerCase());
        list.push(p.color);
      }
    });
    return list;
  }, [allProducts]);

  const availabilityCounts = useMemo(() => {
    const inStock = allProducts.filter((p) => Number(p.stock ?? 0) > 0).length;
    const outStock = allProducts.length - inStock;
    return { inStock, outStock };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (selectedCategory && matchedCategoryObj) {
      list = list.filter((p) => p.category?.toLowerCase() === matchedCategoryObj.name?.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }

    if (selectedPriceKeys.length > 0) {
      list = list.filter((p) => {
        const price = getPrice(p);
        return selectedPriceKeys.some((key) => PRICE_RANGES.find((r) => r.key === key)?.test(price));
      });
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.size && selectedSizes.includes(p.size));
    }

    if (selectedColors.length > 0) {
      list = list.filter((p) => p.color && selectedColors.includes(p.color));
    }

    if (selectedAvailability.length > 0) {
      list = list.filter((p) => {
        const inStock = Number(p.stock ?? 0) > 0;
        return (
          (selectedAvailability.includes('in') && inStock) ||
          (selectedAvailability.includes('out') && !inStock)
        );
      });
    }

    if (sortBy === 'price-asc') list.sort((a, b) => getPrice(a) - getPrice(b));
    else if (sortBy === 'price-desc') list.sort((a, b) => getPrice(b) - getPrice(a));

    return list;
  }, [
    allProducts,
    selectedCategory,
    matchedCategoryObj,
    searchTerm,
    selectedPriceKeys,
    selectedSizes,
    selectedColors,
    selectedAvailability,
    sortBy,
  ]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedPriceKeys([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedAvailability([]);
    setSearchTerm('');
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedPriceKeys.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedAvailability.length > 0 ||
    searchTerm;

  const FilterPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Filter Products</h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer">
            Clear All
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide pb-2.5 border-b border-slate-100">
          <SlidersHorizontal size={14} className="text-blue-600" /> Category
        </div>
        <button
          onClick={() => setSelectedCategory('')}
          className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
            !selectedCategory ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Products <span className="opacity-70">({allProducts.length})</span>
        </button>
        {allCategories.map((cat) => {
          const catSlug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-');
          const isActive = selectedCategory === catSlug;
          const count = categoryCounts[cat.name?.toLowerCase()] || 0;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isActive ? '' : catSlug)}
              className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                isActive ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
          Price Range
        </h4>
        <div className="space-y-2 text-xs text-slate-600">
          {PRICE_RANGES.map((r) => (
            <label key={r.key} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={selectedPriceKeys.includes(r.key)}
                onChange={() => toggle(selectedPriceKeys, setSelectedPriceKeys, r.key)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {sizeOptions.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">Size</h4>
          <div className="space-y-2 text-xs text-slate-600">
            {sizeOptions.map(([size, count]) => (
              <label key={size} className="flex items-center justify-between cursor-pointer hover:text-slate-900">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggle(selectedSizes, setSelectedSizes, size)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{size}</span>
                </div>
                <span className="text-[10px] text-slate-400">({count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {colorOptions.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">Color</h4>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {colorOptions.map((color) => {
              const isActive = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => toggle(selectedColors, setSelectedColors, color)}
                  title={color}
                  style={{ backgroundColor: colorToHex(color) }}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer ${
                    isActive ? 'ring-2 ring-offset-1 ring-blue-700' : 'ring-1 ring-slate-300'
                  }`}
                  aria-label={color}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
          Availability
        </h4>
        <div className="space-y-2 text-xs text-slate-600">
          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAvailability.includes('in')}
                onChange={() => toggle(selectedAvailability, setSelectedAvailability, 'in')}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>In Stock</span>
            </div>
            <span className="text-[10px] text-slate-400">({availabilityCounts.inStock})</span>
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAvailability.includes('out')}
                onChange={() => toggle(selectedAvailability, setSelectedAvailability, 'out')}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Out of Stock</span>
            </div>
            <span className="text-[10px] text-slate-400">({availabilityCounts.outStock})</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {dbError && (
        <div className="w-full pt-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
            ⚠️ Database Warning: {dbError}
          </div>
        </div>
      )}

      {/* ===== HERO / PAGE BANNER ===== */}
      <div className="w-full pt-4 sm:pt-6">
        <div className="relative bg-[#f0f6fb] border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <div className="absolute inset-0 z-0">
            <img
              src="/glossy-blue-bedding-extra-wide-no-text.png"
              alt="Shop Banner"
              className="w-full h-full object-cover object-center opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f0f6fb] via-[#f0f6fb]/70 to-transparent"></div>
          </div>

          <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2 font-semibold">
              <Link href="/" className="hover:text-blue-900 flex items-center gap-1 transition-colors">
                <Home size={12} /> Home
              </Link>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="text-slate-900 font-bold">
                {searchTerm ? `Search: "${searchTerm}"` : currentCategoryName}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b1f3a] tracking-tight mb-2">
              {searchTerm ? `Search results for "${searchTerm}"` : currentCategoryName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl font-medium leading-relaxed">
              {searchTerm ? 'Showing matched items from our catalog.' : currentCategoryDesc}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Mobile filter bar ===== */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 mt-4 flex items-center justify-between">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer"
        >
          <SlidersHorizontal size={14} /> Filters {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
        </button>
        <span className="text-[11px] text-slate-500 font-medium">{filteredProducts.length} products</span>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" />
          <div className="relative w-[85%] max-w-xs bg-white h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-900">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-slate-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            {FilterPanel}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-4 bg-blue-700 text-white font-bold py-3 rounded-xl text-xs"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="w-full py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">{FilterPanel}</aside>

        {/* Product grid section */}
        <div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <p className="text-xs font-medium text-slate-500 hidden lg:block">
                Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> product
                {filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-2xs">
              <p className="text-xs text-slate-500 mb-4">No products match your filters. Try adjusting or clearing them.</p>
              <button
                onClick={clearAllFilters}
                className="inline-block bg-blue-700 text-white font-bold px-5 py-2.5 rounded-full text-xs hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p) => {
                const price = parseFloat(String(p.price ?? '0')) || 0;
                const discountPercent =
                  p.original_price && p.original_price > price
                    ? Math.round(((p.original_price - price) / p.original_price) * 100)
                    : 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      {discountPercent > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-blue-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm">
                          {discountPercent}% OFF
                        </span>
                      )}
                      <img
                        src={p.image || '/clear-blue-floral-bedroom.png'}
                        alt={p.name || 'Product'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mb-2 flex items-center gap-1">
                        <Tag size={10} /> {p.category || 'Home Textile'}
                      </p>

                      <div className="flex items-baseline gap-1.5 mb-3 mt-auto">
                        <span className="text-sm font-black text-blue-800">Rs. {price.toLocaleString()}</span>
                        {p.original_price && p.original_price > price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            Rs. {Number(p.original_price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/products/${p.id}`}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-xl text-[11px] transition-all shadow-sm"
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
    </div>
  );
}