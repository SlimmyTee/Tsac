import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTransactions, type Transaction } from '../lib/mockData';
import { UserLayout } from './UserLayout';
import { Bell, ArrowDown, ArrowUp, MoreHorizontal, AlertCircle } from 'lucide-react';

export function UserDashboard() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [refundableBalance, setRefundableBalance] = useState(0);
  const [pendingCharge, setPendingCharge] = useState(0);
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
      calculateBalances(sorted);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (txns: Transaction[]) => {
    const total = txns.reduce((sum, txn) => sum + Number(txn.amount), 0);
    setBalance(total);
    
    // Calculate refundable balance (positive amounts)
    const refundable = txns
      .filter(t => Number(t.amount) > 0)
      .reduce((sum, txn) => sum + Number(txn.amount), 0);
    setRefundableBalance(refundable);
    
    // Calculate pending charges (negative amounts that are pending)
    const pending = txns
      .filter(t => Number(t.amount) < 0 && t.type === 'debit')
      .reduce((sum, txn) => sum + Math.abs(Number(txn.amount)), 0);
    setPendingCharge(pending);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCardNumber = (cardNumber: string | null) => {
    if (!cardNumber) return '5296 8857 8444 5778';
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  if (loading) {
    return (
      <UserLayout currentPage="home">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout currentPage="home">
      <div className="space-y-6">
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Escrow Balance Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Escrow Balance</h3>
              <div className="flex items-center space-x-2 bg-yellow-400/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-medium">Pending</span>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-5xl font-bold mb-2">{formatCurrency(balance)}</p>
            </div>
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/80 mb-1">TCC Number</p>
              <p className="text-xl font-mono tracking-wider">{formatCardNumber(profile?.card_number || null)}</p>
            </div>
          </div>

          {/* Balances Card */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Balances</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Refundable Balance</p>
                <p className="text-2xl font-bold text-green-400">+{formatCurrency(refundableBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending Charge</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(pendingCharge)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-orange-500/20 hover:bg-orange-500/30 p-6 rounded-xl flex flex-col items-center justify-center space-y-2 transition">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-medium text-sm">Notification</span>
            </button>
            <button className="bg-red-500/20 hover:bg-red-500/30 p-6 rounded-xl flex flex-col items-center justify-center space-y-2 transition">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-medium text-sm">Pay</span>
            </button>
            <button className="bg-green-500/20 hover:bg-green-500/30 p-6 rounded-xl flex flex-col items-center justify-center space-y-2 transition">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <ArrowUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-medium text-sm">Withdrawal</span>
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 p-6 rounded-xl flex flex-col items-center justify-center space-y-2 transition">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <MoreHorizontal className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-medium text-sm">More</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Transactions</h3>
          </div>
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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  <>
                    {transactions.map((transaction) => (
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
                        {formatCurrency(
                          transactions
                            .filter(t => Number(t.amount) < 0)
                            .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
                        )}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {formatCurrency(
                          transactions
                            .filter(t => Number(t.amount) > 0)
                            .reduce((sum, t) => sum + Number(t.amount), 0)
                        )}
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
