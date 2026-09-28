'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, Check, Zap } from 'lucide-react';

interface ProductActionsProps {
  product: any;
  inStock: boolean;
  sizeOptions: string[];
  colorOptions: string[];
}

export default function ProductActions({ product, inStock, sizeOptions, colorOptions }: ProductActionsProps) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] || null);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || null);

  const maxQty = product.stock ? Number(product.stock) : Infinity;

  const addItemToCart = () => {
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = existing.findIndex(
      (item: any) => item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );

    if (idx > -1) {
      existing[idx].qty += qty;
    } else {
      existing.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
        qty,
      });
    }

    localStorage.setItem('cart', JSON.stringify(existing));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    try {
      addItemToCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error('Cart error:', err);
    }
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    try {
      addItemToCart();
      router.push('/cart');
    } catch (err) {
      console.error('Buy now error:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      {sizeOptions.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  selectedSize === s
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colorOptions.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                title={c}
                className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  selectedColor === c ? 'border-blue-700 scale-110' : 'border-slate-200'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-slate-200 rounded-full overflow-hidden shrink-0">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-900">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
        {product.stock && (
          <span className="text-[11px] text-slate-400">Max available: {product.stock}</span>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!inStock}
        className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-full text-xs transition-all ${
          !inStock
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : added
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
        }`}
      >
        {added ? <Check size={15} /> : <ShoppingCart size={15} />}
        {added ? 'Added to Cart!' : inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>

      <button
        onClick={handleBuyNow}
        disabled={!inStock}
        className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-full text-xs transition-all border-2 ${
          !inStock
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white hover:bg-slate-50 text-blue-900 border-blue-800 cursor-pointer shadow-xs'
        }`}
      >
        <Zap size={15} className="text-blue-700" />
        BUY IT NOW
      </button>
    </div>
  );
}