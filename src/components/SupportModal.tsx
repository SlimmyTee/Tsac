import { X, Mail, Phone, ExternalLink } from 'lucide-react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'deposit' | 'withdraw';
}

export function SupportModal({ isOpen, onClose, type }: SupportModalProps) {
    if (!isOpen) return null;

    const contactEmail = 'therapeuticserviceaccesscard@gmail.com';
    const contactPhone = '+1 (213) 795-4051';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`px-6 md:px-8 py-5 md:py-6 border-b border-slate-100 ${type === 'deposit' ? 'bg-emerald-50/50' : 'bg-blue-50/50'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize">
                            {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:shadow-sm transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    <div className="space-y-4">
                        <p className="text-slate-600 leading-relaxed">
                            To {type === 'deposit' ? 'deposit funds into' : 'withdraw funds from'} your account, please contact our support team directly. We will provide you with the necessary instructions and process your request securely.
                        </p>

                        <div className="space-y-3 pt-2">
                            <a
                                href={`mailto:${contactEmail}`}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                    <Mail className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email Support</p>
                                    <p className="text-sm md:text-base text-slate-800 font-medium truncate">{contactEmail}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </a>

                            <a
                                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                            >
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                    <Phone className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Phone Support</p>
                                    <p className="text-sm md:text-base text-slate-800 font-medium">{contactPhone}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]
                            ${type === 'deposit' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:shadow-emerald-500/25' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/25'}
                        `}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
