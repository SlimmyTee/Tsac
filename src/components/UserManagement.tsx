import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  type Profile,
  type Transaction,
} from '../lib/mockData';
import { ArrowLeft, Plus, Edit2, Trash2, CreditCard, Wallet } from 'lucide-react';

interface UserManagementProps {
  user: Profile;
  onBack: () => void;
}

export function UserManagement({ user, onBack }: UserManagementProps) {
  const { profile: adminProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'credit' as 'credit' | 'debit' | 'adjustment',
    description: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, [user.id]);

  const fetchTransactions = async () => {
    try {
      const data = getTransactions(user.id);
      // Sort by created_at descending
      const sorted = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTransactions(sorted);
      calculateBalance(sorted);
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
      const adjustedAmount = formData.type === 'debit' ? -Math.abs(amount) : Math.abs(amount);

      addTransaction({
        user_id: user.id,
        amount: adjustedAmount,
        type: formData.type,
        description: formData.description,
        admin_id: adminProfile?.id || null,
        metadata: {},
      });

      setShowAddModal(false);
      setFormData({ amount: '', type: 'credit', description: '' });
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    try {
      const amount = Number(formData.amount);
      const adjustedAmount = formData.type === 'debit' ? -Math.abs(amount) : Math.abs(amount);

      updateTransaction(selectedTransaction.id, {
        amount: adjustedAmount,
        type: formData.type,
        description: formData.description,
      });

      setShowEditModal(false);
      setSelectedTransaction(null);
      setFormData({ amount: '', type: 'credit', description: '' });
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      deleteTransaction(transactionId);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      amount: Math.abs(Number(transaction.amount)).toString(),
      type: transaction.type,
      description: transaction.description,
    });
    setShowEditModal(true);
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

  const formatCardNumber = (cardNumber: string | null) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
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
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Users</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.full_name}</h2>
          <p className="text-slate-600">{user.email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-300 text-sm mb-1">Current Balance</p>
                <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
              </div>
              <Wallet className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-xs">CARD NUMBER</p>
              <p className="text-xl tracking-wider font-mono">{formatCardNumber(user.card_number)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Transaction Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Transactions</span>
                <span className="font-semibold text-slate-900">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Credits</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    transactions
                      .filter((t) => Number(t.amount) > 0)
                      .reduce((sum, t) => sum + Number(t.amount), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Debits</span>
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
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Transaction History</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction) => (
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
                    <div className="flex items-center space-x-4">
                      <p
                        className={`text-lg font-semibold ${
                          Number(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {Number(transaction.amount) >= 0 ? '+' : ''}
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="p-2 text-slate-600 hover:text-slate-900 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-2 text-red-600 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {showAddModal ? 'Add Transaction' : 'Edit Transaction'}
            </h3>
            <form onSubmit={showAddModal ? handleAddTransaction : handleUpdateTransaction}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'credit' | 'debit' | 'adjustment' })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    rows={3}
                    placeholder="Enter description..."
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedTransaction(null);
                    setFormData({ amount: '', type: 'credit', description: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                >
                  {showAddModal ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
