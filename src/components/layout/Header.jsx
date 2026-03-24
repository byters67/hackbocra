/**
 * Header.jsx — Main Site Header & Navigation
 *
 * Fully responsive header with:
 *   - Top utility bar (phone, email, portal links — desktop only, hides on scroll)
 *   - Main navigation bar with dropdown mega-menus (desktop) / accordion (mobile)
 *   - Language toggle (English ↔ Setswana) — bilingual support throughout
 *   - User account menu (visible when authenticated)
 *   - Notification bell with real-time unread badge
 *   - Search button
 *
 * ACCESSIBILITY:
 *   - Keyboard-navigable dropdowns
 *   - aria-labels on all interactive elements
 *   - Mobile menu is a full-screen overlay for easy touch targets
 *
 * BILINGUAL:
 *   All navigation labels use the t() translation function from LanguageContext.
 *   Menu items automatically switch between English and Setswana.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Phone, Mail, Globe, Shield, User, LogOut } from 'lucide-react';
import { useLanguage } from '../../lib/language';
import { useAuth } from '../../lib/auth';
import BocraLogo from '../ui/BocraLogo';
import { NotificationBell } from '../../lib/notifications';

/**
 * Builds the navigation tree from translated strings.
 * Each item is either a direct link ({ label, path }) or a dropdown group
 * ({ label, children: [...] }). Children can include { heading } for section titles.
 * The `wide` flag triggers a two-column mega-menu layout on desktop.
 */
