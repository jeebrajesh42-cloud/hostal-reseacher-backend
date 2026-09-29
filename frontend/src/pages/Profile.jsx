import React, { useState } from 'react';
import { 
  User, Mail, MapPin, Wallet, Shield, Save, 
  Building2, Plus, Check, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import authService from '../services/authService';
import hostelService from '../services/hostelService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [preferredCity, setPreferredCity] = useState(user?.preferred_city || 'Bhopal');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthly_budget || 15000);
  const [saving, setSaving] = useState(false);

  // Admin New Hostel Form State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [newHostel, setNewHostel] = useState({
    name: '',
    description: '',
    hostel_type: 'boys',
    address: '',
    area: '',
    city: 'Bhopal',
    pincode: '462011',
    monthly_rent: 7000,
    food_charge: 2000,
    food_included: true,
    electricity_charge: 400,
    rating: 4.5
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name,
        preferred_city: preferredCity,
        monthly_budget: parseFloat(monthlyBudget)
      });
      updateUser(updated);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateHostelAdmin = async (e) => {
    e.preventDefault();
    try {
      await hostelService.createHostel(newHostel);
      showToast('New hostel published successfully!', 'success');
      setAdminModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to create hostel.', 'danger');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563EB&color=fff`}
          alt={user?.name}
          className="w-20 h-20 rounded-3xl object-cover border-2 border-primary-100 shadow-md"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-secondary-900 tracking-tight">{user?.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
              user?.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-primary-50 text-primary-700'
            }`}>
              {user?.role === 'admin' ? 'Administrator' : 'Student Account'}
            </span>
          </div>
          <p className="text-xs text-secondary-500">{user?.email}</p>
          <p className="text-xs text-secondary-400">
            Preferred Student Hub: <strong className="text-secondary-700">{user?.preferred_city || 'Bhopal'}</strong>
          </p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-6">
        <h2 className="text-lg font-bold text-secondary-900">Student Preferences & Budget</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Target Monthly Budget (₹)
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Preferred Hub / City
              </label>
              <select
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
              >
                <option value="Bhopal">Bhopal</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Delhi">Delhi</option>
                <option value="Kota">Kota</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin Management Section (Section 37) */}
      {user?.role === 'admin' && (
        <div className="bg-amber-50/60 rounded-3xl p-6 md:p-8 border border-amber-200/80 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-950">
                  Hostel Management Administration
                </h3>
                <p className="text-xs text-amber-800">
                  You possess administrator privileges to add and manage student residences.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAdminModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Hostel</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Publish Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-secondary-900 mb-1">Publish New Hostel</h3>
            <p className="text-xs text-secondary-500 mb-6">Create a new student residence listing</p>

            <form onSubmit={handleCreateHostelAdmin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Hostel Name *</label>
                <input
                  type="text"
                  required
                  value={newHostel.name}
                  onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  placeholder="e.g. Royal Oxford Student Living"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description *</label>
                <textarea
                  required
                  rows="2"
                  value={newHostel.description}
                  onChange={(e) => setNewHostel({ ...newHostel, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  placeholder="Hostel facilities and location details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Hostel Type</label>
                  <select
                    value={newHostel.hostel_type}
                    onChange={(e) => setNewHostel({ ...newHostel, hostel_type: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="co-ed">Co-ed</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={newHostel.monthly_rent}
                    onChange={(e) => setNewHostel({ ...newHostel, monthly_rent: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">City</label>
                  <input
                    type="text"
                    value={newHostel.city}
                    onChange={(e) => setNewHostel({ ...newHostel, city: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={newHostel.area}
                    onChange={(e) => setNewHostel({ ...newHostel, area: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                    placeholder="e.g. MP Nagar, Koramangala"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold"
                >
                  Publish Hostel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
