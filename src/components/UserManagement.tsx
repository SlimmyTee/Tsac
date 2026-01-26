import { useEffect, useState } from 'react';
import { fetchUserTransactions, createAdminTransaction, updateTransactionStatus, updateProfile } from '../lib/db';
import { Transaction, Profile } from '../types';
import { ArrowLeft, Plus, CreditCard, Wallet, Calendar, Clock, Edit2, Check, X, Eye, EyeOff } from 'lucide-react';

export function UserManagement({ user, onBack }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'credit' as 'credit' | 'debit',
    description: '',
  });

  // Card Editing State
  const [currentUser, setCurrentUser] = useState<Profile>(user);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState(user.card_number || '');
  const [isSavingCard, setIsSavingCard] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [user.id]);

  const fetchTransactions = async () => {
    try {
      const data = await fetchUserTransactions(user.id);
      setTransactions(data);
      calculateBalance(data);
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

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const amount = Number(formData.amount);
      await createAdminTransaction(
        user.id,
        amount,
        formData.type,
        formData.description || 'Manual Adjustment'
      );

      setShowAddModal(false);
      setFormData({ amount: '', type: 'credit', description: '' });
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error creating transaction');
    }
  };

  const handleUpdateStatus = async (transactionId: string, status: 'completed' | 'pending' | 'failed') => {
    if (!confirm(`Are you sure you want to update this transaction status to ${status}?`)) return;
    try {
      await updateTransactionStatus(transactionId, status);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction status:', error);
      alert('Error updating transaction status');
    }
  };

  const handleUpdateCardNumber = async () => {
    setIsSavingCard(true);
    try {
      const updatedUser = await updateProfile(user.id, { card_number: newCardNumber });
      setCurrentUser(updatedUser);
      setIsEditingCard(false);
    } catch (error) {
      console.error('Error updating card number:', error);
      alert('Error updating card number');
    } finally {
      setIsSavingCard(false);
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCardNumber = (cardNumber: string | null) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f1] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f1] relative font-sans p-6 md:p-10">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-emerald-700 transition mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to User List</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm h-full flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{currentUser.full_name}</h1>
                  <p className="text-slate-500 text-sm md:text-lg">{currentUser.email}</p>
                </div>
                <div className="px-3 py-1 bg-slate-200 rounded-full text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider">
                  User Profile
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-emerald-800 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-1">Current Balance</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-700">{formatCurrency(balance)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 group relative">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider">TCC Card Number</p>
                    {!isEditingCard && (
                      <button
                        onClick={() => setIsEditingCard(true)}
                        className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-emerald-600"
                        title="Edit Card Number"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const newVisible = !currentUser.card_number_visible;
                        try {
                          const updated = await updateProfile(user.id, { card_number_visible: newVisible });
                          setCurrentUser(updated);
                        } catch (error: any) {
                          console.error('Error toggling card visibility:', error);
                          const errorMessage = error.message || 'Unknown error';
                          alert(`Error updating visibility: ${errorMessage}\n\nPlease ensure you have run the required SQL migration to add the "card_number_visible" column.`);
                        }
                      }}
                      className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-emerald-600"
                      title={currentUser.card_number_visible ? "Hide on User Dashboard" : "Show on User Dashboard"}
                    >
                      {currentUser.card_number_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isEditingCard ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(e.target.value)}
                        className="flex-1 bg-white border border-emerald-200 rounded px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                        placeholder="Enter card number..."
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateCardNumber}
                        disabled={isSavingCard}
                        className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingCard(false);
                          setNewCardNumber(currentUser.card_number || '');
                        }}
                        className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-lg md:text-xl font-mono text-slate-700 tracking-tight">
                      {formatCardNumber(currentUser.card_number || null)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col justify-center">
            <h3 className="text-base md:text-lg font-medium text-slate-300 mb-4 md:mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5" /> Summary
            </h3>
            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-slate-400 text-sm md:text-base">Total Credits</span>
                <span className="text-emerald-400 font-bold text-lg md:text-xl">
                  {formatCurrency(
                    transactions
                      .filter((t: Transaction) => Number(t.amount) > 0)
                      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-400 text-sm md:text-base">Total Debits</span>
                <span className="text-rose-400 font-bold text-lg md:text-xl">
                  {formatCurrency(
                    Math.abs(transactions
                      .filter((t: Transaction) => Number(t.amount) < 0)
                      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0))
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Transaction History</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold text-sm">Add Transaction</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <div className="p-12 md:p-16 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                </div>
                <h4 className="text-base md:text-lg font-medium text-slate-800">No transactions recorded</h4>
                <p className="text-sm text-slate-500">This user has no history yet.</p>
              </div>
            ) : (
              transactions.map((transaction: Transaction) => {
                const isCredit = Number(transaction.amount) >= 0;
                return (
                  <div key={transaction.id} className="p-4 md:p-6 hover:bg-white/80 transition flex items-center justify-between group gap-4">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className={`p-2.5 md:p-3 rounded-xl ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {isCredit ? <Plus className="w-4 h-4 md:w-5 md:h-5" /> : <CreditCard className="w-4 h-4 md:w-5 md:h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 mb-0.5 text-sm md:text-base truncate">{transaction.description}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.created_at)}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px] md:text-[10px] ${isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {transaction.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className={`text-base md:text-lg font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isCredit ? '+' : ''}{formatCurrency(Number(transaction.amount))}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wide">
                          {transaction.status}
                        </p>
                      </div>

                      {transaction.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(transaction.id, 'pending')}
                          className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition shadow-sm"
                          title="Set to Pending"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

      {(showAddModal) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              Details Adjustment
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-5">

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${formData.type === 'credit' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'}`}>
                    <input
                      type="radio"
                      name="type"
                      value="credit"
                      checked={formData.type === 'credit'}
                      onChange={() => setFormData({ ...formData, type: 'credit' })}
                      className="hidden"
                    />
                    <span className="font-bold block">Credit (+)</span>
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${formData.type === 'debit' ? 'bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-500' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200'}`}>
                    <input
                      type="radio"
                      name="type"
                      value="debit"
                      checked={formData.type === 'debit'}
                      onChange={() => setFormData({ ...formData, type: 'debit' })}
                      className="hidden"
                    />
                    <span className="font-bold block">Debit (-)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                    rows={3}
                    placeholder="Reason for adjustment..."
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-8 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ amount: '', type: 'credit', description: '' });
                  }}
                  className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-emerald-600 transition shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
