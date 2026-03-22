/**
 * HomePage.jsx — BOCRA Website Landing Page
 *
 * The main entry point for citizens visiting bocra.org.bw. Showcases:
 *   - Hero section with animated headline and CTA buttons
 *   - Four regulated sectors (Telecom, Broadcasting, Postal, Internet)
 *   - Quick-access service cards (File Complaint, Verify Licence, etc.)
 *   - Live telecom statistics counter (data from Supabase)
 *   - Latest news feed pulled from the CMS (posts table)
 *   - Call-to-action section with contact details
 *
 * ANIMATIONS: Uses GSAP ScrollTrigger via custom hooks (useScrollReveal,
 * useStaggerReveal, useCountUp) for smooth scroll-triggered reveals.
 *
 * BILINGUAL: All content switches between English and Setswana using
 * the LanguageContext. Static text is defined inline with lang checks.
 */
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, Wifi, Radio, Mail, Globe, Shield, Search,
  AlertCircle, BarChart3, Signal, TrendingUp, Phone,
  Building, FileText, ChevronRight
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal, useCountUp } from '../../hooks/useAnimations';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/language';

gsap.registerPlugin(ScrollTrigger);

/* ── Images from public/images/ — use base URL for GitHub Pages ── */
const BASE = import.meta.env.BASE_URL;
const IMG_HERO = `${BASE}images/hero-network.webp`;
const IMG_TOWER = `${BASE}images/tower-blue.jpg`;
const IMG_SUNSET = `${BASE}images/tower-sunset.jpg`;
const IMG_MOBILE = `${BASE}images/mobile-world.jpeg`;

const getSectors = (lang) => [
  { icon: Wifi, title: lang === 'tn' ? 'Megala le Tlhaeletsano' : 'Telecommunications', desc: lang === 'tn' ? 'Go laola dineteweke tsa megala, inthanete, le VoIP go fitlhelela botlhe.' : 'Regulating mobile networks, internet, and VoIP for universal access.', path: '/mandate/telecommunications', img: `${BASE}images/telecommunications.jpg`, color: '#00A6CE' },
  { icon: Radio, title: lang === 'tn' ? 'Phasalatso' : 'Broadcasting', desc: lang === 'tn' ? 'Go laola ditirelo tsa radio, TV, le phasalatso ya mo inthaneteng.' : 'Overseeing radio, TV, and online broadcasting services.', path: '/mandate/broadcasting', img: `${BASE}images/broadcasting.jpeg`, color: '#C8237B' },
  { icon: Mail, title: lang === 'tn' ? 'Ditirelo tsa Poso' : 'Postal', desc: lang === 'tn' ? 'Go laola ditirelo tsa poso tsa botlhe le tsa kgwebo.' : 'Managing universal and commercial postal services.', path: '/mandate/postal', img: `${BASE}images/postal.jpg`, color: '#F7B731' },
  { icon: Globe, title: lang === 'tn' ? 'Inthanete le ICT' : 'Internet & ICT', desc: lang === 'tn' ? 'Go rotloetsa inthanete e e lebelo, tshireletso ya saebo, le mafelo a .BW.' : 'Promoting broadband, cybersecurity, and .BW domains.', path: '/mandate/internet', img: `${BASE}images/internet_ict.jpg`, color: '#6BBE4E' },
];

const getServices = (lang) => [
  { icon: AlertCircle, title: lang === 'tn' ? 'Tlhagisa Ngongorego' : 'File a Complaint', desc: lang === 'tn' ? 'Bega mathata a motlamedi wa gago wa tirelo' : 'Report issues with your service provider', path: '/services/file-complaint', color: '#C8237B' },
  { icon: Search, title: lang === 'tn' ? 'Netefatsa Laesense' : 'Verify a Licence', desc: lang === 'tn' ? 'Tlhola gore molaodi o na le laesense' : 'Check if an operator is licensed', path: '/services/licence-verification', color: '#00A6CE' },
  { icon: Shield, title: lang === 'tn' ? 'Tumelelo ya Mofuta' : 'Type Approval', desc: lang === 'tn' ? 'Batla didirisiwa tse di amogetsweng' : 'Search approved equipment', path: '/services/type-approval', color: '#F7B731' },
  { icon: Globe, title: lang === 'tn' ? 'Kwadisa .BW' : 'Register .BW', desc: lang === 'tn' ? 'Bona domeine ya gago ya Botswana' : 'Get your Botswana domain', path: '/services/register-bw', color: '#6BBE4E' },
  { icon: Signal, title: lang === 'tn' ? 'Tlhokomelo ya Boleng' : 'QoS Monitoring', desc: lang === 'tn' ? 'Tlhola boleng jwa neteweke ka nako ya jaanong' : 'Check network quality live', path: '/services/qos-monitoring', color: '#00A6CE' },
  { icon: BarChart3, title: lang === 'tn' ? 'Dipalopalo' : 'Statistics', desc: lang === 'tn' ? 'Data ya lefapha la megala' : 'Telecom sector data', path: '/telecom-statistics', color: '#C8237B' },
];