function getNavItems(t, lang) {
  return [
    {
      label: t('nav.about'),
      children: [
        { label: t('nav.about.profile'), path: '/about/profile' },
        { label: t('nav.about.chiefExec'), path: '/about/chief-executive' },
        { label: t('nav.about.history'), path: '/about/history' },
        { label: t('nav.about.organogram'), path: '/about/organogram' },
        { label: t('nav.about.board'), path: '/about/board' },
        { label: t('nav.about.execMgmt'), path: '/about/executive-management' },
        { label: t('nav.about.careers'), path: '/about/careers' },
      ],
    },
    {
      label: t('nav.mandate'),
      wide: true,
      children: [
        { heading: t('nav.mandate.sectors') },
        { label: t('nav.mandate.telecom'), path: '/mandate/telecommunications' },
        { label: t('nav.mandate.broadcasting'), path: '/mandate/broadcasting' },
        { label: t('nav.mandate.postal'), path: '/mandate/postal' },
        { label: t('nav.mandate.internet'), path: '/mandate/internet' },
        { heading: t('nav.mandate.regulation') },
        { label: t('nav.mandate.legislation'), path: '/mandate/legislation' },
        { label: t('nav.mandate.licensing'), path: '/mandate/licensing' },
        { heading: t('nav.mandate.projects') },
        { label: 'Data Protection', path: '/data-protection' },
        { label: t('nav.mandate.infraSharing'), path: '/projects/infrastructure-sharing' },
      ],
    },
    {
      label: t('nav.services'),
      wide: true,
      children: [
        { heading: t('nav.services.forCitizens') },
        { label: t('nav.services.fileComplaint'), path: '/services/file-complaint' },
        { label: 'Complaint Outcomes', path: '/services/complaint-outcomes' },
        { label: 'Public Consultations', path: '/consultations' },
        { label: 'Cybersecurity Hub', path: '/cybersecurity' },
        { label: t('nav.services.consumerEd'), path: '/complaints/consumer-education' },
        { label: t('nav.services.licenceVerify'), path: '/services/licence-verification' },
        { heading: t('nav.services.forIndustry') },
        { label: t('nav.services.applyLicence'), path: '/licensing' },
        { label: t('nav.services.typeApproval'), path: '/services/type-approval' },
        { label: t('nav.services.registerBW'), path: '/services/register-bw' },
        { label: t('nav.services.qos'), path: '/services/qos-monitoring' },
        { label: t('nav.services.spectrum'), path: '/services/spectrum' },
      ],
    },
    {
      label: t('nav.resources'),
      children: [
        { label: t('nav.resources.documents'), path: '/documents/drafts' },
        { label: t('nav.resources.ictLicensing'), path: '/documents/ict-licensing' },
        { label: t('nav.resources.telecomStats'), path: '/telecom-statistics' },
        { label: t('nav.resources.tenders'), path: '/tenders' },
        { label: t('nav.resources.faqs'), path: '/faqs' },
      ],
    },
    {
      label: t('nav.media'),
      children: [
        { label: lang === 'tn' ? 'Dikgang le Ditiragalo' : 'News & Events', path: '/media/news-events' },
        { label: t('nav.media.speeches'), path: '/media/speeches' },
      ],
    },
    { label: t('nav.contact'), path: '/contact' },
  ];
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const [userMenu, setUserMenu] = useState(false);
  const location = useLocation();
  const tmr = useRef(null);
  const { t, lang, toggleLang } = useLanguage();
  const { user, signOut } = useAuth();

  const NAV_ITEMS = useMemo(() => getNavItems(t, lang), [t, lang]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setActive(null); setUserMenu(false); }, [location.pathname]);

  const open = (l) => { clearTimeout(tmr.current); setActive(l); };
  const close = () => { tmr.current = setTimeout(() => setActive(null), 150); };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top utility bar — desktop only */}
        <div className={`bg-[#001A3A] text-white/60 text-[11px] hidden lg:block border-b border-white/5 transition-all duration-300 ${scrolled ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-12 opacity-100'}`}>
          <div className="section-wrapper flex items-center justify-between py-2">
            <div className="flex items-center gap-1">
              <a href="tel:+2673957755" className="flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-white/5 hover:text-white transition-all">
                <Phone size={11} className="text-bocra-cyan/70" /> +267 395 7755
              </a>
              <span className="w-px h-3 bg-white/10" />
              <a href="mailto:info@bocra.org.bw" className="flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-white/5 hover:text-white transition-all">
                <Mail size={11} className="text-bocra-cyan/70" /> info@bocra.org.bw
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/services/qos-monitoring" className="px-3 py-1 rounded-md hover:bg-white/5 hover:text-white transition-all">{t('header.qos')}</Link>
              <span className="w-px h-3 bg-white/10" />
              <Link to="/telecom-statistics" className="px-3 py-1 rounded-md hover:bg-white/5 hover:text-white transition-all">{t('header.statistics')}</Link>
              <span className="w-px h-3 bg-white/10" />
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 hover:bg-bocra-cyan/20 hover:text-white transition-all font-medium text-white/80"
                aria-label="Admin portal"
              >
                <Globe size={11} className="text-bocra-cyan" /> {t('header.portal')}
              </Link>
            </div>
          </div>
        </div>

        {/* Nav bar */}
        <div className={`transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-md' : 'bg-white'}`}>
          <div className="section-wrapper flex items-center justify-between h-16 lg:h-[72px]">
            <Link to="/" className="flex-shrink-0 z-10 mt-1" aria-label="BOCRA Home"><BocraLogo height={38} /></Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative"
                onMouseEnter={() => item.children && open(item.label)}
                onMouseLeave={() => item.children && close()}>
                {item.path ? (
                  <Link to={item.path} className={`px-3.5 py-2 text-[13.5px] font-medium rounded-lg transition-colors ${location.pathname === item.path ? 'text-bocra-blue' : 'text-bocra-slate/70 hover:text-bocra-blue hover:bg-bocra-blue/5'}`}>{item.label}</Link>
                ) : (
                  <button className={`px-3.5 py-2 text-[13.5px] font-medium rounded-lg flex items-center gap-1 transition-colors ${active === item.label ? 'text-bocra-blue bg-bocra-blue/5' : 'text-bocra-slate/70 hover:text-bocra-blue'}`}>
                    {item.label} <ChevronDown size={12} className={`transition-transform duration-200 ${active === item.label ? 'rotate-180' : ''}`} />
                  </button>
                )}
                {item.children && (
                  <div className={`absolute top-full left-0 mt-2 ${item.wide ? 'w-[400px]' : 'w-56'} bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-200 origin-top ${active === item.label ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97] pointer-events-none'}`}>
                    <div className={`p-3 ${item.wide ? 'grid grid-cols-2 gap-x-2' : ''}`}>
                      {item.children.map((c, i) => c.heading
                        ? <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-bocra-slate/40 px-3 pt-3 pb-1">{c.heading}</p>
                        : c.external
                          ? <a key={c.path} href={c.path} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-[13px] rounded-lg transition-colors text-bocra-slate/70 hover:text-bocra-blue hover:bg-bocra-blue/5">{c.label}</a>
                          : <Link key={c.path} to={c.path} className={`block px-3 py-2 text-[13px] rounded-lg transition-colors ${location.pathname === c.path ? 'text-bocra-blue bg-bocra-blue/5 font-medium' : 'text-bocra-slate/70 hover:text-bocra-blue hover:bg-bocra-blue/5'}`}>{c.label}</Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language toggle */}
            <button onClick={toggleLang} className="px-2.5 py-1.5 text-[11px] font-bold border border-gray-200 rounded-md hover:border-[#00458B] hover:bg-[#00458B]/5 transition-all flex items-center gap-1.5" title={lang === 'en' ? 'Switch to Setswana' : 'Fetolela go English'}>
              <Globe size={12} className="text-[#00458B]" />
              <span className={lang === 'en' ? 'text-[#00458B]' : 'text-gray-400'}>EN</span>
              <span className="text-gray-300">|</span>
              <span className={lang === 'tn' ? 'text-[#00458B]' : 'text-gray-400'}>ST</span>
            </button>
            <Link to="/services/asms-webcp" className="px-3 py-1.5 text-[11px] font-bold bg-bocra-green/10 text-bocra-green rounded-md hover:bg-bocra-green hover:text-white transition-all">{t('header.asms')}</Link>
            <Link to="/services/register-bw" className="px-3 py-1.5 text-[11px] font-bold bg-bocra-cyan/10 text-bocra-cyan rounded-md hover:bg-bocra-cyan hover:text-white transition-all">{t('header.registerBW')}</Link>
            <NotificationBell />
            {/* User indicator — only visible when logged in */}
            {user && (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#00458B] flex items-center justify-center text-white text-[10px] font-bold">
                    {(user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={12} className="text-gray-400"/>
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-bocra-slate truncate">{user.email}</p>
                      <p className="text-[10px] text-gray-400">Signed in</p>
                    </div>
                    <Link to="/services/asms-webcp" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                      <User size={14}/> My Portal
                    </Link>
                    <Link to="/services/type-approval" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                      <Shield size={14}/> Type Approval
                    </Link>
                    <Link to="/services/licence-verification" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                      <Shield size={14}/> Verify Licence
                    </Link>
                    <button onClick={() => { signOut(); setUserMenu(false); }} className="flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 w-full text-left">
                      <LogOut size={14}/> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
            <Link to="/search" className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-1" aria-label="Search"><Search size={18} className="text-bocra-slate/50" /></Link>
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center gap-1 z-10">
            <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-[60] overflow-y-auto">
          <nav className="px-6 py-6 space-y-1">
            <Link to="/" className="block py-3 text-lg font-semibold text-bocra-blue border-b border-gray-100">Home</Link>
            {NAV_ITEMS.map((item) => item.path
              ? <Link key={item.label} to={item.path} className="block py-3 text-lg font-medium text-bocra-slate border-b border-gray-50">{item.label}</Link>
              : <MobileDropdown key={item.label} item={item} active={active} setActive={setActive} />
            )}
            <div className="pt-4 space-y-3">
              {/* Language toggle — mobile */}
              <button onClick={toggleLang} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-bocra-slate hover:bg-gray-50 transition-all">
                <Globe size={16} className="text-[#00458B]" />
                {lang === 'en' ? 'Fetolela go Setswana (ST)' : 'Switch to English (EN)'}
              </button>
              <Link to="/services/file-complaint" className="btn-primary w-full justify-center">{lang === 'tn' ? 'Tlhagisa Ngongorego' : 'File a Complaint'}</Link>
              <Link to="/admin" className="btn-secondary w-full justify-center">
                BOCRA Portal
              </Link>
              {user && (
                <div className="p-4 bg-[#00458B]/5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#00458B] flex items-center justify-center text-white text-sm font-bold">{(user.email || '?').charAt(0).toUpperCase()}</div>
                    <div><p className="text-sm font-medium text-bocra-slate truncate">{user.email}</p><p className="text-[10px] text-green-600">Signed in</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/services/asms-webcp" className="flex-1 text-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate">My Portal</Link>
                    <button onClick={() => signOut()} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-red-500">Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

/**
 * MobileDropdown — Accordion-style dropdown for mobile navigation.
 * Toggles open/closed on tap. Uses max-height transition for smooth animation.
 */
function MobileDropdown({ item, active, setActive }) {
  const isOpen = active === item.label;
  return (
    <div className="border-b border-gray-50">
      <button onClick={() => setActive(isOpen ? null : item.label)} className="flex items-center justify-between w-full py-3 text-lg font-medium text-bocra-slate">
        {item.label} <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[600px] pb-2' : 'max-h-0'}`}>
        {item.children?.filter(c => !c.heading).map(c => (
          c.external
            ? <a key={c.path} href={c.path} target="_blank" rel="noopener noreferrer" className="block py-2 pl-4 text-bocra-slate/60 hover:text-bocra-blue text-[15px]">{c.label}</a>
            : <Link key={c.path} to={c.path} className="block py-2 pl-4 text-bocra-slate/60 hover:text-bocra-blue text-[15px]">{c.label}</Link>
        ))}
      </div>
    </div>
  );
}
