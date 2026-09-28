'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, ArrowLeft, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfileAndOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Fetch orders matching customer email
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', session.user.email)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    };

    getProfileAndOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-500 font-medium">
        Loading profile & orders...
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold">
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Customer Info Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xl shadow-inner">
            {user?.user_metadata?.name?.[0]?.toUpperCase() || <User size={28} />}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">{user?.user_metadata?.name || 'Valued Customer'}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Mail size={13}/> {user?.email}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5"><Phone size={13}/> {user?.user_metadata?.phone || 'Not provided'}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck size={16} /> Verified Customer
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Package size={18} className="text-blue-700" /> My Order History
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Package size={28} />
            </div>
            <p className="text-sm font-bold text-slate-800">No orders found</p>
            <p className="text-xs text-slate-400">You haven't placed any orders yet.</p>
            <div className="pt-2">
              <Link href="/shop" className="inline-block bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md">
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Order ID: </span>
                    <span className="font-extrabold text-blue-700 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                    <CheckCircle2 size={14} /> Confirmed / Processing
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          <img src={item.image || '/clear-blue-floral-bedroom.png'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">Rs. {(Number(item.price) * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Total Amount ({order.payment_method?.toUpperCase()}):</span>
                  <span className="text-sm font-black text-blue-800">Rs. {Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}