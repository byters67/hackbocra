/**
 * LegislationPage.jsx — BOCRA Governing Legislation
 * Route: /mandate/legislation
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Scale, FileText, Shield, ExternalLink, BookOpen, CheckCircle, Globe, Radio, Mail as MailIcon, Key } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const LAWS = [
  { title: 'Communications Regulatory Authority Act, 2012', desc: 'The founding Act that establishes BOCRA and defines its mandate to regulate telecommunications, broadcasting, internet, and postal services in Botswana. Commenced 1 April 2013.', color: '#00A6CE', icon: Shield, links: [{ label: 'Telecommunications', path: '/mandate/telecommunications' }, { label: 'Broadcasting', path: '/mandate/broadcasting' }, { label: 'Postal Services', path: '/mandate/postal' }, { label: 'Internet & ICT', path: '/mandate/internet' }] },
  { title: 'Electronic Records (Evidence) Act No. 13 of 2014', desc: 'Allows for the admissibility and authentication of electronic records as evidence in legal proceedings. Designates BOCRA as the Certifying Authority for electronic records systems.', color: '#F7B731', icon: Scale, links: [{ label: 'Internet & ICT', path: '/mandate/internet' }] },
  { title: 'Electronic Communications and Transactions Act No. 14 of 2014', desc: 'Mandates BOCRA to accredit Secure Electronic Signature Service Providers and manage Certificate Authorities. Came into force 1 April 2016.', color: '#6BBE4E', icon: Key, links: [{ label: 'Internet & ICT', path: '/mandate/internet' }] },
  { title: 'Data Protection Act, 2024', desc: 'Comprehensive framework for the protection of personal data in Botswana. Gives individuals rights over their personal information and places obligations on data controllers and processors.', color: '#C8237B', icon: Shield, links: [{ label: 'Data Protection', path: '/data-protection' }] },
  { title: 'Broadcasting Act (Cap. 72:04)', desc: 'Governs broadcasting activities in Botswana. BOCRA regulates commercial radio and television broadcasters under the CRA Act.', color: '#C8237B', icon: Radio, links: [{ label: 'Broadcasting', path: '/mandate/broadcasting' }] },
  { title: 'Postal Services Act (Cap. 72:02)', desc: 'Provides the regulatory framework for universal and commercial postal services. BOCRA ensures safe, reliable, efficient and affordable postal services throughout Botswana.', color: '#F7B731', icon: MailIcon, links: [{ label: 'Postal Services', path: '/mandate/postal' }] },
];

export default function LegislationPage() {
  const { lang } = useLanguage();
  const cardsRef = useStaggerReveal({ stagger: 0.08 });
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">Home</Link><ChevronRight size={14} /><span className="text-bocra-slate/50">Mandate</span><ChevronRight size={14} /><span className="text-bocra-slate font-medium">Legislation</span></nav></div></div>
      <PageHero category="MANDATE" categoryTn="TIRAGATSO" title="Governing Legislation" titleTn="Melao e e Laolang" description="The laws and Acts that establish BOCRA's mandate and regulatory powers across telecommunications, broadcasting, postal, internet, and data protection." descriptionTn="Melao le Ditlhopho tse di tlhomang tiragatso ya BOCRA le maatla a taolo mo megala, phasalatso, poso, inthanete, le tshireletso ya data." color="blue" />

      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed mb-8 max-w-3xl">
            <p>The Botswana Communications Regulatory Authority (BOCRA) is an independent communications regulatory authority established through the Communications Regulatory Authority Act 2012 (CRA) on 1 April 2013 with the mandate to regulate the communications sector in Botswana comprising Telecommunications, Internet and Information and Communications Technologies (ICTs), Radio communications, Broadcasting, Postal services and related matters.</p>
          </div>

          <div ref={cardsRef} className="space-y-4">
            {LAWS.map(law => (
              <div key={law.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="flex items-stretch">
                  <div className="w-1.5 flex-shrink-0" style={{ background: law.color }} />
                  <div className="p-5 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${law.color}12` }}>
                        <law.icon size={18} style={{ color: law.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-bocra-slate">{law.title}</h3>
                        <p className="text-xs text-bocra-slate/60 leading-relaxed mt-1">{law.desc}</p>
                        {law.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {law.links.map(l => (
                              <Link key={l.path} to={l.path} className="text-[10px] font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-bocra-slate/60 hover:border-gray-300 hover:text-bocra-slate transition-all">
                                {l.label} →
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <h3 className="text-sm font-bold text-bocra-slate mb-4">{lang === 'tn' ? 'Ditsebe Tse di Amanang' : 'Related Pages'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: lang === 'tn' ? 'Thulaganyo ya Dilaesense' : 'Licensing Framework', path: '/mandate/licensing', icon: FileText, color: '#00A6CE' },
              { label: lang === 'tn' ? 'Ikopela Laesense' : 'Apply for a Licence', path: '/licensing', icon: BookOpen, color: '#6BBE4E' },
              { label: 'Documents Library', path: '/documents/drafts', icon: FileText, color: '#F7B731' },
              { label: lang === 'tn' ? 'Ka ga BOCRA' : 'About BOCRA', path: '/about/profile', icon: Shield, color: '#00458B' },
            ].map(link => (
              <Link key={link.path} to={link.path} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}12` }}><link.icon size={16} style={{ color: link.color }} /></div>
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
