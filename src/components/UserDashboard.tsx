import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, Wallet, LogOut, Search } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export function UserDashboard() {
  const { profile, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (profile?.id) {
      fetchTransactions();
    }
  }, [profile?.id]);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, typeFilter, transactions]);

  const fetchTransactions = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      calculateBalance(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (txns: Transaction[]) => {
    const total = txns.reduce((sum, txn) => sum + Number(txn.amount), 0);
    setBalance(total);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter((txn) =>
        txn.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((txn) => txn.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const formatCardNumber = (cardNumber: string | null) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-slate-900" />
              <h1 className="text-xl font-bold text-slate-900">Wallet</h1>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome, {profile?.full_name}</h2>
          <p className="text-slate-600">{profile?.email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-300 text-sm mb-1">Total Balance</p>
                <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
              </div>
              <Wallet className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-xs">CARD NUMBER</p>
              <p className="text-xl tracking-wider font-mono">{formatCardNumber(profile?.card_number || null)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Transactions</span>
                <span className="font-semibold text-slate-900">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Credits</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    transactions
                      .filter((t) => Number(t.amount) > 0)
                      .reduce((sum, t) => sum + Number(t.amount), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Debits</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(
                    Math.abs(
                      transactions
                        .filter((t) => Number(t.amount) < 0)
                        .reduce((sum, t) => sum + Number(t.amount), 0)
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Transactions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
                <option value="adjustment">Adjustments</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No transactions found</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 mb-1">{transaction.description}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>{formatDate(transaction.created_at)}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium capitalize">
                          {transaction.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`text-lg font-semibold ${
                          Number(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {Number(transaction.amount) >= 0 ? '+' : ''}
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
