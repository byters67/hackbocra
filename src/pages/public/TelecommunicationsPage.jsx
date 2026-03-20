/**
 * TelecommunicationsPage.jsx — BOCRA Telecommunications Mandate
 * Route: /mandate/telecommunications
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Wifi, Phone, Globe, Users, Shield, Award, Signal, BarChart3, ArrowRight, CheckCircle, Building } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const OPERATORS = [
  { name: 'Mascom Wireless', type: 'Mobile Network Operator', color: '#E21836', services: 'Mobile voice, data, mobile money (MyZaka), SMS, roaming', coverage: 'Nationwide — urban and rural coverage', market: 'Largest mobile operator by subscribers' },
  { name: 'Botswana Telecommunications Corporation (BTC)', type: 'Fixed & Mobile Operator', color: '#0066CC', services: 'Fixed-line, broadband internet, mobile (beMOBILE), enterprise solutions', coverage: 'Nationwide — fixed-line and mobile coverage', market: 'National fixed-line operator and broadband provider' },
  { name: 'Orange Botswana', type: 'Mobile Network Operator', color: '#FF6600', services: 'Mobile voice, data, Orange Money, SMS, roaming, fibre', coverage: 'Nationwide — urban and peri-urban areas', market: 'Third largest mobile operator' },
  { name: 'BoFiNet', type: 'Wholesale Infrastructure Provider', color: '#00458B', services: 'National fibre optic backbone, wholesale broadband, EASSy submarine cable access', coverage: 'National backbone network', market: 'Wholesale-only — provides infrastructure to retail operators' },
];

const LICENCE_TYPES = [
  { title: 'Network Facilities Provider (NFP)', desc: 'Own, operate or provide physical infrastructure used principally for carrying services, applications and content.', color: '#00A6CE' },
  { title: 'Service Application Provider (SAP)', desc: 'Provide telecommunications services to end users using network facilities provided by NFP licensees.', color: '#C8237B' },
  { title: 'Content Service Provider (CSP)', desc: 'Provide content material solely for broadcasting (TV and radio) and other information services including Subscription TV.', color: '#F7B731' },
  { title: 'Value Added Network Services (VANS)', desc: 'Liberalised services including VoIP, internet services, and value-added applications.', color: '#6BBE4E' },
];

export default function TelecommunicationsPage() {
  const { lang } = useLanguage();
  const cardsRef = useStaggerReveal({ stagger: 0.1 });
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">Home</Link><ChevronRight size={14} /><span className="text-bocra-slate/50">Mandate</span><ChevronRight size={14} /><span className="text-bocra-slate font-medium">Telecommunications</span></nav></div></div>
      <PageHero category="MANDATE" categoryTn="TIRAGATSO" title="Telecommunications" titleTn="Megala le Tlhaeletsano" description="Regulating mobile, fixed-line, internet, and VoIP services in Botswana — promoting competition, innovation, consumer protection and universal access." descriptionTn="Go laola ditirelo tsa megala, inthanete, le VoIP mo Botswana — go rotloetsa kgaisano, boitlhamedi, tshireletso ya badirisi le phitlhelelo ya botlhe." color="cyan" />

      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Taolo ya Megala' : 'Telecommunications Regulation'}</h2>
                <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                  <p>The telecommunications sector in Botswana has undergone significant transformation since the 1995 Telecommunications Policy, which opened the market to competition. BOCRA regulates three Primary Telecommunications Operators (PTOs): Botswana Telecommunications Corporation (BTC), Mascom Wireless, and Orange Botswana.</p>
                  <p>Since 1998, BOCRA has implemented progressive market reforms including the introduction of Private Telecommunications Network Licences (PTNL), interconnection guidelines, and tariff regulations to ensure fair competition and affordable services for all Batswana.</p>
                </div>
              </div>

              {/* Operators */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2"><Signal size={18} className="text-[#00A6CE]" /> Licensed Operators</h3>
                <div ref={cardsRef} className="space-y-3">
                  {OPERATORS.map(op => (
                    <div key={op.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                      <div className="flex items-stretch">
                        <div className="w-1.5 flex-shrink-0" style={{ background: op.color }} />
                        <div className="p-4 flex-1">
                          <h4 className="text-sm font-bold text-bocra-slate">{op.name}</h4>
                          <p className="text-[10px] font-medium mb-2" style={{ color: op.color }}>{op.type}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-bocra-slate/60"><strong className="text-bocra-slate/80">Services:</strong> {op.services}</p>
                            <p className="text-xs text-bocra-slate/60"><strong className="text-bocra-slate/80">Coverage:</strong> {op.coverage}</p>
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
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2"><Award size={18} className="text-[#6BBE4E]" /> Licensing Framework</h3>
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
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Diphetogo tse di Botlhokwa tsa Mmaraka' : 'Key Market Reforms'}</h3>
                <div className="space-y-2">
                  {[
                    'Liberalisation of Value Added Network Services (VANS)',
                    'Permitting VoIP services under the current regulatory framework',
                    'Introduction of Private Telecommunications Network Licences (PTNL)',
                    'Interconnection guidelines for fair network access',
                    'Tariff regulations ensuring affordable services',
                    'Quality of Service monitoring and enforcement',
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2"><CheckCircle size={13} className="text-[#00A6CE] mt-0.5 flex-shrink-0" /><p className="text-xs text-bocra-slate/60">{r}</p></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{lang === 'tn' ? 'Lefapha la Megala' : 'Telecom Sector'}</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Licensed PTOs', value: '3', color: '#00A6CE' },
                    { label: 'Infrastructure Provider', value: 'BoFiNet', color: '#00458B' },
                    { label: 'Licence Categories', value: '4', color: '#6BBE4E' },
                    { label: 'Market Status', value: 'Liberalised', color: '#C8237B' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}><Signal size={14} style={{ color: s.color }} /></div>
                      <div><p className="text-sm font-bold text-bocra-slate">{s.value}</p><p className="text-[10px] text-gray-400">{s.label}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/licensing" className="flex items-center gap-3 p-4 bg-[#00A6CE] rounded-xl text-white hover:bg-[#008DB0] transition-all group">
                <Award size={20} /><div><p className="text-sm font-bold">{lang === 'tn' ? 'Ikopela Laesense' : 'Apply for a Licence'}</p><p className="text-[10px] text-white/60">View requirements and download forms</p></div><ArrowRight size={16} className="ml-auto" />
              </Link>

              <Link to="/services/file-complaint" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <Shield size={18} className="text-[#C8237B]" /><div><p className="text-xs font-bold text-bocra-slate">{lang === 'tn' ? 'Tlhagisa Ngongorego' : 'File a Complaint'}</p><p className="text-[10px] text-gray-400">Report service issues with an operator</p></div>
              </Link>

              <Link to="/services/qos-monitoring" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <BarChart3 size={18} className="text-[#F7B731]" /><div><p className="text-xs font-bold text-bocra-slate">QoS Monitoring</p><p className="text-[10px] text-gray-400">Real-time network performance data</p></div>
              </Link>

              <Link to="/telecom-statistics" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <BarChart3 size={18} className="text-[#6BBE4E]" /><div><p className="text-xs font-bold text-bocra-slate">Telecom Statistics</p><p className="text-[10px] text-gray-400">Market data and performance metrics</p></div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
