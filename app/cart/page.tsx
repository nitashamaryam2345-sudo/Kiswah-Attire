'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, Check } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(stored);
    } catch {
      setCart([]);
    }
    setLoaded(true);

    const handleStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(stored);
      } catch {
        setCart([]);
      }
    };
    window.addEventListener('cart-updated', handleStorage);
    return () => window.removeEventListener('cart-updated', handleStorage);
  }, []);

  const updateQty = (id: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (!loaded) return null;

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const shippingFee = 250; // Delivery charges set to 250
  const totalAmount = subtotal + (cart.length > 0 ? shippingFee : 0);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Shopping Cart</span>
      </div>

      {/* Step Indicator Buttons */}
      <div className="flex items-center justify-center max-w-xl mx-auto mb-10 px-4">
        <button className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-600/30">
            1
          </div>
          <span className="text-xs font-extrabold text-blue-900">Cart</span>
        </button>
        <div className="w-16 sm:w-28 h-0.5 bg-slate-200 mx-2"></div>
        <button onClick={() => router.push('/checkout')} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700 flex items-center justify-center text-xs font-bold transition-colors">
            2
          </div>
          <span className="text-xs font-medium text-slate-400 group-hover:text-blue-700">Checkout</span>
        </button>
        <div className="w-16 sm:w-28 h-0.5 bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
            3
          </div>
          <span className="text-xs font-medium text-slate-400">Confirmation</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            Shopping Cart
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
              {cart.reduce((sum, item) => sum + item.qty, 0)} items
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your items before proceeding to secure checkout.</p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 px-4 py-2.5 rounded-xl transition-all"
        >
          ← Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <p className="text-sm font-bold text-slate-700">Your shopping cart is empty.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white font-extrabold px-6 py-3 rounded-full text-xs shadow-md shadow-blue-700/20 transition-all"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                    <img
                      src={item.image || '/clear-blue-floral-bedroom.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs font-extrabold text-blue-700 mt-1">Rs. {Number(item.price).toLocaleString()}</p>
                    <span className="inline-block text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                      In Stock
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 p-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-[10px] text-slate-400 font-medium">Total</p>
                    <p className="text-xs sm:text-sm font-black text-slate-900">
                      Rs. {(Number(item.price) * item.qty).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 lg:sticky lg:top-24">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">Order Summary</h3>
            
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                <span className="font-semibold text-slate-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">Rs. {shippingFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
              <span className="text-sm font-extrabold text-slate-900">Total Amount</span>
              <span className="text-base sm:text-lg font-black text-blue-800">Rs. {totalAmount.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3.5 rounded-full text-xs shadow-lg shadow-blue-700/20 hover:shadow-xl hover:shadow-blue-700/30 transition-all cursor-pointer mt-2"
            >
              Proceed to Secure Checkout
              <ArrowRight size={14} />
            </Link>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <p className="flex items-center gap-2 font-medium">
                <Check size={13} className="text-emerald-600 shrink-0" /> Secure Checkout & Verified Purchases
              </p>
              <p className="flex items-center gap-2 font-medium">
                <Check size={13} className="text-emerald-600 shrink-0" /> Fast & Reliable Delivery across Pakistan
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}