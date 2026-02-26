import { UserLayout } from './UserLayout';
import { Mail, Phone, FileQuestion, ChevronRight, HelpCircle } from 'lucide-react';

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
      <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1 md:px-0">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">How can we help you?</h1>
            <p className="text-emerald-100 text-sm md:text-base max-w-xl">
              Find answers to common questions or get in touch with our support team. We're here to assist you on your journey.
            </p>
          </div>
          <HelpCircle className="absolute right-4 md:right-8 bottom-[-10px] md:bottom-[-20px] w-24 h-24 md:w-40 md:h-40 text-emerald-500/30 rotate-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-base md:text-lg font-semibold text-slate-800 px-1">Contact Support</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 lg:space-y-4">
            

              <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition group cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:bg-blue-600 transition-colors">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base mb-1">Email</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-2 md:mb-3"><a href='mailto:therapeuticserviceaccesscard@gmail.com'>therapeuticserviceaccesscard@gmail.com</a></p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition group cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:bg-purple-600 transition-colors">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base mb-1">Phone</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-2 md:mb-3">Mon-Fri, 9am - 5pm.</p>
                <span className="text-purple-600 text-xs md:text-sm font-medium flex items-center"><a href='tel:+13034351703'>+1 (303) 435-1703</a> <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" /></span>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-2">
            <h2 className="text-base md:text-lg font-semibold text-slate-800 px-1 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3 md:space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 md:p-6 rounded-2xl shadow-sm transition hover:bg-white/90">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <FileQuestion className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm md:text-base mb-1.5 md:mb-2">{faq.question}</h3>
                      <p className="text-slate-600 leading-relaxed text-xs md:text-sm">
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
