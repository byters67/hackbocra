/**
 * Email Verified — Confirmation Page
 * Supabase redirects here after user clicks email verification link.
 */
import { CheckCircle } from 'lucide-react';
import BocraLogo from '../../components/ui/BocraLogo';
import { useLanguage } from '../../lib/language';

export default function EmailVerifiedPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00458B] to-[#003366] p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A6CE]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6BBE4E]/10 rounded-full blur-3xl" />
      </div>
      <div className="relative bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
        <BocraLogo height={32} className="mx-auto mb-6" />
        <div className="w-16 h-16 bg-[#6BBE4E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={36} className="text-[#6BBE4E]" />
        </div>
        <h1 className="text-xl font-bold text-[#1A2B4A]">{tn ? 'Imeile e Netefaditswe!' : 'Email Verified!'}</h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {tn ? 'Imeile ya gago e netefaditswe ka katlego. Akhaonto ya gago ya BOCRA e a bereka jaanong.' : 'Your email has been successfully verified. Your BOCRA account is now active.'}
        </p>
        <p className="text-xs text-gray-400 mt-4">{tn ? 'O ka tswala tsebe e mme o tsene mo akhaontong ya gago.' : 'You can close this page and sign in to your account.'}</p>
      </div>
    </div>
  );
}
