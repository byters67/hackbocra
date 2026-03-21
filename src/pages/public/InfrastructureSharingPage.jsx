/**
 * InfrastructureSharingPage.jsx — Infrastructure Sharing
 * Route: /projects/infrastructure-sharing
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Building, Wifi, Signal, Globe, Shield, CheckCircle, ArrowRight, Users, BarChart3 } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

export default function InfrastructureSharingPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const cardsRef = useStaggerReveal({ stagger: 0.1 });
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link><ChevronRight size={14} /><span className="text-bocra-slate/50">{tn ? 'Diporojeke' : 'Projects'}</span><ChevronRight size={14} /><span className="text-bocra-slate font-medium">{tn ? 'Karoganyo ya Mafaratlhatlha' : 'Infrastructure Sharing'}</span></nav></div></div>
      <PageHero category="PROJECTS" categoryTn="DITSHWANELO" title="Infrastructure Sharing" titleTn="Karoganyo ya Mafaratlhatlha" description="Promoting efficient use of telecommunications infrastructure through sharing arrangements — reducing duplication, lowering costs, and expanding coverage across Botswana." descriptionTn="Go rotloetsa tiriso e e nonofileng ya mafaratlhatlha a megala ka go arolelana — go fokotsa go boelediwa, go fokotsa ditshenyegelo, le go atolosa khumo ya ditirelo." color="cyan" />

      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-bocra-slate mb-3">{tn ? 'Thulaganyo ya Karoganyo ya Mafaratlhatlha' : 'Infrastructure Sharing Framework'}</h2>
                <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                  <p>{tn ? 'BOCRA e rotloetsa karoganyo ya mafaratlhatlha gareng ga balaodi ba megala go fokotsa go boelediwa ga mafaratlhatlha a neteweke, go fokotsa ditshenyegelo tsa go fana ka ditirelo, le go potlakisa go atolosiwa ga phitlhelelo — bogolo jang mo mafelong a magae a a sa fitisweng.' : 'BOCRA promotes infrastructure sharing among telecommunications operators to reduce the duplication of network infrastructure, lower the cost of deploying services, and accelerate the expansion of coverage — particularly in underserved rural areas.'}</p>
                  <p>{tn ? 'Karoganyo ya mafaratlhatlha ke selo se se botlhokwa sa go fitlhelela phitlhelelo e e akaretsang ya ditirelo tsa dikgolagano. Ka go arolelana ditora, fibre, medutu, le mafaratlhatlha a mangwe a a sa direng, balaodi ba ka fana ka ditirelo ka bokgoni bo bogolo fa ba fokotsa ditshenyegelo tsa bone tsa matsolo.' : 'Infrastructure sharing is a key enabler for achieving universal access to communications services. By sharing towers, fibre, ducts, and other passive infrastructure, operators can deploy services more efficiently while reducing their capital expenditure.'}</p>
                  <p>{tn ? 'Thulaganyo e tsamaelana le pono ya Puso ya Botswana ya setšhaba se se golaganeng sa dijithale mme e tshegetsa maikaelelo a Leano la Bosetšhaba la Inthanete ya Lobelo la go atolosa phitlhelelo kwa dikgaolong tsotlhe.' : 'The framework aligns with the Government of Botswana\'s vision for a connected digital society and supports the National Broadband Strategy\'s goals of expanding coverage to all districts.'}</p>
                </div>
              </div>

              {/* Types of Sharing */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2"><Building size={18} className="text-[#00A6CE]" /> {tn ? 'Mefuta ya Karoganyo ya Mafaratlhatlha' : 'Types of Infrastructure Sharing'}</h3>
                <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: lang === 'tn' ? 'Karoganyo e e sa Direng' : 'Passive Sharing', desc: lang === 'tn' ? 'Karoganyo ya mafaratlhatlha a mmele jaaka ditora, dipole, le meago. Balaodi ba baya didirisiwa mmogo mo meagong e e aroganwang.' : 'Sharing of physical infrastructure such as towers, masts, poles, ducts, and buildings. Operators co-locate equipment on shared structures.', icon: Building, color: '#00A6CE' },
                    { title: lang === 'tn' ? 'Karoganyo e e Dirang' : 'Active Sharing', desc: lang === 'tn' ? 'Karoganyo ya dikarolo tsa neteweke tse di dirang jaaka dineteweke tsa phitlhelelo ya radio (RAN), di-antenna, le didirisiwa tsa go romela.' : 'Sharing of active network elements such as radio access networks (RAN), antennas, and transmission equipment.', icon: Signal, color: '#C8237B' },
                    { title: lang === 'tn' ? 'Karoganyo ya Fibre' : 'Fibre Sharing', desc: lang === 'tn' ? 'Tiriso e e aroganwang ya dineteweke tsa fibre optic le medutu. BoFiNet e fana ka mafaratlhatlha a setšhaba a go rekisa ka bontsi.' : 'Shared use of fibre optic networks and ducts. BoFiNet provides the national backbone for wholesale access.', icon: Globe, color: '#6BBE4E' },
                    { title: lang === 'tn' ? 'Karoganyo ya Sepeketeramo' : 'Spectrum Sharing', desc: lang === 'tn' ? 'Dithulaganyo tsa tiriso e e aroganwang kgotsa e e rulagantsweng ya metswedi ya sepeketeramo go oketsa bokgoni.' : 'Arrangements for shared or coordinated use of radio frequency spectrum resources to maximise efficiency.', icon: Wifi, color: '#F7B731' },
                  ].map(type => (
                    <div key={type.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${type.color}12` }}>
                        <type.icon size={20} style={{ color: type.color }} />
                      </div>
                      <h4 className="text-sm font-bold text-bocra-slate mb-1">{type.title}</h4>
                      <p className="text-xs text-bocra-slate/60 leading-relaxed">{type.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-[#00A6CE]/5 rounded-xl border border-[#00A6CE]/10 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{tn ? 'Mesola ya Karoganyo ya Mafaratlhatlha' : 'Benefits of Infrastructure Sharing'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(tn ? [
                    'Ditshenyegelo tsa matsolo tse di fokotsegileng mo balaoding',
                    'Go isiwa ga neteweke ka bonako le go atolosiwa ga phitlhelelo',
                    'Ditlhwatlhwa tse di kwa tlase go badirisi ka go boloka ditshenyegelo',
                    'Ditlamorago tse di fokotsegileng mo tikologong (ditora tse di nnye)',
                    'Tirelo e e tokafaditsweng mo mafelong a magae le a a sa fitisweng',
                    'Tiriso e e nang le bokgoni go feta ya metswedi ya bosetšhaba',
                  ] : [
                    'Reduced capital expenditure for operators',
                    'Faster network deployment and coverage expansion',
                    'Lower consumer prices through cost savings',
                    'Reduced environmental impact (fewer towers)',
                    'Improved service in rural and underserved areas',
                    'More efficient use of national resources',
                  ]).map((b, i) => (
                    <div key={i} className="flex items-start gap-2"><CheckCircle size={13} className="text-[#00A6CE] mt-0.5 flex-shrink-0" /><p className="text-xs text-bocra-slate/60">{b}</p></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Baamegi ba Botlhokwa' : 'Key Stakeholders'}</h3>
                <div className="space-y-2">
                  {[
                    { name: 'BoFiNet', role: tn ? 'Motlamedi wa mafaratlhatlha a bosetšhaba' : 'National backbone provider', color: '#00458B' },
                    { name: 'Mascom', role: tn ? 'Molaodi wa mogala' : 'Mobile operator', color: '#E21836' },
                    { name: 'BTC', role: tn ? 'Molaodi wa mogala o o tsepameng le mogala' : 'Fixed & mobile operator', color: '#0066CC' },
                    { name: 'Orange', role: tn ? 'Molaodi wa mogala' : 'Mobile operator', color: '#FF6600' },
                  ].map(s => (
                    <div key={s.name} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      <div><p className="text-xs font-bold text-bocra-slate">{s.name}</p><p className="text-[10px] text-gray-400">{s.role}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/mandate/telecommunications" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <Wifi size={18} className="text-[#00A6CE]" /><div><p className="text-xs font-bold text-bocra-slate">{tn ? 'Megala' : 'Telecommunications'}</p><p className="text-[10px] text-gray-400">{tn ? 'Thulaganyo ya taolo' : 'Regulatory framework'}</p></div>
              </Link>

              <Link to="/services/qos-monitoring" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <BarChart3 size={18} className="text-[#6BBE4E]" /><div><p className="text-xs font-bold text-bocra-slate">{tn ? 'Tlhokomelo ya Boleng jwa Tirelo' : 'QoS Monitoring'}</p><p className="text-[10px] text-gray-400">{tn ? 'Data ya tiragatso ya neteweke' : 'Network performance data'}</p></div>
              </Link>

              <div className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">{tn ? 'Dipotso' : 'Enquiries'}</p>
                <a href="mailto:info@bocra.org.bw" className="text-xs text-[#00458B] hover:underline">info@bocra.org.bw</a><br />
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
