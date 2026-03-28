import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserLayout } from './UserLayout';
import { User, Mail, Phone, Calendar, MapPin, Save, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ProfilePage() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setSaving(true);
    setSaved(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout currentPage="profile">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1 md:px-0">

        {/* Profile Header */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-white shadow-lg">
              {profile?.first_name?.[0] || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 md:p-2 bg-white rounded-full text-slate-600 shadow-md hover:text-emerald-600 transition">
              <UserCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{profile?.full_name || 'User Profile'}</h1>
            <p className="text-sm md:text-base text-slate-500">{profile?.email}</p>
            <div className="mt-2 md:mt-3 inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-xs font-medium">
              {profile?.role || 'Verified Member'}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Personal Information</h2>
            {saved && <span className="text-emerald-600 text-xs md:text-sm font-medium animate-pulse">Changes Saved!</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 md:gap-y-6">

              {/* First Name */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2 group-focus-within:text-emerald-600 transition-colors">
                  <User className="w-4 h-4" /> First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="First Name"
                />
              </div>

              {/* Last Name */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2 group-focus-within:text-emerald-600 transition-colors">
                  <User className="w-4 h-4" /> Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="Last Name"
                />
              </div>

              {/* Email - Read Only typically */}
              <div className="group opacity-70">
                <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-base text-slate-600 cursor-not-allowed font-medium"
                />
              </div>

              {/* Mobile Number */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2 group-focus-within:text-emerald-600 transition-colors">
                  <Phone className="w-4 h-4" /> Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Date of Birth */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2 group-focus-within:text-emerald-600 transition-colors">
                  <Calendar className="w-4 h-4" /> Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              {/* Gender */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2 group-focus-within:text-emerald-600 transition-colors">
                  <UserCircle className="w-4 h-4" /> Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2 group">
                <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2 group-focus-within:text-emerald-600 transition-colors">
                  <MapPin className="w-4 h-4" /> Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="Full Home Address"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-5 md:pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
