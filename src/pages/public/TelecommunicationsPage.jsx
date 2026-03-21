/**
 * TelecommunicationsPage.jsx — BOCRA Telecommunications Mandate
 * Route: /mandate/telecommunications
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Wifi, Phone, Globe, Users, Shield, Award, Signal, BarChart3, ArrowRight, CheckCircle, Building } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const getOPERATORS = (lang) => {
  const tn = lang === 'tn';
  return [
    { name: 'Mascom Wireless', type: tn ? 'Molaodi wa Neteweke ya Mogala' : 'Mobile Network Operator', color: '#E21836', services: tn ? 'Lentswe la mogala, data, madi a mogala (MyZaka), SMS, roaming' : 'Mobile voice, data, mobile money (MyZaka), SMS, roaming', coverage: tn ? 'Naga yotlhe — phitlhelelo ya ditoropo le magae' : 'Nationwide — urban and rural coverage', market: tn ? 'Molaodi o mogolo wa mogala ka basamosetšene' : 'Largest mobile operator by subscribers' },
    { name: 'Botswana Telecommunications Corporation (BTC)', type: tn ? 'Molaodi wa Mogala o o Tsepameng le wa Mogala' : 'Fixed & Mobile Operator', color: '#0066CC', services: tn ? 'Mogala o o tsepameng, inthanete ya lobelo, mogala (beMOBILE), ditharabololo tsa dikgwebo' : 'Fixed-line, broadband internet, mobile (beMOBILE), enterprise solutions', coverage: tn ? 'Naga yotlhe — phitlhelelo ya mogala o o tsepameng le mogala' : 'Nationwide — fixed-line and mobile coverage', market: tn ? 'Molaodi wa bosetšhaba wa mogala o o tsepameng le inthanete' : 'National fixed-line operator and broadband provider' },
    { name: 'Orange Botswana', type: tn ? 'Molaodi wa Neteweke ya Mogala' : 'Mobile Network Operator', color: '#FF6600', services: tn ? 'Lentswe la mogala, data, Orange Money, SMS, roaming, fibre' : 'Mobile voice, data, Orange Money, SMS, roaming, fibre', coverage: tn ? 'Naga yotlhe — mafelo a ditoropo le a a gaufi le ditoropo' : 'Nationwide — urban and peri-urban areas', market: tn ? 'Molaodi wa boraro wa mogala ka bogolo' : 'Third largest mobile operator' },
    { name: 'BoFiNet', type: tn ? 'Motlamedi wa Mafaratlhatlha a Thekiso ka Bontsi' : 'Wholesale Infrastructure Provider', color: '#00458B', services: tn ? 'Mafaratlhatlha a bosetšhaba a fibre optic, inthanete ya thekiso ka bontsi, phitlhelelo ya EASSy' : 'National fibre optic backbone, wholesale broadband, EASSy submarine cable access', coverage: tn ? 'Neteweke ya bosetšhaba ya mafaratlhatlha' : 'National backbone network', market: tn ? 'Thekiso ka bontsi fela — e fana ka mafaratlhatlha go balaodi ba thekiso' : 'Wholesale-only — provides infrastructure to retail operators' },
  ];
};

const getLICENCE_TYPES = (lang) => [
  { title: lang === 'tn' ? 'Motlamedi wa Mafaratlhatlha a Neteweke (NFP)' : 'Network Facilities Provider (NFP)', desc: lang === 'tn' ? 'Rua, laola kgotsa fana ka mafaratlhatlha a a dirisiwang go isa ditirelo, ditiriso le diteng.' : 'Own, operate or provide physical infrastructure used principally for carrying services, applications and content.', color: '#00A6CE' },
  { title: lang === 'tn' ? 'Motlamedi wa Tiriso ya Ditirelo (SAP)' : 'Service Application Provider (SAP)', desc: lang === 'tn' ? 'Fana ka ditirelo tsa megala go badirisi ba bofelo ba dirisa mafaratlhatlha a neteweke a a fanwang ke ba ba nang le dilaesense tsa NFP.' : 'Provide telecommunications services to end users using network facilities provided by NFP licensees.', color: '#C8237B' },
  { title: lang === 'tn' ? 'Motlamedi wa Tirelo ya Diteng (CSP)' : 'Content Service Provider (CSP)', desc: lang === 'tn' ? 'Fana ka diteng tsa phasalatso fela (TV le radio) le ditirelo tse dingwe tsa tshedimosetso.' : 'Provide content material solely for broadcasting (TV and radio) and other information services including Subscription TV.', color: '#F7B731' },
  { title: lang === 'tn' ? 'Ditirelo tsa Neteweke tse di Okeditsweng Boleng (VANS)' : 'Value Added Network Services (VANS)', desc: lang === 'tn' ? 'Ditirelo tse di ntshitsweng go akaretsa VoIP, ditirelo tsa inthanete, le ditiriso tse di okeditsweng boleng.' : 'Liberalised services including VoIP, internet services, and value-added applications.', color: '#6BBE4E' },
];

export default function TelecommunicationsPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const LICENCE_TYPES = getLICENCE_TYPES(lang);
  const OPERATORS = getOPERATORS(lang);
  const cardsRef = useStaggerReveal({ stagger: 0.1 });
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><span className="text-bocra-slate/50">{tn ? 'Tiragatso' : 'Mandate'}</span><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{tn ? 'Megala le Tlhaeletsano' : 'Telecommunications'}</span></nav></div></div>
      <PageHero category="MANDATE" categoryTn="TIRAGATSO" title="Telecommunications" titleTn="Megala le Tlhaeletsano" description="Regulating mobile, fixed-line, internet, and VoIP services in Botswana — promoting competition, innovation, consumer protection and universal access." descriptionTn="Go laola ditirelo tsa megala, inthanete, le VoIP mo Botswana — go rotloetsa kgaisano, boitlhamedi, tshireletso ya badirisi le phitlhelelo ya botlhe." color="cyan" />

      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-bocra-slate mb-3">{tn ? 'Taolo ya Megala' : 'Telecommunications Regulation'}</h2>
                <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                  <p>{tn ? 'Lefapha la megala mo Botswana le fetogile thata fa e sa le Pholisi ya Megala ya 1995, e e buileng mmaraka go kgaisano. BOCRA e laola Balaodi ba Bararo ba Megala ba Botlhokwa (PTOs): Botswana Telecommunications Corporation (BTC), Mascom Wireless, le Orange Botswana.' : 'The telecommunications sector in Botswana has undergone significant transformation since the 1995 Telecommunications Policy, which opened the market to competition. BOCRA regulates three Primary Telecommunications Operators (PTOs): Botswana Telecommunications Corporation (BTC), Mascom Wireless, and Orange Botswana.'}</p>
                  <p>{tn ? 'Go tloga ka 1998, BOCRA e diragaditse diphetogo tsa mmaraka go akaretsa go tlhagisa Dilaesense tsa Neteweke ya Megala ya Poraefete (PTNL), ditaelo tsa kgokagano, le melao ya dituelo go netefatsa kgaisano e e siameng le ditirelo tse di sa tureng mo Batswana botlhe.' : 'Since 1998, BOCRA has implemented progressive market reforms including the introduction of Private Telecommunications Network Licences (PTNL), interconnection guidelines, and tariff regulations to ensure fair competition and affordable services for all Batswana.'}</p>
                </div>
              </div>

              {/* Operators */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2"><Signal size={18} className="text-[#00A6CE]" /> {tn ? 'Balaodi ba ba nang le Dilaesense' : 'Licensed Operators'}</h3>
                <div ref={cardsRef} className="space-y-3">
                  {OPERATORS.map(op => (
                    <div key={op.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                      <div className="flex items-stretch">
                        <div className="w-1.5 flex-shrink-0" style={{ background: op.color }} />
                        <div className="p-4 flex-1">
                          <h4 className="text-sm font-bold text-bocra-slate">{op.name}</h4>
                          <p className="text-[10px] font-medium mb-2" style={{ color: op.color }}>{op.type}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-bocra-slate/60"><strong className="text-bocra-slate/80">{tn ? 'Ditirelo:' : 'Services:'}</strong> {op.services}</p>
                            <p className="text-xs text-bocra-slate/60"><strong className="text-bocra-slate/80">{tn ? 'Phitlhelelo:' : 'Coverage:'}</strong> {op.coverage}</p>
                            <p className="text-xs text-bocra-slate/50 italic">{op.market}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licensing Framework */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2"><Award size={18} className="text-[#6BBE4E]" /> {tn ? 'Thulaganyo ya Dilaesense' : 'Licensing Framework'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LICENCE_TYPES.map(lt => (
                    <div key={lt.title} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
                      <div className="w-2 h-2 rounded-full mb-2" style={{ background: lt.color }} />
                      <h4 className="text-xs font-bold text-bocra-slate mb-1">{lt.title}</h4>
                      <p className="text-[11px] text-bocra-slate/50 leading-relaxed">{lt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Reforms */}
              <div className="bg-[#00A6CE]/5 rounded-xl border border-[#00A6CE]/10 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{tn ? 'Diphetogo tse di Botlhokwa tsa Mmaraka' : 'Key Market Reforms'}</h3>
                <div className="space-y-2">
                  {(tn ? [
                    'Go ntshiwa ga Ditirelo tsa Neteweke tse di Okeditsweng Boleng (VANS)',
                    'Go letla ditirelo tsa VoIP ka fa tlase ga thulaganyo ya taolo ya ga jaana',
                    'Go tlhagisa Dilaesense tsa Neteweke ya Megala ya Poraefete (PTNL)',
                    'Ditaelo tsa kgokagano bakeng sa phitlhelelo e e siameng ya neteweke',
                    'Melao ya dituelo e e netefatsang ditirelo tse di sa tureng',
                    'Tlhokomelo le tiragatso ya Boleng jwa Tirelo',
                  ] : [
                    'Liberalisation of Value Added Network Services (VANS)',
                    'Permitting VoIP services under the current regulatory framework',
                    'Introduction of Private Telecommunications Network Licences (PTNL)',
                    'Interconnection guidelines for fair network access',
                    'Tariff regulations ensuring affordable services',
                    'Quality of Service monitoring and enforcement',
                  ]).map((r, i) => (
                    <div key={i} className="flex items-start gap-2"><CheckCircle size={13} className="text-[#00A6CE] mt-0.5 flex-shrink-0" /><p className="text-xs text-bocra-slate/60">{r}</p></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Lefapha la Megala' : 'Telecom Sector'}</h3>
                <div className="space-y-3">
                  {[
                    { label: tn ? 'Di-PTO tse di nang le Dilaesense' : 'Licensed PTOs', value: '3', color: '#00A6CE' },
                    { label: tn ? 'Motlamedi wa Mafaratlhatlha' : 'Infrastructure Provider', value: 'BoFiNet', color: '#00458B' },
                    { label: tn ? 'Mekgwa ya Dilaesense' : 'Licence Categories', value: '4', color: '#6BBE4E' },
                    { label: tn ? 'Maemo a Mmaraka' : 'Market Status', value: tn ? 'E Ntshitswe' : 'Liberalised', color: '#C8237B' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}><Signal size={14} style={{ color: s.color }} /></div>
                      <div><p className="text-sm font-bold text-bocra-slate">{s.value}</p><p className="text-[10px] text-gray-400">{s.label}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/licensing" className="flex items-center gap-3 p-4 bg-[#00A6CE] rounded-xl text-white hover:bg-[#008DB0] transition-all group">
                <Award size={20} /><div><p className="text-sm font-bold">{tn ? 'Ikopela Laesense' : 'Apply for a Licence'}</p><p className="text-[10px] text-white/60">{tn ? 'Bona ditlhokego le go tsenya diforomo' : 'View requirements and download forms'}</p></div><ArrowRight size={16} className="ml-auto" />
              </Link>

              <Link to="/services/file-complaint" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <Shield size={18} className="text-[#C8237B]" /><div><p className="text-xs font-bold text-bocra-slate">{tn ? 'Tlhagisa Ngongorego' : 'File a Complaint'}</p><p className="text-[10px] text-gray-400">{tn ? 'Bega mathata a tirelo le molaodi' : 'Report service issues with an operator'}</p></div>
              </Link>

              <Link to="/services/qos-monitoring" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <BarChart3 size={18} className="text-[#F7B731]" /><div><p className="text-xs font-bold text-bocra-slate">{tn ? 'Tlhokomelo ya Boleng jwa Tirelo' : 'QoS Monitoring'}</p><p className="text-[10px] text-gray-400">{tn ? 'Data ya tiragatso ya neteweke ya nako ya jaanong' : 'Real-time network performance data'}</p></div>
              </Link>

              <Link to="/telecom-statistics" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <BarChart3 size={18} className="text-[#6BBE4E]" /><div><p className="text-xs font-bold text-bocra-slate">{tn ? 'Dipalopalo tsa Megala' : 'Telecom Statistics'}</p><p className="text-[10px] text-gray-400">{tn ? 'Data ya mmaraka le dipalo tsa tiragatso' : 'Market data and performance metrics'}</p></div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
