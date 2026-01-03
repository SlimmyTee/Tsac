import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTransactions, type Transaction } from '../lib/mockData';
import { UserLayout } from './UserLayout';
import { AlertCircle } from 'lucide-react';

export function TransactionsPage() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchTransactions();
    }
  }, [profile?.id]);

  const fetchTransactions = async () => {
    if (!profile?.id) return;

    try {
      const data = getTransactions(profile.id);
      const sorted = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTransactions(sorted);
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

  const filteredTransactions = statusFilter === 'all' 
    ? transactions 
    : transactions.filter(t => {
        // You can add status logic here based on your needs
        return true;
      });

  const totalNonRefundable = filteredTransactions
    .filter(t => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const totalRefundable = filteredTransactions
    .filter(t => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <UserLayout currentPage="transactions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout currentPage="transactions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <div className="flex items-center space-x-3">
            <label className="text-gray-300">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-pink-500 to-purple-500">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">TRANSACTION</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">TOTAL FEE COST (NON REFUNDABLE)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">REFUNDABLE FEE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">STATUS</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                        <td className="px-6 py-4 text-white">{transaction.description}</td>
                        <td className="px-6 py-4 text-white">
                          {Number(transaction.amount) < 0 ? formatCurrency(Math.abs(Number(transaction.amount))) : '-'}
                        </td>
                        <td className="px-6 py-4 text-green-400">
                          {Number(transaction.amount) > 0 ? formatCurrency(Number(transaction.amount)) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-gradient-to-r from-pink-500 to-purple-500">
                      <td className="px-6 py-4 text-white font-semibold">Total</td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {formatCurrency(totalNonRefundable)}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {formatCurrency(totalRefundable)}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

