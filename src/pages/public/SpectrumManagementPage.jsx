/**
 * SpectrumManagementPage.jsx — Spectrum Management
 * Route: /services/spectrum
 * 
 * Explains what spectrum management is, links to the ASMS-WebCP portal,
 * and provides info on frequency plans, monitoring, and digital switchover.
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Radio, Wifi, Signal, Globe, Shield, Activity,
  ArrowRight, ExternalLink, FileText, Zap, BarChart3, Tv, Phone,
  CheckCircle, AlertTriangle, Waves
} from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL || '/';

export default function SpectrumManagementPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const cardsRef = useStaggerReveal({ stagger: 0.08 });

  const KEY_FUNCTIONS = tn ? [
    { icon: Radio, title: 'Leano la Frikwensi la Bosetšhaba', desc: 'Go laola kabelo ya frikwensi go tswa 9 kHz go ya 105 GHz go ya ka melawana ya ITU le ditlhokego tsa selegae.', color: '#00A6CE' },
    { icon: Activity, title: 'Tlhokomelo ya Tiriso ya Frikwensi', desc: 'Go ela tlhoko tiriso ya sepeketeramo go netefatsa gore di-frikwensi tse di abetsweng di dirisiwa sentle le go lemoga tshitswako.', color: '#C8237B' },
    { icon: Globe, title: 'Thulaganyo ya Boditšhabatšhaba', desc: 'Go dirisana le dinaga tse di mabapi le go rulaganya tiriso ya frikwensi go ya ka Melawana ya Radio ya ITU.', color: '#6BBE4E' },
    { icon: Zap, title: 'Ditefiso le Maemo a Sepeketeramo', desc: 'Go baya ditlhwatlhwa tsa tiriso ya frikwensi le go netefatsa gore didirisiwa di obamela maemo a setegeniki.', color: '#F7B731' },
    { icon: Shield, title: 'Go Efoga Tshitswako e e Kotsi', desc: 'Go batlisisa le go rarabolola dingongorego tsa tshitswako go sireletsa ditirelo tse di botlhokwa jaaka dikgolagano tsa maemo a tshoganyetso.', color: '#00458B' },
    { icon: BarChart3, title: 'Tsamaiso ya Sepeketeramo ka Itirisanyo', desc: 'ASMS-WebCP e fana ka didirisiwa tsa inthanete tsa go laola dikopo tsa frikwensi, go ntsha dilaesense, le tlhokomelo.', color: '#059669' },
  ] : [
    { icon: Radio, title: 'National Frequency Plan', desc: 'Managing frequency allocations from 9 kHz to 105 GHz in accordance with ITU regulations and local requirements.', color: '#00A6CE' },
    { icon: Activity, title: 'Frequency Occupancy Monitoring', desc: 'Monitoring spectrum usage to ensure allocated frequencies are used efficiently and detecting interference.', color: '#C8237B' },
    { icon: Globe, title: 'International Coordination', desc: 'Coordinating with neighbouring countries on cross-border frequency use under ITU Radio Regulations.', color: '#6BBE4E' },
    { icon: Zap, title: 'Spectrum Tariffs & Standards', desc: 'Setting pricing for frequency usage and ensuring equipment meets technical standards.', color: '#F7B731' },
    { icon: Shield, title: 'Harmful Interference Avoidance', desc: 'Investigating and resolving interference complaints to protect essential services like emergency communications.', color: '#00458B' },
    { icon: BarChart3, title: 'Automated Spectrum Management', desc: 'ASMS-WebCP provides online tools for frequency applications, licence issuance, and monitoring.', color: '#059669' },
  ];

  const BANDS = tn ? [
    { band: 'VHF', range: '30–300 MHz', uses: 'Radio ya FM, thelebišene, radio ya difofane', color: '#00A6CE' },
    { band: 'UHF', range: '300 MHz–3 GHz', uses: 'TV ya dijithale, megala ya 2G/3G/4G, WiFi', color: '#C8237B' },
    { band: 'SHF', range: '3–30 GHz', uses: 'Dilinki tsa microwave, satellite, 5G', color: '#F7B731' },
    { band: 'EHF', range: '30–300 GHz', uses: 'Dipatlisiso, ditirelo tsa satellite tsa lobelo lo logolo', color: '#6BBE4E' },
  ] : [
    { band: 'VHF', range: '30–300 MHz', uses: 'FM radio, television, aviation radio', color: '#00A6CE' },
    { band: 'UHF', range: '300 MHz–3 GHz', uses: 'Digital TV, 2G/3G/4G mobile, WiFi', color: '#C8237B' },
    { band: 'SHF', range: '3–30 GHz', uses: 'Microwave links, satellite, 5G', color: '#F7B731' },
    { band: 'EHF', range: '30–300 GHz', uses: 'Research, high-throughput satellite services', color: '#6BBE4E' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Spectrum Management — BOCRA</title>
        <meta name="description" content="Radio frequency spectrum management, monitoring, and digital switchover in Botswana." />
        <link rel="canonical" href="https://bocra.org.bw/services/spectrum" />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={[{ label: 'Services' }, { label: 'Spectrum Management' }]} />
        </div>
      </div>

      {/* Hero */}
      <PageHero
        category="SERVICES" categoryTn="DITIRELO"
        title="Spectrum Management" titleTn="Tsamaiso ya Sepeketeramo"
        description="BOCRA manages Botswana's radio frequency spectrum — the invisible airwaves that carry your phone calls, internet, TV, and radio. Without careful management, these signals would interfere with each other."
        descriptionTn="BOCRA e laola sepeketeramo sa frikwensi ya radio ya Botswana — maqhubu a mowa a a sa bonweng a a rwelang megala ya gago, inthanete, TV, le radio. Kwa ntle ga tsamaiso e e kelotlhoko, ditshameko tse di ka tshitswanya."
        color="blue"
      />

      {/* What Is Spectrum — Plain language explainer */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-bocra-slate mb-3">
                  {tn ? 'Sepeketeramo ke Eng?' : 'What Is the Radio Spectrum?'}
                </h2>
                <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                  <p>{tn
                    ? 'Sepeketeramo sa frikwensi ya radio ke motswedi wa tlhago — jaaka lefatshe kgotsa metsi — o o dirisiwang ke ditheo tsa megala, phasalatso, difofane, mapodisi, le ditirelo tsa phemelo ya tshoganyetso. Ka ntlha ya gore sepeketeramo se na le tekanyo, se tshwanetse go laotswe go netefatsa gore mongwe le mongwe o fitlhelela karolo ya gagwe kwa ntle ga tshitswako.'
                    : 'The radio frequency spectrum is a natural resource — like land or water — used by telecommunications, broadcasting, aviation, police, and emergency services. Because spectrum is limited, it must be managed to ensure everyone gets their fair share without interference.'
                  }</p>
                  <p>{tn
                    ? 'BOCRA e laola sepeketeramo sa Botswana ka fa tlase ga Leano la Frikwensi la Bosetšhaba, le le akaretsang frikwensi go tswa 9 kHz go ya 105 GHz. Se se raya gore fa o leletsa mogala, o romela SMS, kgotsa o bogela TV, megala ya gago e tsamaya mo frikwensing e e abetsweng e e laotweng ke BOCRA.'
                    : 'BOCRA manages Botswana\'s spectrum under the National Frequency Plan, covering frequencies from 9 kHz to 105 GHz. This means when you make a phone call, send an SMS, or watch TV, your signal travels on a frequency band allocated and managed by BOCRA.'
                  }</p>
                  <p>{tn
                    ? 'Tsamaiso ya Sepeketeramo ka Itirisanyo (ASMS-WebCP) ke potala ya inthanete ya BOCRA e badirisi ba ka ikopelang dilaesense tsa frikwensi, ba latela dikopo, le go fitlhelela merero ya sepeketeramo ka yona.'
                    : 'The Automated Spectrum Management System (ASMS-WebCP) is BOCRA\'s online portal where users can apply for frequency licences, track applications, and access spectrum-related services.'
                  }</p>
                </div>
              </div>

              {/* Frequency Bands */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2">
                  <Waves size={18} className="text-[#00A6CE]" />
                  {tn ? 'Dibente tsa Frikwensi' : 'Frequency Bands'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BANDS.map(b => (
                    <div key={b.band} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${b.color}12` }}>
                          <Signal size={18} style={{ color: b.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-bocra-slate">{b.band}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{b.range}</p>
                        </div>
                      </div>
                      <p className="text-xs text-bocra-slate/60">{b.uses}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* ASMS Portal CTA */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-br from-[#00458B] to-[#001A3A] p-5">
                  <Radio size={28} className="text-[#00A6CE] mb-2" />
                  <h3 className="text-white font-bold text-sm">{tn ? 'Potala ya Tsamaiso ya Sepeketeramo' : 'Spectrum Management Portal'}</h3>
                  <p className="text-white/50 text-xs mt-1">{tn ? 'ASMS-WebCP — Ikopele dilaesense tsa frikwensi' : 'ASMS-WebCP — Apply for frequency licences'}</p>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-bocra-slate/60 leading-relaxed">
                    {tn ? 'Dirisa potala ya ASMS-WebCP go ikopela dilaesense tsa frikwensi, go latela dikopo tsa gago, le go fitlhelela ditirelo tsa sepeketeramo.' : 'Use the ASMS-WebCP portal to apply for frequency licences, track your applications, and access spectrum services.'}
                  </p>
                  <Link to="/services/asms-webcp"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#00458B] text-white text-xs font-medium rounded-lg hover:bg-[#003366] transition-all">
                    <Radio size={14} /> {tn ? 'Bula Potala ya ASMS' : 'Open ASMS Portal'} <ArrowRight size={12} />
                  </Link>
                  <a href="https://op-web.bocra.org.bw/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-200 text-bocra-slate text-xs font-medium rounded-lg hover:bg-gray-50 transition-all">
                    <ExternalLink size={14} /> {tn ? 'Etela Saete ya ASMS-WebCP' : 'Visit ASMS-WebCP Site'} <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Dintlha tse di Bonako' : 'Quick Facts'}</h3>
                <div className="space-y-3">
                  {[
                    { label: tn ? 'Phitlhelelo ya Frikwensi' : 'Frequency Coverage', value: '9 kHz – 105 GHz', icon: Signal, color: '#00A6CE' },
                    { label: tn ? 'Kgaolo ya ITU' : 'ITU Region', value: tn ? 'Kgaolo 1' : 'Region 1', icon: Globe, color: '#6BBE4E' },
                    { label: tn ? 'Tsamaiso' : 'System', value: 'ASMS-WebCP', icon: BarChart3, color: '#C8237B' },
                    { label: tn ? 'Molao o o Laolang' : 'Governing Law', value: 'CRA Act 2012', icon: FileText, color: '#F7B731' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}>
                        <s.icon size={14} style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-bocra-slate">{s.value}</p>
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Ditsebe Tse di Amanang' : 'Related Pages'}</h3>
                <div className="space-y-2">
                  {[
                    { label: tn ? 'Potala ya Molaodi' : 'Operator Portal', path: '/services/asms-webcp', color: '#00A6CE' },
                    { label: tn ? 'Dilaesense' : 'Licensing', path: '/licensing', color: '#6BBE4E' },
                    { label: tn ? 'Tumelelo ya Mofuta' : 'Type Approval', path: '/services/type-approval', color: '#F7B731' },
                    { label: tn ? 'Megala' : 'Telecommunications', path: '/mandate/telecommunications', color: '#C8237B' },
                  ].map(link => (
                    <Link key={link.path} to={link.path} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-all group">
                      <div className="w-2 h-2 rounded-full" style={{ background: link.color }} />
                      <span className="text-xs font-medium text-bocra-slate/70 group-hover:text-bocra-slate">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">{tn ? 'Lefapha la Sepeketeramo' : 'Spectrum Division'}</p>
                <a href="mailto:spectrum@bocra.org.bw" className="text-xs text-[#00458B] hover:underline">spectrum@bocra.org.bw</a>
                <br />
                <a href="tel:+2673957755" className="text-xs text-[#00458B] hover:underline">+267 395 7755</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Functions */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{tn ? 'Ditiro tse Dikgolo tsa BOCRA' : 'BOCRA\'s Key Functions'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">{tn ? 'Ka fa BOCRA e sireletsang le go laola sepeketeramo sa Botswana' : 'How BOCRA protects and manages Botswana\'s spectrum'}</p>
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KEY_FUNCTIONS.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${f.color}12` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-bold text-bocra-slate mb-1">{f.title}</h3>
                <p className="text-xs text-bocra-slate/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Switchover */}
      <section className="py-8">
        <div className="section-wrapper max-w-5xl">
          <div className="bg-gradient-to-br from-[#00458B] to-[#001A3A] rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Tv size={24} className="text-[#00A6CE]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{tn ? 'Phetogo ya go Tswa Analogue go ya Dijithale' : 'Digital Switchover'}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  {tn
                    ? 'Go ya ka Khonferense ya Kgaolo ya Dikgolagano tsa Radio ya ITU ya 2006 (RRC-06), Botswana e fetogela go tswa phasalatsong ya analogue go ya dijithale. Phetogo e e golola sepeketeramo se se botlhokwa bakeng sa inthanete ya lobelo ya mogala mme e kgontsha ditirelo tsa thelebišene tse di boleng jo bo kwa godimo go Batswana botlhe.'
                    : 'In line with the ITU Regional Radiocommunication Conference 2006 (RRC-06), Botswana is migrating from analogue to digital broadcasting. This transition frees up valuable spectrum for mobile broadband and enables higher quality television services for all Batswana.'
                  }
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <CheckCircle size={14} className="text-[#6BBE4E]" />
                    <span className="text-xs text-white/80">{tn ? 'Thelebišene ya boleng jo bo kwa godimo' : 'Higher quality TV'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <CheckCircle size={14} className="text-[#6BBE4E]" />
                    <span className="text-xs text-white/80">{tn ? 'Sepeketeramo se se oketsegileng bakeng sa 4G/5G' : 'More spectrum for 4G/5G'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <CheckCircle size={14} className="text-[#6BBE4E]" />
                    <span className="text-xs text-white/80">{tn ? 'Dikanale tse dintsi tsa TV' : 'More TV channels'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-3xl text-center">
          <h2 className="text-xl font-bold text-bocra-slate mb-3">{tn ? 'O Tlhoka Laesense ya Frikwensi?' : 'Need a Frequency Licence?'}</h2>
          <p className="text-sm text-bocra-slate/50 mb-6">{tn ? 'Dirisa potala ya ASMS-WebCP go ikopela dilaesense tsa sepeketeramo kgotsa o etele ofisi ya BOCRA kwa Gaborone.' : 'Use the ASMS-WebCP portal to apply for spectrum licences online, or visit the BOCRA office in Gaborone.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/services/asms-webcp"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
              <Radio size={16} /> {tn ? 'Bula Potala ya ASMS' : 'Open ASMS Portal'} <ArrowRight size={14} />
            </Link>
            <Link to="/licensing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-bocra-slate text-sm font-medium rounded-xl hover:bg-white transition-all">
              <FileText size={16} /> {tn ? 'Bona Dilaesense Tsotlhe' : 'View All Licences'}
            </Link>
          </div>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
