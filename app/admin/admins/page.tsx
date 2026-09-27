
'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import { 
  ShieldCheck, UserPlus, Trash2, Edit, Loader2, CheckCircle2, 
  X, AlertCircle, Search, MoreVertical, Shield, User, CheckCircle, 
  Mail, Calendar, Eye, EyeOff 
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // <-- Imported from lib/supabase

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');
  const [status, setStatus] = useState('Active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  // Dropdown Action Menu State per row
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Custom Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Fetch Admins from Supabase
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admins details:', JSON.stringify(error, null, 2));
      } else {
        setAdmins(data || []);
      }
    } catch (err) {
      console.error('Unexpected catch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Open Modal for Adding New Admin
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setRole('Admin');
    setStatus('Active');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  // Open Modal for Editing Existing Admin
  const handleOpenEditModal = (admin: any) => {
    setEditingId(admin.id);
    setName(admin.name);
    setEmail(admin.email);
    setRole(admin.role || 'Admin');
    setStatus(admin.status || 'Active');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
    setActiveDropdown(null);
  };

  // Open View Profile Modal
  const handleOpenProfileModal = (admin: any) => {
    setSelectedAdmin(admin);
    setShowProfileModal(true);
    setActiveDropdown(null);
  };

  // Trigger Custom Confirmation Box on Form Submit
  const handleFormSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!editingId && password.length < 6) {
      alert('Password must be at least 6 characters long for authentication.');
      return;
    }

    const actionType = editingId ? 'update' : 'add';
    const message = role === 'Super Admin' 
      ? `Are you sure you want to ${actionType} this Super Admin?`
      : `Are you sure you want to ${actionType} this admin?`;

    setConfirmMessage(message);
    setPendingAction(() => executeSaveAdmin);
    setShowConfirmModal(true);
  };

  // Execute Actual Save / Update after confirmation with Supabase Auth Integration
  const executeSaveAdmin = async () => {
    setSubmitting(true);

    if (editingId) {
      const payload: any = { name, email, role, status };
      const { error } = await supabase
        .from('admins')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        alert('Error updating admin: ' + error.message);
      } else {
        setSuccessMessage('Admin updated successfully!');
        setShowModal(false);
        fetchAdmins();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { name: name, role: role }
        }
      });

      if (authError) {
        alert('Authentication error: ' + authError.message);
        setSubmitting(false);
        return;
      }

      const payload: any = { 
        id: authData.user?.id,
        name, 
        email, 
        role, 
        status, 
        created_at: new Date() 
      };

      const { error: dbError } = await supabase
        .from('admins')
        .insert([payload]);

      if (dbError) {
        alert('Error saving admin to table: ' + dbError.message);
      } else {
        setSuccessMessage('Admin added successfully and authentication account created!');
        setShowModal(false);
        fetchAdmins();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
    setSubmitting(false);
  };

  // Delete Admin Handler with Confirmation
  const handleDeleteAdmin = (id: string) => {
    setActiveDropdown(null);
    setConfirmMessage('Are you sure you want to delete this admin? This action cannot be undone.');
    setPendingAction(() => async () => {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (error) {
        alert('Error deleting admin: ' + error.message);
      } else {
        setSuccessMessage('Admin deleted successfully!');
        fetchAdmins();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    });
    setShowConfirmModal(true);
  };

  // Filtered Admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || admin.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || (admin.status || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats Calculations
  const totalAdmins = admins.length;
  const superAdminsCount = admins.filter(a => a.role === 'Super Admin').length;
  const regularAdminsCount = admins.filter(a => a.role !== 'Super Admin').length;
  const activeAdminsCount = admins.filter(a => (a.status || 'Active') === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative pb-12">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900">Admin Management</h1>
              <p className="text-[10px] text-slate-500">Manage who can access your store, assign roles and control permissions.</p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Add New Admin</span>
          </button>
        </header>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-6">
          
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <p className="text-xs font-extrabold">{successMessage}</p>
            </div>
          )}

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Total Admins</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{totalAdmins}</h2>
              <p className="text-[10px] text-slate-500">All registered admin accounts</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Super Admins</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Shield size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{superAdminsCount}</h2>
              <p className="text-[10px] text-slate-500">Full access to all features</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Admins</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{regularAdminsCount}</h2>
              <p className="text-[10px] text-slate-500">Limited access based on role</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Active Accounts</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={18} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{activeAdminsCount}</h2>
              <p className="text-[10px] text-slate-500">Currently active store managers</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 min-w-[260px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Admins Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs font-extrabold">
                No matching admins found.
              </div>
            ) : (
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase">
                      <th className="pb-3 px-4">Admin</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 px-4">Role</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">Created At</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-extrabold text-slate-900">
                    {filteredAdmins.map((admin) => {
                      const initials = admin.name ? admin.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';
                      const adminStatus = admin.status || 'Active';

                      return (
                        <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors relative">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                                {initials}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900">{admin.name}</h4>
                                <span className="text-[10px] text-slate-500">Store Manager</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-900">{admin.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                              admin.role === 'Super Admin' 
                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {admin.role || 'Admin'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                              adminStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {adminStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-right relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === admin.id ? null : admin.id)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Action Menu */}
                            {activeDropdown === admin.id && (
                              <div className="absolute right-4 top-12 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-1.5 text-left space-y-0.5">
                                <button
                                  onClick={() => handleOpenProfileModal(admin)}
                                  className="w-full px-3 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye size={14} className="text-blue-500" />
                                  <span>View Profile</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(admin)}
                                  className="w-full px-3 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit size={14} className="text-amber-500" />
                                  <span>Edit Admin</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  className="w-full px-3 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* View Profile Modal */}
        {showProfileModal && selectedAdmin && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900">Admin Profile Details</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                  {selectedAdmin.name ? selectedAdmin.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{selectedAdmin.name}</h4>
                  <span className="text-xs text-slate-500">Store Manager</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-extrabold flex items-center gap-1.5"><Mail size={14} /> Email Address</span>
                  <span className="font-extrabold text-slate-900">{selectedAdmin.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-extrabold flex items-center gap-1.5"><Shield size={14} /> Assigned Role</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold border ${
                    selectedAdmin.role === 'Super Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>{selectedAdmin.role || 'Admin'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-extrabold flex items-center gap-1.5"><CheckCircle size={14} /> Account Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold border ${
                    (selectedAdmin.status || 'Active') === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>{selectedAdmin.status || 'Active'}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-extrabold flex items-center gap-1.5"><Calendar size={14} /> Created At</span>
                  <span className="font-extrabold text-slate-900">{selectedAdmin.created_at ? new Date(selectedAdmin.created_at).toLocaleString() : 'N/A'}</span>
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Admin Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingId ? 'Edit Admin' : 'Add New Admin'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmitClick} className="space-y-4 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-900 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-extrabold text-slate-900 cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-900 mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-extrabold text-slate-900 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {!editingId && (
                  <>
                    <div>
                      <label className="block font-extrabold text-slate-900 mb-1">Password (Min 6 chars) *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter authentication password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-extrabold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-900 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-extrabold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-extrabold text-slate-900 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    <span>{editingId ? 'Update Admin' : 'Save Admin'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirmation Dialog Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-60 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Are you sure?</h3>
                <p className="text-xs text-slate-500 font-extrabold">{confirmMessage}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-extrabold text-slate-900 hover:bg-slate-50 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (pendingAction) pendingAction();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}