/**
 * CookieConsent.jsx — GDPR/DPA Cookie Consent Banner
 *
 * Displays a cookie consent banner on first visit (1.5s delay for UX).
 * Compliant with the Botswana Data Protection Act, 2018:
 *   - Three options: Accept All, Essential Only, Decline
 *   - Links to the Privacy Notice page
 *   - Consent choice stored in localStorage (persists across sessions)
 *   - Bilingual (English / Setswana)
 *   - Confirmation toast shown briefly after selection
 */
import { useState, useEffect } from 'react';
import { Shield, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../lib/language';

export default function CookieConsent() {
  const { lang } = useLanguage();
  const [show, setShow] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');

  useEffect(() => {
    const consent = localStorage.getItem('bocra-cookie-consent');
    if (!consent) { const t = setTimeout(() => setShow(true), 1500); return () => clearTimeout(t); }
  }, []);

  const T = {
    title: lang === 'tn' ? 'Re tlotla sephiri sa gago' : 'We value your privacy',
    desc: lang === 'tn' ? 'BOCRA e dirisa dikhukhi go tokafatsa maitemogelo a gago a go batla, go gopola dikgetho tsa gago, le go sekaseka tiriso ya webosaete go ya ka' : 'BOCRA uses cookies to enhance your browsing experience, remember your preferences, and analyse site usage in accordance with the',
    act: lang === 'tn' ? 'Molao wa Tshireletso ya Data, 2018' : 'Data Protection Act, 2018',
    decline: lang === 'tn' ? 'Gana' : 'Decline',
    essential: lang === 'tn' ? 'Tse di Botlhokwa Fela' : 'Essential Only',
    acceptAll: lang === 'tn' ? 'Amogela Tsotlhe' : 'Accept All',
    confirmAll: lang === 'tn' ? 'Ke a leboga! Dikhukhi tsotlhe di amogetse.' : 'Thank you! All cookies have been accepted.',
    confirmEss: lang === 'tn' ? 'Dikgetho di bolokilwe. Ke dikhukhi tse di botlhokwa fela tse di dirang.' : 'Preferences saved. Only essential cookies are active.',
    confirmDec: lang === 'tn' ? 'Dikhukhi di ganetswe. Ditirelo dingwe di ka nna tsa fokotsegiwa.' : 'Cookies declined. Some features may be limited.',
  };

  const accept = (choice) => {
    localStorage.setItem('bocra-cookie-consent', choice);
    localStorage.setItem('bocra-cookie-date', new Date().toISOString());
    setShow(false);
    setConfirmMsg(choice === 'all' ? T.confirmAll : choice === 'essential' ? T.confirmEss : T.confirmDec);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  if (confirmed) return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] animate-fade-in">
      <div className="bg-[#001A3A] rounded-xl shadow-xl px-5 py-3 flex items-center gap-2.5">
        <CheckCircle size={16} className="text-[#6BBE4E]" />
        <p className="text-xs text-white/80">{confirmMsg}</p>
      </div>
    </div>
  );
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-4 sm:p-0">
      <div className="max-w-4xl mx-auto sm:mb-4">
        <div className="bg-[#001A3A] rounded-2xl shadow-2xl border border-white/10 p-5 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield size={16} className="text-[#00A6CE]" />
                <h3 className="text-sm font-bold text-white">{T.title}</h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                {T.desc}{' '}
                <Link to="/privacy-notice" className="text-[#00A6CE] hover:underline">{T.act}</Link>.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => accept('declined')} className="px-4 py-2.5 text-xs font-medium text-white/40 hover:text-white/70 transition-all">{T.decline}</button>
              <button onClick={() => accept('essential')} className="px-4 py-2.5 text-xs font-medium text-white/60 border border-white/20 rounded-xl hover:bg-white/5 transition-all">{T.essential}</button>
              <button onClick={() => accept('all')} className="px-5 py-2.5 text-xs font-bold text-white bg-[#00A6CE] rounded-xl hover:bg-[#0090B5] transition-all">{T.acceptAll}</button>
            </div>
          </div>
          <button onClick={() => accept('essential')} className="absolute top-3 right-3 text-white/20 hover:text-white/50 p-1 sm:hidden"><X size={16} /></button>
        </div>
      </div>
    </div>
  );
}
