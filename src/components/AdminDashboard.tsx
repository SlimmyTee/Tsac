import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPendingRequests, processRequest, fetchProfiles } from '../lib/db';
import { TransactionRequest, Profile } from '../types';
import { Users, LogOut, Search, Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { UserManagement } from './UserManagement';

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allUsers = await fetchProfiles();
      setUsers(allUsers || []);
      setFilteredUsers(allUsers || []);

      const pending = await fetchPendingRequests();
      setRequests(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await processRequest(id, status);
      fetchData();
    } catch (err) {
      alert('Error processing request');
      console.error(err);
    }
  };

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(
      (user) =>
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (selectedUser) {
    return (
      <UserManagement
        user={{ ...selectedUser, email: selectedUser.email || '' }}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f1] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f1] relative font-sans">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>
      </div>

      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg md:rounded-xl">
                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-700" />
              </div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                Admin <span className="font-light text-slate-400 hidden sm:inline">Panel</span>
              </h1>
            </div>
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-800">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Administrator</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-all font-medium text-xs md:text-sm group"
              >
                <LogOut className="w-4 h-4 group-hover:stroke-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 md:p-6 border border-white/60 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-2.5 md:p-3 bg-blue-100 rounded-xl">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 md:p-6 border border-white/60 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-2.5 md:p-3 bg-amber-100 rounded-xl">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">Pending</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{requests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 md:p-6 border border-white/60 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-2.5 md:p-3 bg-emerald-100 rounded-xl">
                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-xs md:text-sm font-bold text-emerald-600">Optimal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">

          {/* Pending Requests Column */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 px-1">Pending Approval</h2>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-sm border border-white/60 overflow-hidden">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">User ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="w-8 h-8 text-emerald-200" />
                            <p>All caught up!</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      requests.map(req => (
                        <tr key={req.id} className="hover:bg-white/80 transition group">
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">{req.user_id.slice(0, 8)}...</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                    ${req.type === 'pay' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                                                `}>
                              {req.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(req.amount)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{req.details}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleProcessRequest(req.id, 'approved')}
                                className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleProcessRequest(req.id, 'rejected')}
                                className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition shadow-sm"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <CheckCircle className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                    <p>All caught up!</p>
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 mb-1">ID: {req.user_id.slice(0, 8)}...</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${req.type === 'pay' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                                                `}>
                            {req.type}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800">{formatCurrency(req.amount)}</p>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">{req.details}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleProcessRequest(req.id, 'approved')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcessRequest(req.id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">User Management</h2>
              <div className="relative group self-stretch sm:self-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full sm:w-64 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-sm border border-white/60 overflow-hidden">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">User Profile</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">TCC Number</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Joined Date</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-white/80 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                              {user.first_name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{user.full_name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{user.card_number || 'Not Assigned'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition shadow-sm"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <div key={user.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-shrink-0 items-center justify-center text-sm font-bold text-slate-500">
                        {user.first_name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{user.full_name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        <p className="text-[10px] font-mono text-emerald-600 mt-0.5">{user.card_number || 'No Card'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg whitespace-nowrap"
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
