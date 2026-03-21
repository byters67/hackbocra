/**
 * FAQsPage — Redesigned with category cards
 * Click a category to see its questions. Fully bilingual.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, HelpCircle, Shield, Globe, FileText,
  Phone, AlertCircle, Building, Wifi, Search, Mail, ArrowLeft
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
import { useStaggerReveal } from '../../hooks/useAnimations';

const getFaqs = (tn) => [
  {
    id: 'general', category: tn ? 'Ka Kakaretso' : 'General', icon: HelpCircle, color: '#00458B',
    desc: tn ? 'Dipotso ka BOCRA, lefelo, le dikgolagano' : 'About BOCRA, location, and contact info',
    items: [
      { q: tn ? 'BOCRA ke eng?' : 'What is BOCRA?', a: tn ? 'BOCRA ke Bothati jwa Taolo ya Dikgolagano jwa Botswana, bo bo tlhomilweng ka la 1 Moranang 2013 ka fa tlase ga Molao wa Bothati jwa Taolo ya Dikgolagano wa 2012. Bo laola megala, phasalatso, inthanete, le ditirelo tsa poso mo Botswana go netefatsa dikgolagano tse di fitlhelelwang, tse di sa tureng, le tse di boleng.' : 'BOCRA is the Botswana Communications Regulatory Authority, established on 1 April 2013 under the Communications Regulatory Authority Act 2012. It regulates telecommunications, broadcasting, internet, and postal services in Botswana to ensure accessible, affordable, and quality communications for all.', links: [{ label: tn ? 'Ka ga BOCRA' : 'About BOCRA', path: '/about/profile' }] },
      { q: tn ? 'BOCRA e kae?' : 'Where is BOCRA located?', a: tn ? 'BOCRA e kwa Plot 50671, Independence Avenue, Gaborone, Botswana. Aterese ya rona ya poso ke Private Bag 00495, Gaborone. Diura tsa ofisi ke Mosupologo go ya go Laboraro, 7:30 mo mosong go ya go 4:30 motshegare.' : 'BOCRA is located at Plot 50671, Independence Avenue, Gaborone, Botswana. Our postal address is Private Bag 00495, Gaborone. Office hours are Monday to Friday, 7:30 AM to 4:30 PM.', links: [{ label: tn ? 'Ikgolaganye le Rona' : 'Contact Us', path: '/contact' }] },
      { q: tn ? 'Ke ikgolaganya le BOCRA jang?' : 'How do I contact BOCRA?', a: tn ? 'O ka fitlhelela BOCRA ka go leletsa +267 395 7755, go romela fax kwa +267 395 7976, kgotsa go romela imeile kwa info@bocra.org.bw. Gape o ka dirisa foromo ya kgolagano ya inthanete mo webosaeteng ya rona.' : 'You can reach BOCRA by calling +267 395 7755, faxing +267 395 7976, or emailing info@bocra.org.bw. You can also use the online contact form on our website.', links: [{ label: tn ? 'Tsebe ya Kgolagano' : 'Contact Page', path: '/contact' }] },
      { q: tn ? 'BOCRA e laola maphata afe?' : 'What sectors does BOCRA regulate?', a: tn ? 'BOCRA e laola maphata a le mane: Megala (dineteweke tsa mogala, inthanete, VoIP), Phasalatso (radio, TV, streaming ya inthanete), Ditirelo tsa Poso (thomelo ya poso ya bosetšhaba le ya kgwebo), le Inthanete le ICT (inthanete ya lobelo, tshireletso ya saebo, mafelo a .bw).' : 'BOCRA regulates four sectors: Telecommunications (mobile networks, internet, VoIP), Broadcasting (radio, TV, online streaming), Postal Services (national and commercial mail delivery), and Internet & ICT (broadband, cybersecurity, .bw domains).', links: [{ label: tn ? 'Megala' : 'Telecommunications', path: '/mandate/telecommunications' }, { label: tn ? 'Phasalatso' : 'Broadcasting', path: '/mandate/broadcasting' }] },
    ],
  },
  {
    id: 'complaints', category: tn ? 'Dingongorego' : 'Complaints', icon: AlertCircle, color: '#C8237B',
    desc: tn ? 'Go tlhagisa le go latela dingongorego' : 'Filing and tracking complaints',
    items: [
      { q: tn ? 'Ke tlhagisa ngongorego jang?' : 'How do I file a complaint?', a: tn ? 'O ka tlhagisa ngongorego ka go dirisa foromo ya rona ya inthanete, ka go leletsa +267 395 7755, kgotsa ka go romela imeile kwa info@bocra.org.bw. Re atlenegisa gore o simolole ka go bega bothata le motlamedi wa gago wa tirelo ka tlhamalalo. Fa e sa rarabololwe, BOCRA e tla batlisisa.' : 'You can file a complaint using our online complaint form, by calling +267 395 7755, or by emailing info@bocra.org.bw. We recommend first raising the issue with your service provider directly. If unresolved, BOCRA will investigate and mediate.', links: [{ label: tn ? 'Tlhagisa Ngongorego' : 'File a Complaint', path: '/services/file-complaint' }] },
      { q: tn ? 'BOCRA e dira ka mefuta efe ya dingongorego?' : 'What types of complaints does BOCRA handle?', a: tn ? 'BOCRA e dira ka dingongorego tse di amanang le mathata a dituelo, phitlhelelo ya neteweke le boleng, go emisiwa ga ditirelo, mathata a data le inthanete, melao e e sa siamang ya dikonteraka, boferefere jwa go fetola SIM, le tirelo e e sa siamang ya bareki go tswa go balaodi ba ba nang le dilaesense.' : 'BOCRA handles complaints related to billing issues, network coverage and quality, service interruptions, data and internet problems, unfair contract terms, SIM swap fraud, and poor customer service from licensed operators including Mascom, BTC, and Orange.', links: [{ label: tn ? 'Thuto ya Badirisi' : 'Consumer Education', path: '/complaints/consumer-education' }] },
      { q: tn ? 'Go tsaya nako e kae go rarabolola ngongorego?' : 'How long does it take to resolve a complaint?', a: tn ? 'BOCRA e ikaelela go amogela dingongorego mo malatsing a le 2 a tiriso le go di rarabolola mo malatsing a le 30. Dikgetse tse di raraaneng tse di akaretsang maphata a mantsi kgotsa dipatlisiso tsa setegeniki di ka tsaya nako e telele.' : 'BOCRA aims to acknowledge complaints within 2 business days and resolve them within 30 days. Complex cases involving multiple parties or technical investigations may take longer.', links: [{ label: tn ? 'Potala ya Molaodi' : 'Operator Portal', path: '/services/asms-webcp' }] },
    ],
  },
  {
    id: 'licensing', category: tn ? 'Dilaesense' : 'Licensing', icon: FileText, color: '#6BBE4E',
    desc: tn ? 'Go ikopela le go netefatsa dilaesense' : 'Applying for and verifying licences',
    items: [
      { q: tn ? 'Ke ikopela laesense jang?' : 'How do I apply for a licence?', a: tn ? 'Etela Setlhogo sa Dilaesense sa rona go bona mefuta yotlhe ya dilaesense tse di leng teng go akaretsa Radio ya Difofane, Radio ya Baratani, Phasalatso, Mogala, Radio ya Poraefete, le tse dingwe. Mofuta mongwe le mongwe wa laesense o na le ditlhokego le dituelo tse di rileng.' : 'Visit our Licensing Hub to browse all available licence types including Aircraft Radio, Amateur Radio, Broadcasting, Cellular, Private Radio, Radio Dealers, Radio Frequency, Satellite, VANS, and more. Each licence type has specific requirements and fees.', links: [{ label: tn ? 'Setlhogo sa Dilaesense' : 'Licensing Hub', path: '/licensing' }] },
      { q: tn ? 'Ke netefatsa jang gore molaodi o na le laesense?' : 'How do I verify if an operator is licensed?', a: tn ? 'Dirisa tsebe ya rona ya Netefatso ya Laesense go batla molaodi ope ka leina kgotsa nomoro ya laesense. Database e na le dilaesense di le 187 tse di netefaditsweng.' : 'Use our Licence Verification page to search for any operator by name or licence number. The database contains 187 verified licences covering all telecommunications, broadcasting, and postal operators in Botswana.', links: [{ label: tn ? 'Netefatsa Laesense' : 'Verify a Licence', path: '/services/licence-verification' }] },
      { q: tn ? 'Ke tlhola jang gore sedirisiwa se amogetswe?' : 'How do I check if equipment is type-approved?', a: tn ? 'Didirisiwa tsotlhe tsa megala tse di dirisiwang mo Botswana di tshwanetse go amogelwa ka mofuta ke BOCRA. Etela tsebe ya rona ya Tumelelo ya Mofuta go batla mo database ya didirisiwa tse di amogetsweng.' : 'All telecommunications equipment used in Botswana must be type-approved by BOCRA. Visit our Type Approval page to search the approved equipment database or submit a new type approval application.', links: [{ label: tn ? 'Tumelelo ya Mofuta' : 'Type Approval', path: '/services/type-approval' }] },
      { q: tn ? 'Ke dikwalo dife tsa dilaesense tsa ICT tse di leng teng?' : 'What ICT licensing documents are available?', a: tn ? 'BOCRA e fana ka dikwalo di le 15 tsa thulaganyo ya dilaesense tsa ICT tse di akaretsang ditlhokego tsa dikopo, dithulaganyo tsa dituelo, le ditaelo tsa taolo bakeng sa dikarolo tsotlhe tsa dilaesense.' : 'BOCRA provides 15 ICT licensing framework documents covering application requirements, fee structures, and regulatory guidelines for all licence categories.', links: [{ label: tn ? 'Dikwalo tsa Dilaesense tsa ICT' : 'ICT Licensing Documents', path: '/documents/ict-licensing' }] },
    ],
  },
  {
    id: 'domains', category: tn ? 'Mafelo le Inthanete' : 'Domains & Internet', icon: Globe, color: '#00A6CE',
    desc: tn ? 'Kwadiso ya .bw le ditlhwatlhwa' : '.bw registration and pricing',
    items: [
      { q: tn ? 'Ke kwadisa domeine ya .bw jang?' : 'How do I register a .bw domain?', a: tn ? 'Dikwadiso tsa mafelo di dirwa ka bakwadisi ba ISP ba ba amogeletsweng ke BOCRA. Etela tsebe ya Kwadisa .BW go batla mafelo a a leng teng, go bona bakwadisi ba ba amogeletsweng, le go bona dipholisi tsa kwadiso.' : 'Domain registrations are processed through BOCRA-accredited ISP registrars. Visit the Register .BW page to search for available domains, find accredited registrars, and view registration policies.', links: [{ label: tn ? 'Kwadisa Lefelo la .BW' : 'Register .BW Domain', path: '/services/register-bw' }] },
      { q: tn ? 'Domeine ya .bw e ja bokae?' : 'What is the cost of a .bw domain?', a: tn ? 'Dituelo tsa kwadiso ya lefelo di farologana ka mokwadisi. Ka tlwaelo, lefelo la .bw le ja magareng ga BWP 150 le BWP 500 ka ngwaga. Ikgolaganye le mokwadisi o o amogeletsweng bakeng sa ditlhwatlhwa tse di rileng.' : 'Domain registration fees vary by registrar. Typically, a .bw domain costs between BWP 150 and BWP 500 per year. Contact an accredited registrar for specific pricing.', links: [{ label: tn ? 'Kwadiso ya .BW' : '.BW Registration', path: '/services/register-bw' }] },
    ],
  },
  {
    id: 'cybersecurity', category: tn ? 'Tshireletso ya Saebo' : 'Cybersecurity', icon: Shield, color: '#F7B731',
    desc: tn ? 'Go bega ditiragalo le go itshireletsa' : 'Reporting incidents and staying safe',
    items: [
      { q: tn ? 'Ke bega tiragalo ya tshireletso ya saebo jang?' : 'How do I report a cybersecurity incident?', a: tn ? 'Dirisa Lefelo la Tshireletso ya Saebo la BOCRA go bega ditiragalo go akaretsa ditlhaselo tsa phishing, malware, ransomware, go tshologa ga data, le boferefere jwa go fetola SIM. Gape o ka ikgolaganya le setlhopha sa CSIRT sa Botswana ka tlhamalalo.' : "Use BOCRA's Cybersecurity Hub to report incidents including phishing attacks, malware infections, ransomware, data breaches, and SIM swap fraud. You can also contact the Botswana CSIRT team directly.", links: [{ label: tn ? 'Lefelo la Tshireletso ya Saebo' : 'Cybersecurity Hub', path: '/cybersecurity' }] },
      { q: tn ? 'Boferefere jwa go fetola SIM ke eng?' : 'What is SIM swap fraud?', a: tn ? 'Boferefere jwa go fetola SIM bo diragala fa basenyi ba tsietsa molaodi wa gago wa mogala go fetolela nomoro ya gago ya mogala kwa SIM karateng e ntšhwa, ba bona phitlhelelo ya megala ya gago, melaetsa, le tiriso ya banka ka mogala. Itshireletse ka go dirisa di-PIN tse di nonofileng le go se ke wa abelana dintlha tsa gago le batho ba o sa ba itseng.' : 'SIM swap fraud occurs when criminals trick your mobile operator into transferring your phone number to a new SIM card, gaining access to your calls, messages, and mobile banking. Protect yourself by using strong PINs and never sharing your personal details with strangers.', links: [{ label: tn ? 'Dikeletso tsa Polokego' : 'Safety Tips', path: '/cybersecurity' }] },
    ],
  },
  {
    id: 'qos', category: tn ? 'Boleng jwa Tirelo le Neteweke' : 'QoS & Network', icon: Wifi, color: '#059669',
    desc: tn ? 'Boleng jwa neteweke le dipalopalo' : 'Network quality and statistics',
    items: [
      { q: tn ? 'Ke ka tlhola boleng jwa neteweke mo kgaolong ya me jang?' : 'How can I check network quality in my area?', a: tn ? 'BOCRA e ela tlhoko dimetse tsa Boleng jwa Tirelo (QoS) bakeng sa balaodi botlhe ba le bararo ba mogala — Mascom, BTC, le Orange. Tsebe ya Tlhokomelo ya QoS e bontsha dipholo tsa megala, go wa ga megala, nako ya go bereka ga neteweke, lobelo la go tsenya, le dipapiso tsa dikgaolo.' : 'BOCRA monitors Quality of Service (QoS) metrics for all three mobile operators — Mascom, BTC, and Orange. The QoS Monitoring page shows call success rates, dropped call rates, network uptime, download speeds, and regional comparisons.', links: [{ label: tn ? 'Tlhokomelo ya QoS' : 'QoS Monitoring', path: '/services/qos-monitoring' }] },
      { q: tn ? 'Ke ka bona dipalopalo tsa megala kae?' : 'Where can I find telecom statistics?', a: tn ? 'BOCRA e gatisa dipalopalo tse di feletseng tsa megala go akaretsa disamasetshene tsa mogala, go tsena ga inthanete, kgolo ya inthanete ya lobelo, le tiriso ya madi a mogala mo Botswana yotlhe.' : 'BOCRA publishes comprehensive telecommunications statistics including mobile subscriptions, internet penetration, broadband growth, and mobile money usage across Botswana.', links: [{ label: tn ? 'Dipalopalo tsa Megala' : 'Telecom Statistics', path: '/telecom-statistics' }] },
    ],
  },
];

function FAQItem({ item, isOpen, toggle, color }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition-all hover:border-gray-200">
      <button onClick={toggle} className="flex items-start gap-3 w-full p-5 text-left">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors" style={{ background: isOpen ? color : '#F1F5F9', color: isOpen ? 'white' : color }}>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        <span className={`font-semibold text-sm transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-700'}`}>{item.q}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="px-5 pb-5 pl-14">
          <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
          {item.links?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.links.map(link => (
                <Link key={link.path} to={link.path} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm" style={{ background: color + '10', color }}>
                  {link.label} <ChevronDown size={10} className="-rotate-90" />
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
  const tn = lang === 'tn';
  const FAQS = getFaqs(tn);
  const [activeCategory, setActiveCategory] = useState(null);
  const [openItems, setOpenItems] = useState(new Set());
  const [search, setSearch] = useState('');
  const cardsRef = useStaggerReveal({ stagger: 0.08 });

  const totalCount = FAQS.reduce((s, c) => s + c.items.length, 0);
  const toggle = (key) => { setOpenItems(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; }); };

  const active = activeCategory ? FAQS.find(c => c.id === activeCategory) : null;
  const filteredItems = active ? (search ? active.items.filter(i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())) : active.items) : [];

  if (!active) {
    return (
      <div className="bg-white">
        <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{tn ? 'Dipotso tse di Botswang Gantsi' : 'FAQs'}</span></nav></div></div>
        <PageHero category="RESOURCES" categoryTn="DITHULAGANYO" title="Frequently Asked Questions" titleTn="Dipotso Tse di Botswang Gantsi" description={tn ? `Bona dikarabo tsa dipotso di le ${totalCount} tse di tlwaelegileng ka ga ditirelo tsa BOCRA, dilaesense, dingongorego, tshireletso ya saebo, le tse dingwe.` : `Find answers to ${totalCount} common questions about BOCRA services, licensing, complaints, cybersecurity, and more.`} color="yellow" />

        <section className="py-6"><div className="section-wrapper">
          <div className="flex items-center justify-center gap-6 text-center">
            <div><p className="text-3xl font-bold text-bocra-slate">{totalCount}</p><p className="text-xs text-bocra-slate/40">{tn ? 'Dipotso Tsotlhe' : 'Total Questions'}</p></div>
            <div className="w-px h-10 bg-gray-200" />
            <div><p className="text-3xl font-bold text-[#00A6CE]">{FAQS.length}</p><p className="text-xs text-bocra-slate/40">{tn ? 'Dikarolo' : 'Categories'}</p></div>
          </div>
        </div></section>

        <section className="py-6 bg-bocra-off-white"><div className="section-wrapper">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{tn ? 'Tlhopha Setlhogo' : 'Choose a Topic'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{tn ? 'Tobetsa setlhogo go bona dipotso tsa sona' : 'Click a topic to see its questions'}</p>
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {FAQS.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setOpenItems(new Set([`${cat.id}-0`])); }}
                  className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: cat.color }} />
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}12` }}>
                      <Icon size={20} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-bocra-slate group-hover:text-[#00458B] transition-colors">{cat.category}</h3>
                      <p className="text-[10px] text-bocra-slate/40 mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.items.length} {tn ? 'dipotso' : 'questions'}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#00A6CE] group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div></section>

        <section className="py-6"><div className="section-wrapper max-w-2xl mx-auto text-center">
          <p className="text-sm text-bocra-slate/40 mb-3">{tn ? 'Ga o bone karabo ya gago?' : "Can't find your answer?"}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
            <Mail size={14} /> {tn ? 'Ikgolaganye le Rona' : 'Contact Us'}
          </Link>
        </div></section>

        <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
      </div>
    );
  }

  const Icon = active.icon;
  return (
    <div className="bg-white">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><button onClick={() => { setActiveCategory(null); setSearch(''); }} className="hover:text-bocra-blue">{tn ? 'Dipotso' : 'FAQs'}</button><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{active.category}</span></nav></div></div>

      <section className="py-8"><div className="section-wrapper max-w-3xl">
        <button onClick={() => { setActiveCategory(null); setSearch(''); }} className="flex items-center gap-2 text-sm text-[#00A6CE] hover:text-[#00458B] font-medium mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {tn ? 'Boela kwa Ditlhogong' : 'Back to Topics'}
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${active.color}15` }}>
            <Icon size={28} style={{ color: active.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-bocra-slate">{active.category}</h1>
            <p className="text-sm text-bocra-slate/50 mt-1">{active.desc}</p>
          </div>
        </div>

        {active.items.length > 3 && (
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
            <input type="search" placeholder={tn ? 'Batla dipotso...' : 'Search questions...'} value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none" />
          </div>
        )}

        <p className="text-xs text-bocra-slate/40 mb-4">{filteredItems.length} {tn ? 'dipotso' : 'questions'}</p>

        <div className="space-y-2">
          {filteredItems.map((item, j) => (
            <FAQItem key={`${active.id}-${j}`} item={item} isOpen={openItems.has(`${active.id}-${j}`)} toggle={() => toggle(`${active.id}-${j}`)} color={active.color} />
          ))}
        </div>

        <div className="mt-8 p-5 bg-bocra-off-white rounded-xl text-center">
          <p className="text-sm text-bocra-slate/40 mb-3">{tn ? 'Ga o bone karabo ya gago?' : "Can't find your answer?"}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white text-xs font-medium rounded-xl hover:bg-[#003366] transition-all">
            <Mail size={14} /> {tn ? 'Ikgolaganye le Rona' : 'Contact Us'}
          </Link>
        </div>
      </div></section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
