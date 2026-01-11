import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserTransactions, createRequest } from '../lib/db';
import { Transaction } from '../types';
import { UserLayout } from './UserLayout';
import { Bell, ArrowDown, ArrowUp, MoreHorizontal, AlertCircle, Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { RequestModal } from './RequestModal';

export function UserDashboard() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [refundableBalance, setRefundableBalance] = useState(0);
  const [pendingCharge, setPendingCharge] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchTransactions();
    }
  }, [profile?.id]);

  const fetchTransactions = async () => {
    if (!profile?.id) return;

    try {
      const data = await fetchUserTransactions(profile.id);
      setTransactions(data); // db returns sorted
      calculateBalances(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (txns: Transaction[]) => {
    const total = txns.reduce((sum, txn) => sum + Number(txn.amount), 0);
    setBalance(total);

    const refundable = txns
      .filter(t => t.type === 'credit')
      .reduce((sum, txn) => sum + Number(txn.amount), 0);
    setRefundableBalance(refundable);

    const pending = txns
      .filter(t => t.type === 'debit')
      .reduce((sum, txn) => sum + Math.abs(Number(txn.amount)), 0);
    setPendingCharge(pending);
  };

  const handleRequest = async (type: 'pay' | 'withdraw', amount: number, details: string) => {
    if (!profile?.id) return;

    await createRequest({
      user_id: profile.id,
      type,
      amount,
      details
    });

    alert('Request submitted successfully!');
    // Ideally refetch or update state
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
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout currentPage="home">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Escrow Balance Card - Premium Gradient */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl transition-transform hover:scale-[1.01] duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 blur-3xl rounded-full z-0"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-emerald-50">Escrow Balance</h3>
                    <p className="text-emerald-100 text-xs">Total Available Assets</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-900/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-100">Live Sync</span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-4xl lg:text-6xl font-light tracking-tight text-white drop-shadow-sm">
                  {formatCurrency(balance)}
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-emerald-200/80 text-sm font-medium mb-1 tracking-wider uppercase">TCC Card Number</p>
                  <p className="text-xl lg:text-2xl font-mono text-white tracking-widest opacity-90">{formatCardNumber(profile?.card_number || null)}</p>
                </div>
                <div className="opacity-80">
                  {/* Card Brand Logo Placeholder */}
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/80"></div>
                    <div className="w-8 h-8 rounded-full bg-orange-500/80"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Breakdown Card - Glass Glassmorphism */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-sm flex flex-col justify-center gap-6">
            <h3 className="text-slate-800 font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span>Overview</span>
            </h3>

            <div className="space-y-6">
              <div className="group p-4 bg-white/50 rounded-2xl hover:bg-white/80 transition-colors border border-transparent hover:border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500 font-medium group-hover:text-emerald-600 transition-colors">Refundable Balance</p>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">+{formatCurrency(refundableBalance)}</p>
              </div>

              <div className="group p-4 bg-white/50 rounded-2xl hover:bg-white/80 transition-colors border border-transparent hover:border-rose-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500 font-medium group-hover:text-rose-600 transition-colors">Total Debited</p>
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl font-bold text-slate-800 group-hover:text-rose-700 transition-colors">{formatCurrency(pendingCharge)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Clean Cards */}
        <div>
          <h3 className="text-xl font-light text-slate-800 mb-4 px-2">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Bell, label: 'Notifications', color: 'orange', onClick: () => { } },
              { icon: ArrowDown, label: 'Deposit Funds', color: 'emerald', onClick: () => setShowPayModal(true) },
              { icon: ArrowUp, label: 'Withdraw', color: 'blue', onClick: () => setShowWithdrawModal(true) },
              { icon: MoreHorizontal, label: 'More Options', color: 'purple', onClick: () => { } }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="bg-white/70 backdrop-blur-md hover:bg-white border border-white/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group text-left"
              >
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors
                        ${action.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : ''}
                        ${action.color === 'orange' ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' : ''}
                        ${action.color === 'blue' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : ''}
                        ${action.color === 'purple' ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' : ''}
                    `}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-slate-700 font-medium group-hover:text-slate-900">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table - Modern Clean */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-800">Transaction History</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <AlertCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg">No transactions yet</p>
                        <p className="text-sm text-slate-400">Your recent activity will appear here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-white/80 transition-colors group">
                        <td className="px-8 py-5 text-slate-700 font-medium">{transaction.description}</td>
                        <td className="px-8 py-5">
                          <span className={`${transaction.amount >= 0 ? 'text-emerald-600' : 'text-slate-900'} font-semibold`}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize
                             ${transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'}
                          `}>
                            <span className={`w-1.5 h-1.5 rounded-full 
                                ${transaction.status === 'completed' ? 'bg-emerald-500' :
                                transaction.status === 'pending' ? 'bg-amber-500' :
                                  'bg-slate-400'}
                            `}></span>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <RequestModal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          type="pay"
          onSubmit={(amount, details) => handleRequest('pay', amount, details)}
        />
        <RequestModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          type="withdraw"
          onSubmit={(amount, details) => handleRequest('withdraw', amount, details)}
        />

      </div>
    </UserLayout>
  );
}