const getStats = (lang) => [
  { value: 4200000, suffix: '+', label: lang === 'tn' ? 'Disamosetšene tsa Mogala' : 'Mobile Subscriptions', icon: Phone },
  { value: 2100000, suffix: '+', label: lang === 'tn' ? 'Badirisi ba Madi a Mogala' : 'Mobile Money Users', icon: TrendingUp },
  { value: 850000, suffix: '+', label: lang === 'tn' ? 'Basamosetšene ba Inthanete' : 'Broadband Subscribers', icon: Wifi },
  { value: 3, suffix: '', label: lang === 'tn' ? 'Balaodi ba Neteweke' : 'Network Operators', icon: Building },
];

const getNews = (lang) => [
  { date: 'Feb 2024', cat: lang === 'tn' ? 'Tendara' : 'Tender', title: lang === 'tn' ? 'Go Tlhagisa le go Isa Didirisiwa tsa ICT' : 'Supply and Delivery of ICT Equipment', excerpt: lang === 'tn' ? 'Taletso ya tendara ya go tlhagisa le go isa didirisiwa tsa ICT go tshegetsa ditiro tsa BOCRA.' : 'Invitation to tender for the supply and delivery of ICT equipment to support BOCRA operations.' },
  { date: 'Jan 2024', cat: lang === 'tn' ? 'Tendara' : 'Tender', title: lang === 'tn' ? 'Kitsiso ya Tendara ya Setšhaba ya BOCRA' : 'BOCRA Public Tender Notice', excerpt: lang === 'tn' ? 'Kitsiso ya go reka e e laletsang batho ba ba tshwanelang go tsenya ditendara tsa ditlhokego tsa ditirelo tsa Bothati.' : 'General procurement notice inviting qualified bidders for Authority service requirements.' },
  { date: 'Dec 2023', cat: lang === 'tn' ? 'Kitsiso' : 'Notice', title: lang === 'tn' ? 'Papatso ya Setšhaba ya BOCRA' : 'BOCRA Public Advertisement', excerpt: lang === 'tn' ? 'Papatso ya semmuso e e tlhalosang diphetogo tsa taolo le dikgolagano le baamegi.' : 'Official advertisement outlining regulatory updates and stakeholder communications.' },
  { date: 'Jun 2021', cat: lang === 'tn' ? 'Pegelo ya Bobegadikgang' : 'Media Release', title: lang === 'tn' ? 'Phokotso ya Ditlhwatlhwa tsa Inthanete e Amogetse' : 'Broadband Price Reduction Approved', excerpt: lang === 'tn' ? 'BOCRA e amogetse phokotso ya go ya go 40% ya ditlhwatlhwa tsa inthanete ya BTC go simolola Seetebosigo 2021.' : 'BOCRA approved up to 40% reduction in BTC fixed broadband prices effective June 2021.' },
];

