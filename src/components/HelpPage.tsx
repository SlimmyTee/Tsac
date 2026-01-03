import { UserLayout } from './UserLayout';
import { Bell, MessageCircle, Mail, Phone } from 'lucide-react';

export function HelpPage() {
  return (
    <UserLayout currentPage="help">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Help and Support</h1>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Live Chat</h3>
                <p className="text-gray-400">Get instant help from our support team</p>
                <button className="mt-3 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition">
                  Start Chat
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
                <p className="text-gray-400">Send us an email and we'll get back to you</p>
                <a href="mailto:support@example.com" className="mt-3 inline-block px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                  Send Email
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Phone Support</h3>
                <p className="text-gray-400">Call us for immediate assistance</p>
                <a href="tel:+1234567890" className="mt-3 inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

