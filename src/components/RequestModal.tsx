import { useState } from 'react';
import { X, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { processPayment } from '../lib/db';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, details: string) => void;
    type: 'pay' | 'withdraw';
}

export function RequestModal({ isOpen, onClose, onSubmit, type }: RequestModalProps) {
    const { profile } = useAuth();
    const [amount, setAmount] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Mock Card State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === 'pay') {
                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Process directly
                if (profile?.id) {
                    await processPayment(profile.id, Number(amount), details || 'Deposit via Card');
                }

                setIsSuccess(true);
                // Don't close immediately, show success state first
            } else {
                // Withdrawals still go to regular submit (create request)
                onSubmit(Number(amount), details);
                onClose();
            }
        } catch (error) {
            console.error(error);
            alert('Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsSuccess(false);
        setAmount('');
        setDetails('');
        setCardNumber('');
        setExpiry('');
        setCvv('');
        onClose();
    }

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={handleClose}></div>
                <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center transform transition-all animate-in zoom-in-95 duration-200">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
                    <p className="text-slate-500 mb-8">Your deposit of <span className="font-semibold text-emerald-600">${amount}</span> has been processed securely.</p>
                    <button
                        onClick={handleClose}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-emerald-500/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className={`px-8 py-6 border-b border-slate-100 ${type === 'pay' ? 'bg-emerald-50/50' : 'bg-blue-50/50'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 capitalize">
                            {type === 'pay' ? 'Deposit Funds' : 'Withdraw Funds'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:shadow-sm transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-semibold">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="block w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-lg font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {type === 'pay' && (
                            <div className="space-y-4 pt-2">
                                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CreditCard className="w-5 h-5 text-emerald-600" />
                                        <span className="text-sm font-semibold text-slate-700">Payment Details</span>
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Card Number"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value)}
                                                className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="CVV"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value)}
                                                className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description / Note</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all resize-none h-24"
                                placeholder={type === 'pay' ? "E.g. Monthly Deposit" : "E.g. Withdrawal for Services"}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-semibold text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed
              ${type === 'pay' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:shadow-emerald-500/25' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/25'}
            `}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>{type === 'pay' ? 'Confirm Payment' : 'Request Withdrawal'}</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