export default function HomePage() {
  const { lang } = useLanguage();
  const SECTORS = getSectors(lang);
  const SERVICES = getServices(lang);
  const STATS = getStats(lang);
  const FALLBACK_NEWS = getNews(lang);
  const [news, setNews] = useState(FALLBACK_NEWS);
  const heroRef = useRef(null);
  const sectorsRef = useStaggerReveal({ stagger: 0.15 });
  const servicesRef = useStaggerReveal({ stagger: 0.08 });
  const newsRef = useStaggerReveal({ stagger: 0.1 });

  // Fetch latest 4 published articles from Supabase
  useEffect(() => {
    let cancelled = false;
    async function fetchLatestNews() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(4);
        if (cancelled) return;
        if (error) throw error;
        if (data && data.length > 0) {
          setNews(data.map(post => ({
            date: post.published_at
              ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : '',
            cat: post.category || '',
            title: post.title,
            excerpt: post.summary || '',
          })));
        }
      } catch (err) {
        console.error('Failed to fetch latest news:', err);
      }
    }
    fetchLatestNews();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.h-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.1)
        .fromTo('.h-line', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 0.2)
        .fromTo('.h-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.7)
        .fromTo('.h-btn', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, 0.9);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div>
      <Helmet>
        <title>BOCRA — Botswana Communications Regulatory Authority</title>
        <meta name="description" content="Regulating telecommunications, broadcasting, postal, and internet services in Botswana." />
        <link rel="canonical" href="https://bocra.org.bw/" />
      </Helmet>
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center overflow-hidden">
        {/* Background image */}
        <img src={IMG_HERO} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-bocra-blue-dark/85" />

        {/* Content */}
        <div className="section-wrapper relative z-10 py-8 sm:py-14">
          <div className="max-w-4xl">
            <div className="h-badge mb-4 sm:mb-5">
              <h2 className="kinetic-word text-2xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight mb-4 leading-snug sm:whitespace-nowrap">
                <span style={{background:'linear-gradient(135deg,#00D4FF,#00A6CE,#60D0EE)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Botswana</span>{' '}
                <span style={{background:'linear-gradient(135deg,#FF3D9A,#C8237B,#E870B0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Communications</span>{' '}
                <span style={{background:'linear-gradient(135deg,#FFD557,#F7B731,#FFCC44)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Regulatory</span>{' '}
                <span style={{background:'linear-gradient(135deg,#8FE070,#6BBE4E,#96D87A)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Authority</span>
              </h2>
              <div className="flex gap-3 justify-center">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#00A6CE]" />
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#C8237B]" />
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F7B731]" />
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#6BBE4E]" />
              </div>
            </div>

            <h1 className="hero-kinetic text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight">
              <span className="h-line kinetic-line text-white">{lang === 'tn' ? 'E e Golaganeng &' : 'A Connected &'}</span>
              <span className="h-line kinetic-line kinetic-cyan text-[#00A6CE]">{lang === 'tn' ? 'E e Etelletsweng ke Dijithale' : 'Digitally Driven'}</span>
              <span className="h-line kinetic-line text-white">{lang === 'tn' ? 'Setšhaba' : 'Society'}</span>
            </h1>

            <p className="h-desc text-base sm:text-lg text-white/60 mt-3 sm:mt-4 leading-relaxed max-w-lg">
              {lang === 'tn' ? 'Go laola megala, phasalatso, poso le ditirelo tsa inthanete mo Botswana — go rotloetsa kgaisano, boitlhamedi, tshireletso ya badirisi le phitlhelelo ya botlhe.' : 'Regulating telecommunications, broadcasting, postal and internet services in Botswana — promoting competition, innovation, consumer protection and universal access for all.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
              <Link to="/about/profile" className="h-btn inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white text-bocra-blue font-bold rounded-xl hover:bg-gray-100 transition-all">
                {lang === 'tn' ? 'Ithute ka BOCRA' : 'Discover BOCRA'} <ArrowRight size={16} />
              </Link>
              <Link to="/services/file-complaint" className="h-btn inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                File a Complaint
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTORS ═══ */}
      <section className="py-10 sm:py-10 bg-white">
        <div className="section-wrapper">
          <SectionHead label={lang === 'tn' ? 'Se Re Se Laolang' : 'What We Regulate'} title={lang === 'tn' ? 'Maphata a le Manè, Pono e le Nngwe' : 'Four Sectors, One Vision'} />
          <div ref={sectorsRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:snap-none sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 mt-8 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {SECTORS.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.title} to={s.path} className="group relative h-48 sm:h-72 w-[75vw] sm:w-auto min-w-0 flex-shrink-0 sm:flex-shrink rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 snap-start">
                  <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 relative z-10">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: s.color }}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{s.title}</h3>
                    <p className="text-sm text-white/60 mt-1">{s.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 group-hover:text-white mt-3 transition-colors">
                      Go <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="py-10 sm:py-10 bg-gray-50">
        <div className="section-wrapper">
          <SectionHead label={lang === 'tn' ? 'Ditirelo tsa Baagi' : 'Citizen Services'} title={lang === 'tn' ? 'Re ka go Thusa Jang?' : 'How Can We Help You?'} />
          <div ref={servicesRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:snap-none sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 mt-8 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {SERVICES.map((s) => {
              const Icon = s.icon;
              const cardClass = "group bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-[75vw] sm:w-auto min-w-0 flex-shrink-0 sm:flex-shrink snap-start";
              const inner = (
                <>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                    style={{ background: `${s.color}10` }}>
                    <Icon size={22} style={{ color: s.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-bocra-slate">{s.title}</h3>
                  <p className="text-sm text-bocra-slate/50 mt-1">{s.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-0.5 w-8 rounded-full group-hover:w-16 transition-all duration-500" style={{ background: s.color }} />
                    <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1" style={{ color: s.color }}>
                      Go <ArrowRight size={12} />
                    </span>
                  </div>
                </>
              );
              return (
                <Link key={s.title} to={s.path} className={cardClass}>{inner}</Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ STATISTICS ═══ */}
      <section className="py-10 sm:py-16 relative overflow-hidden">
        <img src={IMG_SUNSET} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-bocra-blue/90" />
        <div className="section-wrapper relative z-10">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium text-white/80 mb-4">{lang === 'tn' ? 'Dipalopalo tsa Megala' : 'Telecom Statistics'}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">{lang === 'tn' ? 'Botswana ka Dipalo' : 'Botswana by the Numbers'}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {STATS.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/telecom-statistics" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
              View full statistics <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ NEWS ═══ */}
      <section className="py-10 sm:py-10 bg-white">
        <div className="section-wrapper">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="inline-block px-4 py-1.5 bg-bocra-blue/5 rounded-full text-sm font-medium text-bocra-blue mb-4">{lang === 'tn' ? 'Diphetogo tsa Bosheng' : 'Latest Updates'}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-bocra-slate">{lang === 'tn' ? 'Dikgang le Ditiragalo' : 'News & Events'}</h2>
            </div>
            <Link to="/media/news-events" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-bocra-blue hover:gap-3 transition-all">
              All News <ArrowRight size={14} />
            </Link>
          </div>
          <div ref={newsRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:snap-none sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {news.map((n, i) => (
              <Link key={i} to="/media/news-events" className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border border-gray-100 w-[75vw] sm:w-auto min-w-0 flex-shrink-0 sm:flex-shrink snap-start">
                <div className="h-1 w-full" style={{ background: SECTORS[i % 4].color }} />
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-bocra-slate/40 mb-3">
                    <span className="font-medium text-bocra-blue bg-bocra-blue/5 px-2 py-0.5 rounded">{n.cat}</span>
                    {n.date}
                  </div>
                  <h3 className="font-bold text-bocra-slate group-hover:text-bocra-blue transition-colors line-clamp-2 text-[15px]">{n.title}</h3>
                  <p className="text-sm text-bocra-slate/50 mt-2 line-clamp-2">{n.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-bocra-blue mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read more <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-10 sm:py-10 bg-gray-50">
        <div className="section-wrapper grid md:grid-cols-2 gap-6">
          <div className="group relative rounded-3xl p-10 md:p-12 text-white overflow-hidden bg-bocra-magenta hover:shadow-2xl hover:shadow-bocra-magenta/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-500" />
            <AlertCircle size={32} className="mb-4 opacity-80 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl md:text-3xl font-extrabold">{lang === 'tn' ? 'A o na le Ngongorego?' : 'Have a Complaint?'}</h3>
            <p className="text-white/70 mt-2 mb-6 max-w-md">{lang === 'tn' ? 'Bega mathata a motlamedi wa gago wa megala, phasalatso, kgotsa poso.' : 'Report issues with your telecom, broadcasting, or postal provider.'}</p>
            <Link to="/services/file-complaint" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-bocra-magenta font-bold rounded-xl hover:shadow-lg hover:gap-3 transition-all">
              File Now <ArrowRight size={16} />
            </Link>
          </div>
          <div className="group relative rounded-3xl p-10 md:p-12 text-white overflow-hidden bg-bocra-blue hover:shadow-2xl hover:shadow-bocra-blue/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-500" />
            <FileText size={32} className="mb-4 opacity-80 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl md:text-3xl font-extrabold">{lang === 'tn' ? 'A o Tlhoka Laesense?' : 'Need a Licence?'}</h3>
            <p className="text-white/70 mt-2 mb-6 max-w-md">{lang === 'tn' ? 'Ikopela dilaesense tsa megala, phasalatso, kgotsa ditirelo tsa poso.' : 'Apply for telecom, broadcasting, or postal service licences.'}</p>
            <Link to="/licensing" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-bocra-blue font-bold rounded-xl hover:shadow-lg hover:gap-3 transition-all">
              Learn More <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ label, title }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="text-center">
      <span className="inline-block px-4 py-1.5 bg-bocra-blue/5 rounded-full text-sm font-medium text-bocra-blue mb-4">{label}</span>
      <h2 className="text-3xl md:text-4xl font-extrabold text-bocra-slate">{title}</h2>
    </div>
  );
}

function StatCard({ value, suffix, label, icon: Icon }) {
  const refFull = useCountUp(value, suffix);
  const refCompact = useCountUp(value, suffix, true);
  return (
    <div className="text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
        <Icon size={20} className="text-white/80 sm:hidden" />
        <Icon size={24} className="text-white/80 hidden sm:block" />
      </div>
      <div ref={refFull} className="hidden sm:block text-3xl md:text-4xl font-extrabold text-white mb-1">0</div>
      <div ref={refCompact} className="sm:hidden text-2xl font-extrabold text-white mb-1">0</div>
      <div className="text-xs sm:text-sm text-white/50">{label}</div>
    </div>
  );
}
