import { UserLayout } from './UserLayout';
import { Mail, MessageCircle, Phone, FileQuestion, ChevronRight, HelpCircle } from 'lucide-react';

export function HelpPage() {
  const faqs = [
    {
      question: "How do I deposit funds?",
      answer: "Go to the dashboard and click the 'Deposit Funds' button. You can add funds using your credit card instantly."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard 256-bit encryption to protect your data. We never store full card details."
    },
    {
      question: "How long do withdrawals take?",
      answer: "Withdrawals are processed within 24 hours. You will receive a notification once the funds are sent."
    },
    {
      question: "Can I update my profile?",
      answer: "Yes, navigate to the Profile page to update your personal information and preferences."
    }
  ];

  return (
    <UserLayout currentPage="help">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
            <p className="text-emerald-100 max-w-xl">
              Find answers to common questions or get in touch with our support team. We're here to assist you on your journey.
            </p>
          </div>
          <HelpCircle className="absolute right-8 bottom-[-20px] w-40 h-40 text-emerald-500/30 rotate-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 px-1">Contact Support</h2>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition group cursor-pointer">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                <MessageCircle className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Live Chat</h3>
              <p className="text-sm text-slate-500 mb-3">Chat with our support team in real-time.</p>
              <span className="text-emerald-600 text-sm font-medium flex items-center">Start Chat <ChevronRight className="w-4 h-4 ml-1" /></span>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition group cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Mail className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Email Support</h3>
              <p className="text-sm text-slate-500 mb-3">Get a response within 24 hours.</p>
              <span className="text-blue-600 text-sm font-medium flex items-center">Send Email <ChevronRight className="w-4 h-4 ml-1" /></span>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition group cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                <Phone className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Phone Support</h3>
              <p className="text-sm text-slate-500 mb-3">Available Mon-Fri, 9am - 5pm.</p>
              <span className="text-purple-600 text-sm font-medium flex items-center">Call Us <ChevronRight className="w-4 h-4 ml-1" /></span>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 px-1 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm transition hover:bg-white/90">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <FileQuestion className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">{faq.question}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
