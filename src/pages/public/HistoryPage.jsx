/**
 * History of Communication Regulation — Interactive Timeline
 * Data sourced from https://www.bocra.org.bw/history-communication-regulation
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';

import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
const getTimeline = (lang) => [
  {
    year: '1997',
    title: lang === 'tn' ? 'BTA e Tlhomilwe' : 'BTA Established',
    events: [
      lang === 'tn' ? 'Botswana Telecommunications Authority (BTA) e tlhomilwe ka Molao wa Telecommunications Act, 1996' : 'Botswana Telecommunications Authority (BTA) created under the Telecommunications Act, 1996',
      lang === 'tn' ? 'BTA e simolola go laola lefapha la megala' : 'BTA begins regulating telecommunications sector',
    ],
  },
  {
    year: '1998-1999',
    title: lang === 'tn' ? 'Dilaesense tsa Mogala le Inthanete' : 'Mobile & Internet Licences',
    events: [
      lang === 'tn' ? 'Dilaesense tsa balaodi ba mogala di abetsweng Mascom Wireless le Vista Cellular (jaanong e le Orange Botswana)' : 'Mobile operator licences awarded to Mascom Wireless and Vista Cellular (now Orange Botswana)',
      'BTA awarded the first Internet Service Providers\u2019 (ISPs) licences',
    ],
  },
  {
    year: '2001',
    title: lang === 'tn' ? 'Dinomoro le Sepeketeramo' : 'Numbering & Spectrum',
    events: [
      lang === 'tn' ? 'Go diriwa thulaganyo e ntšhwa ya dinomoro tsa disitšhite di supa tsa Botswana' : 'Implementation of the new seven-digit numbering plan for Botswana',
      lang === 'tn' ? 'Pholisi ya dinomoro e tlhomilwe' : 'Numbering policy established',
    ],
  },
  {
    year: '2003',
    title: lang === 'tn' ? 'Thulaganyo ya Kgolagano ya Dineteweke' : 'Interconnection Framework',
    events: [
      'BTC was granted a fifteen (15) year operating licence',
      'BOCRA issued Interconnection Guidelines',
      'First interconnection ruling between BTC, Mascom Wireless and Orange Botswana',
    ],
  },
  {
    year: '2004-2006',
    title: lang === 'tn' ? 'Dipatlisiso tsa Mmaraka le VoIP' : 'Market Studies & VoIP',
    events: [
      'Study on the Pricing of Telecommunications Services in Botswana',
      'Market study leading to VoIP liberalisation',
      'Ministerial directive on VoIP issued in 2006',
      'BOCRA issued two rulings directing BTC to provide leased line capacity to ISPs',
    ],
  },
  {
    year: '2007',
    title: lang === 'tn' ? 'Dilaesense tse di sa Kgetheng Tirelo' : 'Service-Neutral Licensing',
    events: [
      'Introduction of service-neutral licensing regime',
      'BTC launches beMOBILE service under new framework',
      'Hosting of the Telecommunications Regulators Association of Southern Africa (TRASA) Programme office',
    ],
  },
  {
    year: '2008',
    title: lang === 'tn' ? 'Kamogelo ya ITU' : 'ITU Recognition',
    events: [
      'The International Telecommunication Union (ITU) conducted a study on BOCRA and declared it a best practice model for regulators and policy-makers to emulate',
      'ITU Secretary General Mr. Yoshio Utsumi officially opened the BOCRA Office',
    ],
  },
  {
    year: '2009',
    title: lang === 'tn' ? 'Tiriso ya Lefatshe le Ofisi ya Bone' : 'National Roaming & Own Office',
    events: [
      'National Roaming was suspended',
      'BOCRA moved into its own building (the current office at Plot 50671 Independence Avenue)',
    ],
  },
  {
    year: '2012',
    title: lang === 'tn' ? 'Molao wa CRA o Dirilwe' : 'CRA Act Enacted',
    events: [
      'Communications Regulatory Authority Act 2012 (CRA Act) enacted by Parliament',
      'Created legal framework for converged regulator covering telecoms, broadcasting, postal, and internet',
      'Replaced the Broadcasting Act [Cap 72:04] and the Telecommunications Act [Cap 72:03]',
      '.bw domain registry operations established in December 2012',
    ],
  },
  {
    year: '2013',
    title: lang === 'tn' ? 'BOCRA e Tlhomilwe' : 'BOCRA Established',
    highlight: true,
    events: [
      lang === 'tn' ? 'Botswana Communications Regulatory Authority (BOCRA) e tlhomilwe ka semmuso ka la 1 Moranang 2013' : 'Botswana Communications Regulatory Authority (BOCRA) officially established on 1 April 2013',
      lang === 'tn' ? 'E tsentse BTA le National Broadcasting Board (NBB) legato' : 'Replaced the Botswana Telecommunications Authority (BTA) and National Broadcasting Board (NBB)',
      lang === 'tn' ? 'Kgaogano ya BTC go nna BTCL (thekiso) le BoFiNet (mafaratlhatlha)' : 'Structural unbundling of BTC into BTCL (retail) and BoFiNet (wholesale infrastructure)',
      lang === 'tn' ? 'Taolo e e kopanetsweng ya megala, phasalatso, poso, le ditirelo tsa inthanete' : 'Unified oversight of telecommunications, broadcasting, postal, and internet services',
    ],
  },
  {
    year: '2014',
    title: lang === 'tn' ? 'Melao ya Dijithale' : 'Digital Legislation',
    events: [
      'Electronic Records (Evidence) Act No. 13 of 2014 enacted',
      'Electronic Communications and Transactions Act, 2014 enacted',
      'BOCRA\u2019s regulatory scope expanded into digital economy',
    ],
  },
  {
    year: '2015',
    title: lang === 'tn' ? 'Tshekatsheko ya Thulaganyo ya Dilaesense' : 'Licensing Framework Review',
    events: [
      'Comprehensive review of ICT licensing framework and pricing principles',
      'Introduction of NFP, SAP, CSP licensing categories',
      'Postal sector licensing framework developed (DPO and CPO categories)',
      'Framework objective: Efficiency of Convergence for Next Generation Networks',
    ],
  },
  {
    year: '2024',
    title: lang === 'tn' ? 'Tshireletso ya Data' : 'Data Protection',
    events: [
      lang === 'tn' ? 'Molao wa Tshireletso ya Data wa Botswana, 2024 (BDPA) o dirilwe' : 'Botswana Data Protection Act, 2024 (BDPA) enacted',
      lang === 'tn' ? 'Leano la BOCRA la 2024-2029 le phatlhaladitswe ka tirisanommogo jaaka maikaelelo a botlhokwa' : 'BOCRA Strategic Plan 2024-2029 published with collaboration as key objective',
    ],
  },
  {
    year: '2025',
    title: lang === 'tn' ? 'Thulaganyo ya Seša' : 'Modern Framework',
    events: [
      lang === 'tn' ? 'Molao wa Ditirelo tsa Dijithale, 2025 o dirilwe' : 'Digital Services Act, 2025 enacted',
      lang === 'tn' ? 'Molao wa Tshireletso ya Saebo, 2025 o dirilwe' : 'Cybersecurity Act, 2025 enacted',
      lang === 'tn' ? 'Thulaganyo e e feletseng ya go laola ditirelo tsa dijithale le tshireletso ya setšhaba ya saebo' : 'Comprehensive framework for regulating digital services and national cybersecurity',
    ],
  },
];

export default function HistoryPage() {
  const { lang } = useLanguage();
  const TIMELINE = getTimeline(lang);
  const heroRef = useScrollReveal();
  const timelineRef = useStaggerReveal({ stagger: 0.08 });

  return (
    <div>
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <Link to="/about/profile" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Ka ga Rona' : 'About'}</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Histori' : 'History'}</span>
          </nav>
        </div>
      </div>
      {/* Hero */}
      <PageHero category="ABOUT" categoryTn="KA GA RONA" title="History of Communication Regulation" titleTn="Histori ya Taolo ya Dikgolagano" description="From the Botswana Telecommunications Authority to BOCRA — tracing the evolution of communications regulation in Botswana." descriptionTn="Go tswa BTA go ya BOCRA — go sala morago tlhabololo ya taolo ya dikgolagano mo Botswana." color="cyan" />


      {/* Interactive Timeline */}
      <section className="py-8 md:py-12 bg-white">
        <div className="section-wrapper">
          <div ref={timelineRef} className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] md:left-[27px] top-0 bottom-0 w-[2px] bg-gray-200" />

            {TIMELINE.map((item, i) => (
              <TimelineItem key={item.year} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-bocra-blue-dark">
        <div className="section-wrapper max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">{lang === 'tn' ? 'Ithute go feta ka BOCRA' : 'Learn more about BOCRA'}</h3>
            <p className="text-white/50 text-sm mt-1">{lang === 'tn' ? 'Sekaseka botsamaisi, thulaganyo, le tiragatso ya rona' : 'Explore our leadership, structure, and mandate'}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/about/profile" className="px-5 py-2.5 bg-white text-bocra-blue font-bold text-sm rounded-xl hover:bg-gray-100 transition-all">
              About BOCRA
            </Link>
            <Link to="/about/board" className="px-5 py-2.5 border-2 border-white/30 text-white font-semibold text-sm rounded-xl hover:bg-white/10 transition-all">
              Board of Directors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineItem({ item, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative pl-14 md:pl-16 pb-8 group">
      {/* Dot on the timeline */}
      <div className={`absolute left-[14px] md:left-[18px] top-1 w-[20px] h-[20px] rounded-full border-[3px] transition-all duration-300 ${
        item.highlight
          ? 'bg-bocra-blue border-bocra-cyan scale-110'
          : open
            ? 'bg-bocra-cyan border-bocra-cyan'
            : 'bg-white border-gray-300 group-hover:border-bocra-cyan'
      }`} />

      {/* Card */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left rounded-2xl border-2 transition-all duration-300 ${
          item.highlight
            ? 'bg-bocra-blue/5 border-bocra-blue/20 hover:border-bocra-blue/40'
            : open
              ? 'bg-blue-50/50 border-bocra-cyan/30'
              : 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-white hover:shadow-lg'
        } p-5 md:p-6`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={`text-sm font-extrabold px-3 py-1 rounded-lg ${
              item.highlight ? 'bg-bocra-blue text-white' : 'bg-bocra-cyan/10 text-bocra-cyan'
            }`}>
              {item.year}
            </span>
            <h3 className={`font-bold text-lg ${item.highlight ? 'text-bocra-blue' : 'text-bocra-slate'}`}>
              {item.title}
            </h3>
          </div>
          <ChevronDown size={18} className={`text-bocra-slate/30 transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </div>

        {/* Expandable events */}
        <div className={`overflow-hidden transition-all duration-400 ${open ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
          <ul className="space-y-2">
            {item.events.map((event, j) => (
              <li key={j} className="flex items-start gap-3 text-sm text-bocra-slate/70">
                <span className="w-1.5 h-1.5 rounded-full bg-bocra-cyan mt-2 flex-shrink-0" />
                {event}
              </li>
            ))}
          </ul>
        </div>
      </button>
    </div>
  );
}
