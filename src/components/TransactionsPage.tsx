import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserTransactions } from '../lib/db';
import { Transaction } from '../types';
import { UserLayout } from './UserLayout';
import { AlertCircle, Filter } from 'lucide-react';

export function TransactionsPage() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchTransactions();
    }
  }, [profile?.id]);

  const fetchTransactions = async () => {
    if (!profile?.id) return;

    try {
      const data = await fetchUserTransactions(profile.id);
      // Data is already sorted by desc created_at from db
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    const matchesType = typeFilter === 'all' ? true : t.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const totalNonRefundable = filteredTransactions
    .filter(t => Number(t.amount) < 0) // Debits
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const totalRefundable = filteredTransactions
    .filter(t => Number(t.amount) > 0) // Credits
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <UserLayout currentPage="transactions">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout currentPage="transactions">
      <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1 md:px-0">

        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Transactions</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Track your financial activity</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-[11px] md:text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none hover:text-emerald-600 transition w-full"
              >
                <option value="all">Status: All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent border-none text-[11px] md:text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none hover:text-emerald-600 transition w-full"
              >
                <option value="all">Type: All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table Layout */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Details</th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Non-Refundable Fee</th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Refundable Amount</th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <AlertCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">No transactions found</p>
                        <p className="text-sm text-slate-400">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredTransactions.map((transaction) => {
                      const isDebit = Number(transaction.amount) < 0;
                      const isCredit = Number(transaction.amount) >= 0;
                      return (
                        <tr key={transaction.id} className="hover:bg-white/80 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="text-slate-800 font-medium">{transaction.description}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{new Date(transaction.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-slate-500 font-medium">
                              {isDebit ? formatCurrency(Math.abs(Number(transaction.amount))) : '-'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={isCredit ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                              {isCredit ? formatCurrency(Number(transaction.amount)) : '-'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                                        ${transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-600'}
                                    `}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}

                    {/* Summary Footer */}
                    <tr className="bg-slate-50/50 border-t border-slate-200">
                      <td className="px-8 py-6 text-slate-800 font-bold text-right">Totals</td>
                      <td className="px-8 py-6 text-slate-800 font-bold">
                        {formatCurrency(totalNonRefundable)}
                      </td>
                      <td className="px-8 py-6 text-emerald-600 font-bold">
                        +{formatCurrency(totalRefundable)}
                      </td>
                      <td></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-base font-medium">No transactions found</p>
              </div>
            ) : (
              <>
                {filteredTransactions.map((transaction) => {
                  const isDebit = Number(transaction.amount) < 0;
                  const isCredit = Number(transaction.amount) >= 0;
                  return (
                    <div key={transaction.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{transaction.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(transaction.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize
                          ${transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'}
                        `}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fee</p>
                          <p className="text-xs font-medium text-slate-600">
                            {isDebit ? formatCurrency(Math.abs(Number(transaction.amount))) : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Refundable</p>
                          <p className={`text-xs font-bold ${isCredit ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isCredit ? formatCurrency(Number(transaction.amount)) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Summary Mobile */}
                <div className="bg-slate-50/80 p-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-600">Total Fees:</span>
                    <span className="text-xs font-bold text-slate-800">{formatCurrency(totalNonRefundable)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-600">Total Refundable:</span>
                    <span className="text-sm font-bold text-emerald-600">+{formatCurrency(totalRefundable)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
