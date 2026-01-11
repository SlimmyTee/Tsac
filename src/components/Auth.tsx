import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Phone, Calendar, Upload, Eye, EyeOff, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verifyPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    law_enforcement_affiliated: '',
    date_of_birth: '',
    deposit_amount: '',
    duration: '',
    service_type: '',
    personal_items: '',
    profile_picture: null as File | null,
  });

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('profile_picture', file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.first_name || !formData.last_name) {
          setError('Please enter your first and last name');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.verifyPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { error } = await signUp({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          gender: formData.gender,
          law_enforcement_affiliated: formData.law_enforcement_affiliated,
          date_of_birth: formData.date_of_birth,
          deposit_amount: parseFloat(formData.deposit_amount) || 0,
          duration: parseInt(formData.duration) || 0,
          service_type: formData.service_type,
          personal_items: formData.personal_items,
          profile_picture: formData.profile_picture,
        });
        if (error) {
          setError(error.message);
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f0f4f1]">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url('/assets/images/auth-bg.png')` }}
      >
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-500 delay-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-white/40 backdrop-blur-md mb-4 shadow-sm border border-white/50">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 mb-2 tracking-tight">
            Therapeutic Service<span className="font-semibold text-emerald-700"> Access Card</span>
          </h1>
          <p className="text-slate-600 font-light text-lg">
            Your trusted journey to wellness and peace
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 p-6 md:p-10 relative overflow-hidden">
          {/* Decorative soft gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-200/20 blur-3xl pointer-events-none"></div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-100/50 rounded-xl mb-8 relative z-10">
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-3 text-center text-sm font-medium rounded-lg transition-all duration-300 ${!isSignUp
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-3 text-center text-sm font-medium rounded-lg transition-all duration-300 ${isSignUp
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all duration-300"
                placeholder="Email Address"
                required
              />
            </div>

            {/* Sign Up Fields */}
            {isSignUp && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  {/* Last Name */}
                  <div className="relative">
                    <input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="block w-full px-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                    placeholder="Mobile Number"
                    required
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider pl-1">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="block w-full px-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                      required
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider pl-1">Service Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={formData.deposit_amount}
                      onChange={(e) => handleInputChange('deposit_amount', e.target.value)}
                      className="block w-full px-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                      placeholder="Deposit Amount ($)"
                      required
                    />
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="block w-full px-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                      placeholder="Duration (Minutes)"
                      required
                    />
                  </div>
                  <select
                    value={formData.service_type}
                    onChange={(e) => handleInputChange('service_type', e.target.value)}
                    className="block w-full px-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                    required
                  >
                    <option value="">Select Service Type</option>
                    <option value="massage">Massage Therapy</option>
                    <option value="counseling">Counseling Session</option>
                    <option value="wellness">Wellness Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex flex-col gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer transition-all group text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500 group-hover:text-emerald-600">
                      <Upload className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-medium">{formData.profile_picture ? formData.profile_picture.name : 'Upload Profile Photo'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="block w-full pl-11 pr-12 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                placeholder="Password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Verify Password (Sign Up only) */}
            {isSignUp && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showVerifyPassword ? 'text' : 'password'}
                  value={formData.verifyPassword}
                  onChange={(e) => handleInputChange('verifyPassword', e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="Confirm Password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showVerifyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <span className="mt-0.5 block w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                  <Heart className="w-4 h-4 fill-white/20" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Protected by 256-bit encryption. Your privacy is our priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
