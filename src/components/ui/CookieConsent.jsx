/**
 * Cookie Consent Banner
 * Shows once, remembers choice in localStorage.
 * Accept All / Essential Only / Decline options.
 * Brief thank you confirmation after accepting.
 */
import { useState, useEffect } from 'react';
import { Shield, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');

  useEffect(() => {
    const consent = localStorage.getItem('bocra-cookie-consent');
    if (!consent) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (choice) => {
    localStorage.setItem('bocra-cookie-consent', choice);
    localStorage.setItem('bocra-cookie-date', new Date().toISOString());
    setShow(false);

    if (choice === 'all') {
      setConfirmMsg('Thank you! All cookies have been accepted.');
    } else if (choice === 'essential') {
      setConfirmMsg('Preferences saved. Only essential cookies are active.');
    } else if (choice === 'declined') {
      setConfirmMsg('Cookies declined. Some features may be limited.');
    }
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  // Confirmation toast
  if (confirmed) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] animate-fade-in">
        <div className="bg-[#001A3A] rounded-xl shadow-xl px-5 py-3 flex items-center gap-2.5">
          <CheckCircle size={16} className="text-[#6BBE4E]" />
          <p className="text-xs text-white/80">{confirmMsg}</p>
        </div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-4 sm:p-0">
      <div className="max-w-4xl mx-auto sm:mb-4">
        <div className="bg-[#001A3A] rounded-2xl shadow-2xl border border-white/10 p-5 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield size={16} className="text-[#00A6CE]" />
                <h3 className="text-sm font-bold text-white">We value your privacy</h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                BOCRA uses cookies to enhance your browsing experience, remember your preferences, and analyse site usage in accordance with the{' '}
                <Link to="/privacy-notice" className="text-[#00A6CE] hover:underline">Data Protection Act, 2018</Link>.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => accept('declined')}
                className="px-4 py-2.5 text-xs font-medium text-white/40 hover:text-white/70 transition-all">
                Decline
              </button>
              <button onClick={() => accept('essential')}
                className="px-4 py-2.5 text-xs font-medium text-white/60 border border-white/20 rounded-xl hover:bg-white/5 transition-all">
                Essential Only
              </button>
              <button onClick={() => accept('all')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#00A6CE] rounded-xl hover:bg-[#0090B5] transition-all">
                Accept All
              </button>
            </div>
          </div>
          <button onClick={() => accept('essential')} className="absolute top-3 right-3 text-white/20 hover:text-white/50 p-1 sm:hidden">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
