/**
 * ConsumerEducationPage.jsx — Consumer Education & Rights
 * 
 * Educates consumers about their rights when dealing with telecoms,
 * broadcasting, postal, and internet service providers in Botswana.
 * Route: /complaints/consumer-education
 */
import { Link } from 'react-router-dom';
import {
  ChevronRight, Shield, AlertCircle, CheckCircle, Phone, Wifi,
  CreditCard, Clock, FileText, ArrowRight, Users, Globe,
  Radio, Mail, HelpCircle, Scale, Eye, Lock, Smartphone, Tv
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const getRights = (lang) => [
  { icon: CheckCircle, title: lang === 'tn' ? 'Tshwanelo ya Tirelo e e Boleng' : 'Right to Quality Service', desc: lang === 'tn' ? 'O na le tshwanelo ya ditirelo tsa megala, phasalatso, le poso tse di ikanyegang, tse di sa kgoreletsegeng tse di fitlhelang maemo a boleng a a beilweng ke BOCRA.' : 'You are entitled to reliable, uninterrupted telecommunications, broadcasting, and postal services that meet the quality standards set by BOCRA.', color: '#00A6CE' },
  { icon: CreditCard, title: lang === 'tn' ? 'Tshwanelo ya Ditlhwatlhwa tse di Siameng' : 'Right to Fair Pricing', desc: lang === 'tn' ? 'Batlhagisi ba ditirelo ba tshwanetse go duedisa ditlhwatlhwa tse di siameng, tse di bonalang. O tshwanetse go amogela tuelo e e tlhamaletseng e e senang dituelo tse di fitlhegileng.' : 'Service providers must charge fair, transparent prices. You should receive clear billing with no hidden charges or unauthorised deductions.', color: '#6BBE4E' },
  { icon: FileText, title: lang === 'tn' ? 'Tshwanelo ya Tshedimosetso' : 'Right to Information', desc: lang === 'tn' ? 'O na le tshwanelo ya tshedimosetso e e tlhamaletseng, e e nepagetseng ka ditirelo, ditlhwatlhwa, le maemo pele o ikwadisa.' : 'You have the right to clear, accurate information about services, tariffs, terms and conditions before subscribing.', color: '#F7B731' },
  { icon: Shield, title: lang === 'tn' ? 'Tshwanelo ya go Ngongorega' : 'Right to Complain', desc: 'If you are dissatisfied with a service, you have the right to complain — first to your provider, then to BOCRA if unresolved.', color: '#C8237B' },
  { icon: Lock, title: lang === 'tn' ? 'Tshwanelo ya Sephiri' : 'Right to Privacy', desc: 'Your personal data and communications must be protected. Providers cannot share your information without consent.', color: '#00458B' },
  { icon: Scale, title: lang === 'tn' ? 'Tshwanelo ya Pusolosego' : 'Right to Redress', desc: 'If your complaint is valid, you are entitled to a remedy — whether a refund, service restoration, or compensation.', color: '#7C3AED' },
];

const getCOMMON_ISSUES = (lang) => [
  { icon: Wifi, title: lang === 'tn' ? 'Phitlhelelo e e Bokoa ya Neteweke' : 'Poor Network Coverage', desc: lang === 'tn' ? 'Megala e e wetseng, inthanete e e bonya, kgotsa go se na letshwao mo kgaolong ya gago' : 'Dropped calls, slow internet, or no signal in your area', provider: 'Mascom, BTC, Orange', color: '#00A6CE' },
  { icon: CreditCard, title: lang === 'tn' ? 'Mathata a Tuelo le Eathime' : 'Billing & Airtime Issues', desc: lang === 'tn' ? 'Dituelo tse di sa tlhalosiwang, dituelo tse di phoso, kgotsa ditiro tsa madi a mogala tse di palelwang' : 'Unexplained deductions, wrong charges, or failed mobile money transactions', provider: 'All operators', color: '#C8237B' },
  { icon: Smartphone, title: lang === 'tn' ? 'Boferefere jwa go Fetola SIM' : 'SIM Swap Fraud', desc: 'Someone swapped your SIM without authorisation to steal your accounts', provider: 'All operators', color: '#DC2626' },
  { icon: Clock, title: lang === 'tn' ? 'Go Ema ga Tirelo' : 'Service Downtime', desc: 'Extended outages without notice or compensation', provider: 'All operators', color: '#F7B731' },
  { icon: Mail, title: lang === 'tn' ? 'Go Diega ga Poso' : 'Postal Delays', desc: 'Lost parcels, late delivery, or damaged mail items', provider: 'Botswana Post, couriers', color: '#F7B731' },
  { icon: Tv, title: lang === 'tn' ? 'Dingongorego tsa Phasalatso' : 'Broadcasting Complaints', desc: 'Offensive content, misleading advertising, or signal issues', provider: 'Radio & TV stations', color: '#6BBE4E' },
];

const getSteps = (lang) => [
  { step: '1', title: lang === 'tn' ? 'Ikgolaganye le Motlamedi wa Gago' : 'Contact Your Provider', desc: 'Always try to resolve the issue directly with your service provider first. Keep records of all communications — dates, reference numbers, and what was discussed.', color: '#00A6CE' },
  { step: '2', title: lang === 'tn' ? 'Emela Karabo' : 'Wait for Response', desc: 'Give your provider a reasonable time to respond — usually 14 days. If they don\'t respond or you\'re not satisfied with their response, proceed to step 3.', color: '#F7B731' },
  { step: '3', title: lang === 'tn' ? 'Tlhagisa mo BOCRA' : 'File with BOCRA', desc: 'Submit a formal complaint to BOCRA through our online complaint form. Include your provider\'s response (or lack thereof) and all supporting evidence.', color: '#C8237B' },
  { step: '4', title: lang === 'tn' ? 'BOCRA e a Batlisisa' : 'BOCRA Investigates', desc: 'BOCRA will review your complaint, contact the provider, and work towards a resolution. You\'ll receive a reference number to track progress.', color: '#6BBE4E' },
];

export default function ConsumerEducationPage() {
  const { lang } = useLanguage();
  const RIGHTS = getRights(lang);
  const COMMON_COMPLAINTS = getCommonComplaints(lang);
  const STEPS = getSteps(lang);
  const heroRef = useScrollReveal();
  const rightsRef = useStaggerReveal({ stagger: 0.08 });
  const issuesRef = useStaggerReveal({ stagger: 0.08 });

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">Home</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate/50">Services</span>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">Consumer Education</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        category="CONSUMER PROTECTION" categoryTn="TSHIRELETSO YA BADIRISI"
        title="Know Your Rights" titleTn="Itse Ditshwanelo Tsa Gago"
        description="As a consumer of telecommunications, broadcasting, postal, and internet services in Botswana, you have rights. BOCRA is here to protect them." descriptionTn="Jaaka modirisi wa ditirelo tsa megala, phasalatso, poso, le inthanete mo Botswana, o na le ditshwanelo. BOCRA e teng go di sireletsa."
        color="magenta"
      />

      {/* Your Rights */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Ditshwanelo Tsa Gago Tsa Bodirisi' : 'Your Consumer Rights'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{lang === 'tn' ? 'Modirisi mongwe le mongwe wa ditirelo tsa dikgolagano mo Botswana o na le ditshwanelo tse' : 'Every consumer of communications services in Botswana is entitled to these rights'}</p>
          <div ref={rightsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RIGHTS.map(right => (
              <div key={right.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${right.color}12` }}>
                  <right.icon size={20} style={{ color: right.color }} />
                </div>
                <h3 className="text-sm font-bold text-bocra-slate mb-1">{right.title}</h3>
                <p className="text-xs text-bocra-slate/60 leading-relaxed">{right.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Mathata a a Tlwaelegileng a Badirisi' : 'Common Consumer Issues'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{lang === 'tn' ? 'Tse ke dingongorego tse di tlwaelegileng thata tse BOCRA e di amogelang go tswa go badirisi' : 'These are the most frequent complaints BOCRA receives from consumers'}</p>
          <div ref={issuesRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMON_ISSUES.map(issue => (
              <div key={issue.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="h-1.5" style={{ background: issue.color }} />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${issue.color}12` }}>
                      <issue.icon size={15} style={{ color: issue.color }} />
                    </div>
                    <h3 className="text-xs font-bold text-bocra-slate">{issue.title}</h3>
                  </div>
                  <p className="text-xs text-bocra-slate/60 leading-relaxed mb-2">{issue.desc}</p>
                  <p className="text-[10px] text-bocra-slate/40">Affected providers: {issue.provider}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Complain */}
      <section className="py-10">
        <div className="section-wrapper max-w-4xl">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Go Tlhagisa Ngongorego Jang' : 'How to File a Complaint'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{lang === 'tn' ? 'Latela dikgato tse fa o na le bothata le motlamedi wa gago wa tirelo' : 'Follow these steps if you have an issue with your service provider'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-white rounded-xl border border-gray-200 p-5 h-full">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3" style={{ background: s.color }}>
                    {s.step}
                  </div>
                  <h3 className="text-sm font-bold text-bocra-slate mb-1">{s.title}</h3>
                  <p className="text-xs text-bocra-slate/60 leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && <div className="hidden lg:block absolute top-10 -right-3 text-gray-300 text-lg font-bold">→</div>}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services/file-complaint"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8237B] text-white text-sm font-medium rounded-xl hover:bg-[#A01D64] transition-all">
              <AlertCircle size={16} /> File a Complaint Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tips for Consumers */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Protect Yourself */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-bocra-slate mb-4 flex items-center gap-2">
                <Shield size={16} className="text-[#00A6CE]" /> Protect Yourself
              </h3>
              <div className="space-y-3">
                {[
                  'Always read terms and conditions before subscribing to any service',
                  'Keep records of all transactions, receipts, and communications',
                  'Never share your PIN, password, or OTP with anyone — even if they claim to be from your provider',
                  'Register your SIM card in your own name and secure your mobile money account',
                  'Check your balance and statements regularly for unauthorised charges',
                  'Report any suspicious SMS, calls, or emails to your provider immediately',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={13} className="text-[#00A6CE] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-bocra-slate/60">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Useful Contacts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-bocra-slate mb-4 flex items-center gap-2">
                <Phone size={16} className="text-[#C8237B]" /> Useful Contacts
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-bocra-off-white rounded-lg">
                  <p className="text-xs font-bold text-bocra-slate">BOCRA</p>
                  <p className="text-xs text-bocra-slate/50">+267 395 7755 · info@bocra.org.bw</p>
                </div>
                <div className="p-3 bg-bocra-off-white rounded-lg">
                  <p className="text-xs font-bold text-bocra-slate">Mascom Wireless</p>
                  <p className="text-xs text-bocra-slate/50">111 (from Mascom) · www.mascom.bw</p>
                </div>
                <div className="p-3 bg-bocra-off-white rounded-lg">
                  <p className="text-xs font-bold text-bocra-slate">BTC / beMOBILE</p>
                  <p className="text-xs text-bocra-slate/50">0800 600 600 · www.btc.bw</p>
                </div>
                <div className="p-3 bg-bocra-off-white rounded-lg">
                  <p className="text-xs font-bold text-bocra-slate">Orange Botswana</p>
                  <p className="text-xs text-bocra-slate/50">144 (from Orange) · www.orange.co.bw</p>
                </div>
                <div className="p-3 bg-bocra-off-white rounded-lg">
                  <p className="text-xs font-bold text-bocra-slate">Botswana Post</p>
                  <p className="text-xs text-bocra-slate/50">+267 395 2111 · www.botspost.co.bw</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8">
        <div className="section-wrapper max-w-5xl">
          <h3 className="text-sm font-bold text-bocra-slate mb-4">{lang === 'tn' ? 'Ditsebe Tse di Amanang' : 'Related Pages'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: lang === 'tn' ? 'Tlhagisa Ngongorego' : 'File a Complaint', path: '/services/file-complaint', icon: AlertCircle, color: '#C8237B' },
              { label: 'FAQs', path: '/faqs', icon: HelpCircle, color: '#F7B731' },
              { label: 'Data Protection', path: '/data-protection', icon: Lock, color: '#00458B' },
              { label: 'Cybersecurity Hub', path: '/cybersecurity', icon: Shield, color: '#00A6CE' },
            ].map(link => (
              <Link key={link.path} to={link.path} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}12` }}>
                  <link.icon size={16} style={{ color: link.color }} />
                </div>
                <span className="text-xs font-medium text-bocra-slate/70 group-hover:text-bocra-slate">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
