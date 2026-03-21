import { ShieldCheck } from 'lucide-react';

export default function RecaptchaBadge() {
  return (
    <a
      href="https://www.google.com/recaptcha/about/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Protected by reCAPTCHA"
      className="fixed bottom-3 sm:bottom-5 right-4 sm:right-6 z-[90] flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-md hover:shadow-lg transition-shadow group"
    >
      <ShieldCheck size={16} className="text-[#4285F4] shrink-0" />
      <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-700 leading-tight">
        reCAPTCHA
      </span>
    </a>
  );
}
