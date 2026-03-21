/**
 * FAQsPage — Frequently Asked Questions
 * Redesigned to match BOCRA design system with accordion, categories, and proper links.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, HelpCircle, Shield, Globe, FileText, Radio,
  Phone, AlertCircle, Building, Wifi, Search, Mail
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
import { useScrollReveal } from '../../hooks/useAnimations';

const getFaqs = (lang) => [
  {
    category: 'General',
    icon: HelpCircle,
    color: '#00458B',
    items: [
      {
        q: lang === 'tn' ? 'BOCRA ke eng?' : 'What is BOCRA?',
        a: 'BOCRA is the Botswana Communications Regulatory Authority, established on 1 April 2013 under the Communications Regulatory Authority Act 2012. It regulates telecommunications, broadcasting, internet, and postal services in Botswana to ensure accessible, affordable, and quality communications for all.',
        links: [{ label: lang === 'tn' ? 'Ka ga BOCRA' : 'About BOCRA', path: '/about/profile' }],
      },
      {
        q: lang === 'tn' ? 'BOCRA e kae?' : 'Where is BOCRA located?',
        a: 'BOCRA is located at Plot 50671, Independence Avenue, Gaborone, Botswana. Our postal address is Private Bag 00495, Gaborone. Office hours are Monday to Friday, 7:30 AM to 4:30 PM.',
        links: [{ label: 'Contact Us', path: '/contact' }],
      },
      {
        q: lang === 'tn' ? 'Ke ikgolaganya le BOCRA jang?' : 'How do I contact BOCRA?',
        a: 'You can reach BOCRA by calling +267 395 7755, faxing +267 395 7976, or emailing info@bocra.org.bw. You can also use the online contact form on our website.',
        links: [{ label: 'Contact Page', path: '/contact' }],
      },
      {
        q: lang === 'tn' ? 'BOCRA e laola maphata afe?' : 'What sectors does BOCRA regulate?',
        a: 'BOCRA regulates four sectors: Telecommunications (mobile networks, internet, VoIP), Broadcasting (radio, TV, online streaming), Postal Services (national and commercial mail delivery), and Internet & ICT (broadband, cybersecurity, .bw domains).',
        links: [
          { label: 'Telecommunications', path: '/mandate/telecommunications' },
          { label: 'Broadcasting', path: '/mandate/broadcasting' },
          { label: 'Postal Services', path: '/mandate/postal' },
          { label: 'Internet & ICT', path: '/mandate/internet' },
        ],
      },
    ],
  },
  {
    category: 'Complaints',
    icon: AlertCircle,
    color: '#C8237B',
    items: [
      {
        q: lang === 'tn' ? 'Ke tlhagisa ngongorego jang?' : 'How do I file a complaint?',
        a: 'You can file a complaint using our online complaint form, by calling +267 395 7755, or by emailing info@bocra.org.bw. We recommend first raising the issue with your service provider directly. If unresolved, BOCRA will investigate and mediate.',
        links: [{ label: lang === 'tn' ? 'Tlhagisa Ngongorego' : 'File a Complaint', path: '/services/file-complaint' }],
      },
      {
        q: lang === 'tn' ? 'BOCRA e dira ka mefuta efe ya dingongorego?' : 'What types of complaints does BOCRA handle?',
        a: 'BOCRA handles complaints related to billing issues, network coverage and quality, service interruptions, data and internet problems, unfair contract terms, SIM swap fraud, and poor customer service from licensed operators including Mascom, BTC, and Orange.',
        links: [{ label: 'Consumer Education', path: '/complaints/consumer-education' }],
      },
      {
        q: lang === 'tn' ? 'Go tsaya nako e kae go rarabolola ngongorego?' : 'How long does it take to resolve a complaint?',
        a: 'BOCRA aims to acknowledge complaints within 2 business days and resolve them within 30 days. Complex cases involving multiple parties or technical investigations may take longer. You can track your complaint status through the operator portal.',
        links: [{ label: 'Operator Portal', path: '/services/asms-webcp' }],
      },
    ],
  },
  {
    category: 'Licensing',
    icon: FileText,
    color: '#6BBE4E',
    items: [
      {
        q: lang === 'tn' ? 'Ke ikopela laesense jang?' : 'How do I apply for a licence?',
        a: 'Visit our Licensing Hub to browse all available licence types including Aircraft Radio, Amateur Radio, Broadcasting, Cellular, Private Radio, Radio Dealers, Radio Frequency, Satellite, VANS, and more. Each licence type has specific requirements and fees.',
        links: [{ label: 'Licensing Hub', path: '/licensing' }],
      },
      {
        q: lang === 'tn' ? 'Ke netefatsa jang gore molaodi o na le laesense?' : 'How do I verify if an operator is licensed?',
        a: 'Use our Licence Verification page to search for any operator by name or licence number. The database contains 187 verified licences covering all telecommunications, broadcasting, and postal operators in Botswana.',
        links: [{ label: 'Verify a Licence', path: '/services/licence-verification' }],
      },
      {
        q: lang === 'tn' ? 'Ke tlhola jang gore sedirisiwa se amogetswe?' : 'How do I check if equipment is type-approved?',
        a: 'All telecommunications equipment used in Botswana must be type-approved by BOCRA. Visit our Type Approval page to search the approved equipment database or submit a new type approval application.',
        links: [{ label: 'Type Approval', path: '/services/type-approval' }],
      },
      {
        q: lang === 'tn' ? 'Ke dikwalo dife tsa dilaesense tsa ICT tse di leng teng?' : 'What ICT licensing documents are available?',
        a: 'BOCRA provides 15 ICT licensing framework documents covering application requirements, fee structures, and regulatory guidelines for all licence categories.',
        links: [{ label: 'ICT Licensing Documents', path: '/documents/ict-licensing' }],
      },
    ],
  },
  {
    category: 'Domains & Internet',
    icon: Globe,
    color: '#00A6CE',
    items: [
      {
        q: lang === 'tn' ? 'Ke kwadisa domeine ya .bw jang?' : 'How do I register a .bw domain?',
        a: 'Domain registrations are processed through BOCRA-accredited ISP registrars. Visit the Register .BW page to search for available domains, find accredited registrars, and view registration policies. Available extensions include .co.bw, .org.bw, and .ac.bw.',
        links: [{ label: 'Register .BW Domain', path: '/services/register-bw' }],
      },
      {
        q: lang === 'tn' ? 'Domeine ya .bw e ja bokae?' : 'What is the cost of a .bw domain?',
        a: 'Domain registration fees vary by registrar. Typically, a .bw domain costs between BWP 150 and BWP 500 per year. Contact an accredited registrar for specific pricing. BOCRA does not charge directly for domain registration.',
        links: [{ label: '.BW Registration', path: '/services/register-bw' }],
      },
    ],
  },
  {
    category: 'Cybersecurity',
    icon: Shield,
    color: '#F7B731',
    items: [
      {
        q: lang === 'tn' ? 'Ke bega tiragalo ya tshireletso ya saebo jang?' : 'How do I report a cybersecurity incident?',
        a: 'Use BOCRA\'s Cybersecurity Hub to report incidents including phishing attacks, malware infections, ransomware, data breaches, and SIM swap fraud. You can also contact the Botswana CSIRT team directly through the hub.',
        links: [{ label: 'Cybersecurity Hub', path: '/cybersecurity' }],
      },
      {
        q: lang === 'tn' ? 'Boferefere jwa go fetola SIM ke eng mme ke itshireletsa jang?' : 'What is SIM swap fraud and how do I protect myself?',
        a: 'SIM swap fraud occurs when criminals trick your mobile operator into transferring your phone number to a new SIM card, gaining access to your calls, messages, and mobile banking. Protect yourself by using strong PINs, enabling two-factor authentication, and never sharing your personal details with strangers.',
        links: [{ label: 'Safety Tips', path: '/cybersecurity' }],
      },
    ],
  },
  {
    category: 'QoS & Network',
    icon: Wifi,
    color: '#00A6CE',
    items: [
      {
        q: lang === 'tn' ? 'Ke ka tlhola boleng jwa neteweke mo kgaolong ya me jang?' : 'How can I check network quality in my area?',
        a: 'BOCRA monitors Quality of Service (QoS) metrics for all three mobile operators — Mascom, BTC, and Orange. The QoS Monitoring page shows call success rates, dropped call rates, network uptime, download speeds, and regional comparisons.',
        links: [{ label: 'QoS Monitoring', path: '/services/qos-monitoring' }],
      },
      {
        q: lang === 'tn' ? 'Ke ka bona dipalopalo tsa megala kae?' : 'Where can I find telecom statistics?',
        a: 'BOCRA publishes comprehensive telecommunications statistics including mobile subscriptions, internet penetration, broadband growth, and mobile money usage across Botswana.',
        links: [{ label: 'Telecom Statistics', path: '/telecom-statistics' }],
      },
    ],
  },
];

function FAQItem({ item, isOpen, toggle, color }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition-all hover:border-gray-200">
      <button
        onClick={toggle}
        className="flex items-start gap-3 w-full p-5 text-left"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
          style={{ background: isOpen ? color : '#F1F5F9', color: isOpen ? 'white' : color }}
        >
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        <span className={`font-semibold text-sm transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-700'}`}>
          {item.q}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="px-5 pb-5 pl-14">
          <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
          {item.links && item.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm"
                  style={{ background: color + '10', color }}
                >
                  {link.label}
                  <ChevronDown size={10} className="-rotate-90" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FAQsPage() {
  const { lang } = useLanguage();
  const FAQS = getFaqs(lang);
  const [openItems, setOpenItems] = useState(new Set(['General-0']));
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const heroRef = useScrollReveal();

  const toggle = (key) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredFAQs = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (activeCategory !== 'all' && cat.category !== activeCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      }
      return true;
    }),
  })).filter(cat => cat.items.length > 0);

  const totalCount = FAQS.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <PageHero category="RESOURCES" categoryTn="DITHULAGANYO" title="Frequently Asked Questions" titleTn="Dipotso Tse di Botswang Gantsi" description={`Find answers to ${totalCount} common questions about BOCRA services, licensing, complaints, cybersecurity, and more.`} color="yellow" />

      {/* Search */}
      <div className="section-wrapper mt-6">
        <div className="relative max-w-2xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00458B]/20 focus:border-[#00458B] text-sm transition-all"
          />
        </div>
      </div>

      {/* Main */}
      <div className="section-wrapper mt-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">CATEGORIES</h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeCategory === 'all' ? 'bg-[#00458B]/5 text-[#00458B] font-semibold' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <HelpCircle size={16} className={activeCategory === 'all' ? 'text-[#00458B]' : 'text-gray-400'} />
                <span className="flex-1 text-left">All Questions</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeCategory === 'all' ? 'bg-[#00458B] text-white' : 'bg-gray-100 text-gray-400'}`}>{totalCount}</span>
              </button>
              {FAQS.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => setActiveCategory(cat.category)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive ? 'bg-[#00458B]/5 text-[#00458B] font-semibold' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#00458B]' : 'text-gray-400'} />
                    <span className="flex-1 text-left">{cat.category}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-[#00458B] text-white' : 'bg-gray-100 text-gray-400'}`}>{cat.items.length}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick contact */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-700 mb-2">Can't find your answer?</p>
              <p className="text-xs text-gray-400 mb-3">Get in touch with our team directly.</p>
              <Link to="/contact" className="flex items-center gap-2 px-3 py-2 bg-[#00458B] text-white text-xs font-semibold rounded-lg hover:bg-[#003366] transition-colors">
                <Mail size={12} /> Contact Us
              </Link>
            </div>
          </aside>

          {/* FAQ List */}
          <div className="flex-1 min-w-0">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-20">
                <Search size={40} className="mx-auto mb-3 text-gray-200" />
                <h3 className="text-base font-semibold text-gray-500 mb-1">No matching questions</h3>
                <p className="text-sm text-gray-400">Try different keywords or browse all categories.</p>
              </div>
            ) : (
              filteredFAQs.map(cat => (
                <div key={cat.category} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <cat.icon size={16} style={{ color: cat.color }} />
                    <h2 className="text-sm font-bold" style={{ color: cat.color }}>{cat.category}</h2>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] text-gray-400">{cat.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <FAQItem
                        key={`${cat.category}-${j}`}
                        item={item}
                        isOpen={openItems.has(`${cat.category}-${j}`)}
                        toggle={() => toggle(`${cat.category}-${j}`)}
                        color={cat.color}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
