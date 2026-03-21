/**
 * LicensingFrameworkPage.jsx — BOCRA Licensing Framework
 * Route: /mandate/licensing
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Award, FileText, Shield, Wifi, Radio, Tv, Mail, Globe, CheckCircle, ArrowRight, Building } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const getCATEGORIES = (tn) => [
  { title: tn ? 'Motlamedi wa Mafaratlhatlha a Neteweke (NFP)' : 'Network Facilities Provider (NFP)', desc: tn ? 'Ba ba nang le dilaesense ba rua, ba laola kgotsa ba fana ka mofuta ope wa mafaratlhatlha a a dirisiwang go isa ditirelo, ditiriso le diteng.' : 'Licensees own, operate or provide any form of physical infrastructure used principally for carrying services, applications and content.', color: '#00A6CE', icon: Wifi, examples: tn ? 'Dineteweke tsa fibre, ditora tsa wireless, mafaratlhatlha a satellite' : 'Fibre networks, wireless towers, satellite infrastructure' },
  { title: tn ? 'Motlamedi wa Tiriso ya Ditirelo (SAP)' : 'Service Application Provider (SAP)', desc: tn ? 'Ba ba nang le dilaesense ba fana ka ditirelo tsa megala go badirisi ba bofelo ba dirisa mafaratlhatlha a neteweke a a fanwang ke ba ba nang le dilaesense tsa NFP.' : 'Licensees provide telecommunications services to end users using network facilities provided by NFP licensees.', color: '#C8237B', icon: Globe, examples: tn ? 'Di-ISP, batlamedi ba VoIP, balaodi ba mogala' : 'ISPs, VoIP providers, mobile operators' },
  { title: tn ? 'Motlamedi wa Tirelo ya Diteng (CSP)' : 'Content Service Provider (CSP)', desc: tn ? 'Ba ba nang le dilaesense ba fana ka diteng tsa phasalatso fela (TV le radio) le ditirelo tse dingwe tsa tshedimosetso go akaretsa TV ya Samasetšhene.' : 'Licensees provide content material solely for broadcasting (TV and radio) and other information services including Subscription TV.', color: '#F7B731', icon: Tv, examples: tn ? 'Ditešene tsa TV, ditešene tsa radio, ditirelo tsa streaming' : 'TV stations, radio stations, streaming services' },
  { title: tn ? 'Neteweke ya Megala ya Poraefete (PTNL)' : 'Private Telecommunications Network (PTNL)', desc: tn ? 'Mekgatlho e e laolang dineteweke tsa megala tsa poraefete tsa tiriso ya ka fa gare.' : 'Organisations operating private telecommunications networks for internal use.', color: '#6BBE4E', icon: Building, examples: tn ? 'Dineteweke tsa dikompone, ditiro tsa meepo, ditheo tsa puso' : 'Corporate networks, mining operations, government agencies' },
  { title: tn ? 'Molaodi wa Poso ya Kgwebo' : 'Commercial Postal Operator', desc: tn ? 'Batlhagisi ba ditirelo tsa go romela ka bonako le tsa poso e e okeditsweng boleng ba ba tlhokang laesense go tswa go BOCRA.' : 'Courier and value-added postal services providers requiring a licence from BOCRA.', color: '#00458B', icon: Mail, examples: tn ? 'Baromelanyana ba ka bonako, go romela diphasele, dikompone tsa logistiki' : 'Express couriers, parcel delivery, logistics companies' },
  { title: tn ? 'Dikgolagano tsa Radio' : 'Radio Communications', desc: tn ? 'Dilaesense tse di farologaneng tsa frikwensi ya radio go akaretsa radio ya amateur, radio ya difofane, mogala wa lefatshe, wa lewatle, le radio ya kgwebo.' : 'Various radio frequency licences including amateur radio, aircraft radio, land mobile, maritime, and commercial radio.', color: '#C8237B', icon: Radio, examples: tn ? 'Radio ya amateur, difofane, lewatle, di-radio tsa tsela tse pedi' : 'Amateur radio, aviation, maritime, two-way radios' },
];

export default function LicensingFrameworkPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const CATEGORIES = getCATEGORIES(tn);
  const cardsRef = useStaggerReveal({ stagger: 0.08 });
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><span className="text-bocra-slate/50">{tn ? 'Tiragatso' : 'Mandate'}</span><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{tn ? 'Dilaesense' : 'Licensing'}</span></nav></div></div>
      <PageHero category="MANDATE" categoryTn="TIRAGATSO" title="Licensing Framework" titleTn="Thulaganyo ya Dilaesense" description="BOCRA is mandated to process applications for and issue licences across telecommunications, broadcasting, radio communications, internet, and postal services." descriptionTn="BOCRA e laetswe go sekaseka dikopo tsa le go ntsha dilaesense mo megala, phasalatso, dikgolagano tsa radio, inthanete, le ditirelo tsa poso." color="green" />

      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-bocra-slate mb-3">{tn ? 'Tiragatso ya Dilaesense' : 'Licensing Mandate'}</h2>
                <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                  <p>{tn ? 'BOCRA e laetswe ke Karolo 6(h) ya Molao wa CRA go sekaseka dikopo tsa le go ntsha dilaesense, ditumelelo, dikonseshene le bothati ba mafapha a a laolwang e leng megala, Inthanete, dikgolagano tsa radio, phasalatso le poso.' : 'BOCRA is mandated by Section 6(h) of the CRA Act to process applications for and issue licences, permits, permissions, concessions and authorities for regulated sectors being telecommunications, Internet, radio communications, broadcasting and postal.'}</p>
                  <p>{tn ? 'Thulaganyo ya dilaesense e netefatsa gore batlamedi botlhe ba ditirelo tsa dikgolagano ba bereka ka fa gare ga tikologo e e laolwang e e rotloetsang kgaisano, e sireletsa badirisi, le go netefatsa tiriso e e nang le bokgoni ya metswedi e e aroganwang jaaka sepeketeramo sa frikwensi ya radio.' : 'The licensing framework ensures that all communications service providers operate within a regulated environment that promotes competition, protects consumers, and ensures efficient use of shared resources such as radio frequency spectrum.'}</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4">{tn ? 'Mekgwa e Megolo ya Dilaesense' : 'Major Licensing Categories'}</h3>
                <div ref={cardsRef} className="space-y-3">
                  {CATEGORIES.map(cat => (
                    <div key={cat.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                      <div className="flex items-stretch">
                        <div className="w-1.5 flex-shrink-0" style={{ background: cat.color }} />
                        <div className="p-4 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cat.color}12` }}>
                              <cat.icon size={16} style={{ color: cat.color }} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-bocra-slate">{cat.title}</h4>
                              <p className="text-xs text-bocra-slate/60 leading-relaxed mt-1">{cat.desc}</p>
                              <p className="text-[10px] text-bocra-slate/40 mt-1.5 italic">{tn ? 'Mehlala' : 'Examples'}: {cat.examples}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Process */}
              <div className="bg-[#6BBE4E]/5 rounded-xl border border-[#6BBE4E]/10 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{tn ? 'Go Ikopela Jang' : 'How to Apply'}</h3>
                <div className="space-y-2">
                  {(tn ? [
                    'Tlhopha mofuta wa laesense o o tsamaelanang le tirelo kgotsa tiro ya gago',
                    'Tsenya foromo ya kopo go tswa mo tsebeng ya Dilaesense',
                    'Tlatsa foromo ka tshedimosetso yotlhe e e tlhokegang le dikwalo tse di tshegetswang',
                    'Romela kopo kwa BOCRA ka tuelo e e beilweng',
                    'BOCRA e sekaseka le go dira kopo',
                    'Laesense e ntshiwa fa go amogelwa — e le ka fa tlase ga maemo le diphetogo',
                  ] : [
                    'Choose the licence type that matches your service or operation',
                    'Download the application form from the Licensing page',
                    'Complete the form with all required information and supporting documents',
                    'Submit the application to BOCRA with the prescribed fee',
                    'BOCRA reviews and processes the application',
                    'Licence issued upon approval — subject to conditions and renewal',
                  ]).map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#6BBE4E] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-xs text-bocra-slate/60">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Link to="/licensing" className="flex items-center gap-3 p-5 bg-[#6BBE4E] rounded-xl text-white hover:bg-[#5AAE3E] transition-all group">
                <Award size={24} /><div><p className="text-sm font-bold">{tn ? 'Ikopela Laesense' : 'Apply for a Licence'}</p><p className="text-[10px] text-white/60">{tn ? 'Tsenya diforomo le go romela dikopo' : 'Download forms and submit applications'}</p></div><ArrowRight size={16} className="ml-auto" />
              </Link>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Ditsebe Tse di Amanang' : 'Related Pages'}</h3>
                <div className="space-y-2">
                  {[
                    { label: tn ? 'Thulaganyo ya Dilaesense tsa ICT' : 'ICT Licensing Framework', path: '/documents/ict-licensing', color: '#00A6CE' },
                    { label: tn ? 'Megala' : 'Telecommunications', path: '/mandate/telecommunications', color: '#00A6CE' },
                    { label: tn ? 'Phasalatso' : 'Broadcasting', path: '/mandate/broadcasting', color: '#C8237B' },
                    { label: tn ? 'Ditirelo tsa Poso' : 'Postal Services', path: '/mandate/postal', color: '#F7B731' },
                    { label: tn ? 'Netefatso ya Laesense' : 'Licence Verification', path: '/services/licence-verification', color: '#6BBE4E' },
                    { label: tn ? 'Melao e e Laolang' : 'Governing Legislation', path: '/mandate/legislation', color: '#00458B' },
                  ].map(link => (
                    <Link key={link.path} to={link.path} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-all group">
                      <div className="w-2 h-2 rounded-full" style={{ background: link.color }} />
                      <span className="text-xs font-medium text-bocra-slate/70 group-hover:text-bocra-slate">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">{tn ? 'Dipotso tsa Dilaesense' : 'Licensing Enquiries'}</p>
                <a href="mailto:info@bocra.org.bw" className="text-xs text-[#00458B] hover:underline">info@bocra.org.bw</a>
                <br />
                <a href="tel:+2673957755" className="text-xs text-[#00458B] hover:underline">+267 395 7755</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
