'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, Building2 } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'Punjab',
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(stored);
    } catch {
      setCart([]);
    }
    setLoaded(true);
  }, []);

  const shippingCost = form.deliveryMethod === 'express' ? 450 : 250;
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setLoading(true);

    try {
      // Save order to database via orders API
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          phone: form.phone,
          address: `${form.address}, ${form.city} (${form.province})`,
          city: form.city,
          items: cart,
          total_amount: total,
          payment_method: form.paymentMethod,
        }),
      });

      const orderResult = await orderRes.json();

      if (orderRes.ok) {
        const orderId = orderResult.order?.id || 'HL' + Math.floor(100000 + Math.random() * 900000);
        setPlacedOrderId(orderId);
        
        // Clear cart
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
        
        setLoading(false);
        setShowSuccessModal(true);
      } else {
        setErrorMsg(orderResult.error || 'Failed to place order. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  if (!loaded) return null;

  if (cart.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-20 text-center">
        <p className="text-sm font-bold text-slate-700 mb-2">Your cart is empty</p>
        <Link href="/shop" className="text-blue-700 font-semibold text-xs hover:underline">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 relative">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Checkout</span>
      </div>

      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold mb-6">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer & Shipping Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">Customer Information</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Natasha Maryam"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="natasha@gmail.com"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">Shipping Address</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House # 123, Main Street, Johar Town"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Lahore"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Province *</label>
                  <input
                    type="text"
                    required
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    placeholder="Punjab"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">Delivery Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${form.deliveryMethod === 'standard' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={form.deliveryMethod === 'standard'}
                      onChange={() => setForm({ ...form, deliveryMethod: 'standard' })}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <span className="text-xs font-bold text-slate-900">Standard Delivery (3-5 days)</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">Rs. 250</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${form.deliveryMethod === 'express' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={form.deliveryMethod === 'express'}
                      onChange={() => setForm({ ...form, deliveryMethod: 'express' })}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <span className="text-xs font-bold text-slate-900">Express Delivery (1-2 days)</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">Rs. 450</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${form.paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={() => setForm({ ...form, paymentMethod: 'cod' })}
                    className="w-4 h-4 text-blue-600 accent-blue-600 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cash on Delivery</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay when you receive your order</p>
                  </div>
                </label>

                <div className={`p-4 rounded-2xl border transition-all ${form.paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-slate-50/50'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={form.paymentMethod === 'bank'}
                      onChange={() => setForm({ ...form, paymentMethod: 'bank' })}
                      className="w-4 h-4 text-blue-600 accent-blue-600 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5"><Building2 size={14} className="text-blue-700"/> Bank Transfer</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Direct bank transfer details</p>
                    </div>
                  </label>
                  {form.paymentMethod === 'bank' && (
                    <div className="mt-3 pt-3 border-t border-blue-100 text-[11px] text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-blue-100">
                      <p className="font-bold text-blue-900">Meezan Bank — Kiswah Attire</p>
                      <p><span className="font-semibold">Account #:</span> 0102-0304050607</p>
                      <p><span className="font-semibold">IBAN:</span> PK35MEZN0000000102030405</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">Order Summary</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      <img src={item.image || '/clear-blue-floral-bedroom.png'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Qty: {item.qty}</p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">Rs. {(Number(item.price) * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">Rs. {(total - shippingCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold text-slate-900">Rs. {shippingCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                <span className="text-sm font-extrabold text-slate-900">Total</span>
                <span className="text-base sm:text-lg font-black text-blue-800">Rs. {total.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3.5 rounded-full text-xs shadow-lg shadow-blue-700/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-slate-100 relative">
              <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                <Check size={36} strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900">Order Placed Successfully!</h2>
                <p className="text-xs text-slate-500 font-medium">Thank you for your purchase. Your order has been received.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold">Order ID:</span>
                  <span className="font-extrabold text-blue-700 font-mono">#{placedOrderId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/shop');
                }}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-lg cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}