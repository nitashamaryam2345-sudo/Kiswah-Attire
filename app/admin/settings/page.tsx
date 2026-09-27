'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import { 
  Settings, Loader2, CheckCircle, Store, Mail, Phone, 
  Menu, MapPin, Clock, Eye, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form Fields State
  const [storeName, setStoreName] = useState('Kiswah Attire');
  const [tagline, setTagline] = useState('Bed Sheets & Sofa Covers');
  const [storeEmail, setStoreEmail] = useState('support@kiswahattire.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [address, setAddress] = useState('House 12B, Street 4, Gulberg, Lahore');
  const [timezone, setTimezone] = useState('(GMT+05:00) Pakistan Time');
  const [storeStatus, setStoreStatus] = useState('live');

  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
      }

      if (data) {
        setStoreName(data.store_name || 'Kiswah Attire');
        setTagline(data.tagline || '');
        setStoreEmail(data.store_email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setTimezone(data.timezone || '(GMT+05:00) Pakistan Time');
        setStoreStatus(data.store_status || 'live');
      }
    } catch (error: any) {
      console.error('Unexpected error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: existing } = await supabase.from('settings').select('id').limit(1);

      const payload = {
        store_name: storeName,
        tagline,
        store_email: storeEmail,
        phone,
        address,
        timezone,
        store_status: storeStatus,
        updated_at: new Date()
      };

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([payload]);
        if (error) throw error;
      }

      setSuccessModal({ show: true, message: 'Store settings updated successfully!' });
    } catch (error: any) {
      console.error('Error saving settings details:', JSON.stringify(error, null, 2));
      alert(`Failed to save settings: ${error.message || JSON.stringify(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative pb-20 md:pb-8">
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900">Store Settings</h1>
              <p className="text-[10px] text-slate-500 hidden sm:block">Manage your store details, contact information and other important settings.</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left & Center Columns (Main Settings) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Information */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Settings size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">Basic Information</h3>
                      <p className="text-[10px] text-slate-500">Your store's basic details.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-extrabold text-slate-900 mb-1">Store Name *</label>
                      <div className="relative">
                        <Store size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-extrabold bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-900 mb-1">Tagline / Slogan *</label>
                      <div className="relative">
                        <Store size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-extrabold bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-900 mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={storeEmail}
                          onChange={(e) => setStoreEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-extrabold bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-900 mb-1">Contact Phone *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-extrabold bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-extrabold text-slate-900 mb-1">Address *</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-extrabold bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-extrabold text-slate-900 mb-1">Timezone *</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-extrabold bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="(GMT+05:00) Pakistan Time">(GMT+05:00) Pakistan Time</option>
                          <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column / End (Quick Actions) */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 lg:sticky lg:top-24">
                  <h3 className="text-xs font-extrabold text-slate-900">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open('/', '_blank')}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>Preview Store</span>
                    </button>
                    <button
                      type="button"
                      onClick={fetchSettings}
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                    >
                      <RefreshCw size={15} />
                      <span>Reset to Default</span>
                    </button>
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Success Modal */}
        {successModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Success!</h3>
                <p className="text-xs text-slate-500 font-extrabold">{successModal.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccessModal({ show: false, message: '' })}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}