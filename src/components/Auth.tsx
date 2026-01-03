import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Phone, Calendar, Upload, Eye, EyeOff } from 'lucide-react';

export function Auth() {
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
        // Validate required fields
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

        // Convert profile picture to base64 if provided
        let profilePictureBase64: string | null = null;
        if (formData.profile_picture) {
          profilePictureBase64 = await fileToBase64(formData.profile_picture);
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
          profile_picture: profilePictureBase64,
        });
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background with blurred image effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-white text-lg mb-2">Welcome to</p>
          <h1 className="text-5xl font-bold text-purple-400 mb-2">
            Therapeuticserviceaccesscard
          </h1>
          <p className="text-white/90 text-sm">
            The most popular and trusted escrow service
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-3 text-center font-medium transition ${
                !isSignUp
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-3 text-center font-medium transition ${
                isSignUp
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            {/* Sign Up Fields */}
            {isSignUp && (
              <>
                {/* First Name */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="First Name"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Last Name"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="Mobile Number..."
                      required
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* Law Enforcement */}
                <div>
                  <label htmlFor="law_enforcement" className="block text-sm font-medium text-gray-300 mb-2">
                    Are you affiliated with any law enforcement agency
                  </label>
                  <select
                    id="law_enforcement"
                    value={formData.law_enforcement_affiliated}
                    onChange={(e) => handleInputChange('law_enforcement_affiliated', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-300 mb-2">
                    Date Of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="date_of_birth"
                      type="text"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="dd/mm/yyyy"
                      required
                    />
                  </div>
                </div>

                {/* Deposit Amount */}
                <div>
                  <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Deposit Amount
                  </label>
                  <input
                    id="deposit_amount"
                    type="number"
                    step="0.01"
                    value={formData.deposit_amount}
                    onChange={(e) => handleInputChange('deposit_amount', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter Deposit Amount"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter Initial Meet Up Duration in minutes"
                    required
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-gray-300 mb-2">
                    Service Type
                  </label>
                  <select
                    id="service_type"
                    value={formData.service_type}
                    onChange={(e) => handleInputChange('service_type', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="massage">Massage</option>
                    <option value="therapy">Therapy</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Personal Items */}
                <div>
                  <label htmlFor="personal_items" className="block text-sm font-medium text-gray-300 mb-2">
                    Personal Items
                  </label>
                  <select
                    id="personal_items"
                    value={formData.personal_items}
                    onChange={(e) => handleInputChange('personal_items', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="none">None</option>
                    <option value="some">Some</option>
                    <option value="many">Many</option>
                  </select>
                </div>

                {/* Profile Picture */}
                <div>
                  <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white cursor-pointer hover:bg-gray-700 transition">
                    <Upload className="w-5 h-5 mr-2" />
                    <span>{formData.profile_picture ? formData.profile_picture.name : 'Choose from Gallery'}</span>
                    <input
                      id="profile_picture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Verify Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label htmlFor="verifyPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Verify Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="verifyPassword"
                    type={showVerifyPassword ? 'text' : 'password'}
                    value={formData.verifyPassword}
                    onChange={(e) => handleInputChange('verifyPassword', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showVerifyPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember me / Forgot Password (Sign In only) */}
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm border border-red-500/50">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
