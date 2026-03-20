/**
 * InternetPage.jsx — BOCRA Internet & ICT Mandate
 * 
 * Covers: .BW ccTLD management, BW-CIRT cybersecurity, Electronic Evidence,
 * Electronic Communications & Transactions.
 * Route: /mandate/internet
 */
import { Link } from 'react-router-dom';
import {
  ChevronRight, Globe, Shield, FileText, Server, Lock,
  ExternalLink, Award, Users, CheckCircle, AlertTriangle,
  Wifi, Building, Scale, Key
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL || '/';

/* ── BOCRA's .BW Role ── */
const BW_ROLES = [
  'Act as a trustee for the .BW country-code top-level domain',
  'Become the .BW domain administrative contact as well as technical contact',
  'Administer the .BW ccTLD and its Second Level Domains',
  'Maintain and promote the operational stability and utility of the .BW ccTLD',
  'Ensure a cost-effective administration of the .BW ccTLD and its sub-domains',
  'Provide name service for all .BW and ensure that the database is secure and stable',
];

/* ── Sections ── */
const SECTIONS = [
  { id: 'cctld', label: '.BW Domain', icon: Globe, color: '#00A6CE' },
  { id: 'cirt', label: 'BW-CIRT', icon: Shield, color: '#C8237B' },
  { id: 'evidence', label: 'Electronic Evidence', icon: Scale, color: '#F7B731' },
  { id: 'ect', label: 'E-Transactions', icon: Key, color: '#6BBE4E' },
];

export default function InternetPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const heroRef = useScrollReveal();
  const cardsRef = useStaggerReveal({ stagger: 0.1 });

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate/50">Mandate</span>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">Internet & ICT</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        category="MANDATE" categoryTn="TIRAGATSO"
        title="Internet & ICT" titleTn="Inthanete le ICT"
        description="BOCRA's mandate encompasses management of the .BW country-code top-level domain, cybersecurity through BW-CIRT, electronic evidence certification, and regulation of electronic communications and transactions." descriptionTn="Tiragatso ya BOCRA e akaretsa taolo ya .BW, tshireletso ya saebo ka BW-CIRT, netefatso ya bosupi jwa elektroniki, le taolo ya dikgolagano tsa elektroniki."
        color="green"
      />

      {/* Quick nav */}
      <section className="py-6">
        <div className="section-wrapper max-w-5xl">
          <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`}
                className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}12` }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <span className="text-xs font-medium text-bocra-slate/70 group-hover:text-bocra-slate">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ .BW ccTLD ═══ */}
      <section id="cctld" className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center">
                  <Globe size={20} className="text-[#00A6CE]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-bocra-slate">{tn ? 'Lefelo la Khoutu ya Naga la .BW' : '.BW Country-Code Top-Level Domain'}</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{tn ? 'Taolo ya ccTLD' : 'ccTLD Management'}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                <p>
                  Section 38(1) of the Communications and Regulatory Act No. 19 of 2012 (CRA) mandates Botswana Communications Regulatory Authority (BOCRA) to manage and operate the .BW ccTLD in an efficient and non-discriminatory manner to ensure fairness in the use and allocation of the .bw name space.
                </p>
                <p>
                  Pursuant to this legal provision, a Technical Advisory Committee made up of the 'Local Internet Community' was established. This public-private partnership marked the initial step to facilitating the redelegation of the ccTLD from Botswana Telecommunications Corporation and the University of Botswana to BOCRA.
                </p>
                <p>
                  BOCRA is mandated to manage the .BW as a national resource, in the interest of the public and the industry. BOCRA, as a communications regulator and with full government support, aims to elevate Botswana in the global Internet community.
                </p>
              </div>

              {/* BOCRA's Role */}
              <div className="mt-5 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{tn ? 'Seabe sa BOCRA mo Taolong ya .BW' : "BOCRA's Role in .BW Management"}</h3>
                <div className="space-y-2">
                  {BW_ROLES.map((role, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={14} className="text-[#00A6CE] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-bocra-slate/70">{role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Kwadisa Lefelo la .BW' : 'Register a .BW Domain'}</h3>
                <p className="text-xs text-bocra-slate/50 leading-relaxed mb-3">
                  Search for domain availability and register through an accredited registrar.
                </p>
                <Link to="/services/register-bw"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#00A6CE] text-white text-xs font-medium rounded-lg hover:bg-[#008DB0] transition-all w-full justify-center">
                  <Globe size={14} /> Register .BW Domain
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Dikgolosa tse di Teng' : 'Available Extensions'}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['.co.bw', '.org.bw', '.net.bw', '.ac.bw', '.gov.bw', '.me.bw', '.shop.bw', '.agric.bw'].map(ext => (
                    <span key={ext} className="px-2.5 py-1 bg-[#00A6CE]/8 text-[#00A6CE] text-xs font-bold rounded-lg">{ext}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Thulaganyo ya Molao' : 'Legal Framework'}</h3>
                <p className="text-xs text-bocra-slate/50 leading-relaxed">
                  Communications Regulatory Authority Act No. 19 of 2012, Section 38(1)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BW-CIRT ═══ */}
      <section id="cirt" className="py-8">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#C8237B]/10 flex items-center justify-center">
                  <Shield size={20} className="text-[#C8237B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-bocra-slate">{tn ? 'BW-CIRT — Setlhopha sa Karabo ya Tiragalo ya Khomphutha' : 'BW-CIRT — Computer Incident Response Team'}</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{tn ? 'Tshireletso ya Saebo ya Bosetšhaba' : 'National Cybersecurity'}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                <p>
                  The Ministry of Transport and Communications (MTC) developed the National Cybersecurity Strategy in collaboration with all the relevant stakeholders from the Private Sector, relevant Ministries, Regulator, and Academia. The Commonwealth Telecommunications Organisation (CTO) assisted in the development with funding from the Foreign & Commonwealth Office (FCO) of the Government of the United Kingdom of Great Britain.
                </p>
                <p>
                  The project team which developed the National Cybersecurity Strategy benefited from inputs and comments from the State Department of the United States of America (USA), through the technical consultant from MITRE and Carnegie Mellon University.
                </p>
                <p>
                  The National Cybersecurity Strategy clarifies the roles of the various stakeholders and outlines various action plans to ensure that the country is cybersecurity secure. The Strategy recommends the establishment of a Computer Incident Response Team (CIRT) as a matter of urgency due to rising and complexity of cybersecurity threats and attacks.
                </p>
                <p>
                  To ensure a secure cyberspace for Botswana, MTC requested BOCRA to establish a Communications Sector CIRT (COMM-CIRT) to ensure that the communication sector, both private and public, are secure. The COMM-CIRT also acts as cybersecurity focal point. COMM-CIRT will assume National cybersecurity responsibilities in the interim, while awaiting the establishment of National CIRT (BWCIRT).
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Bega Tiragalo ya Saebo' : 'Report a Cyber Incident'}</h3>
                <p className="text-xs text-bocra-slate/50 leading-relaxed mb-3">
                  Report phishing, malware, fraud, data breaches, or hacking through our Cybersecurity Hub.
                </p>
                <Link to="/cybersecurity"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#C8237B] text-white text-xs font-medium rounded-lg hover:bg-[#A01D64] transition-all w-full justify-center">
                  <Shield size={14} /> Cybersecurity Hub
                </Link>
              </div>

              <a href="https://www.cirt.org.bw/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-[#C8237B]/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={16} className="text-[#C8237B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-bocra-slate group-hover:text-[#C8237B]">{tn ? 'Webosaete ya Semmuso ya BW-CIRT' : 'BW-CIRT Official Website'}</p>
                  <p className="text-[10px] text-gray-400">www.cirt.org.bw</p>
                </div>
              </a>

              <div className="bg-[#C8237B]/5 rounded-xl border border-[#C8237B]/10 p-4">
                <h3 className="text-xs font-bold text-[#C8237B] mb-2">{tn ? 'Balekane ba Botlhokwa' : 'Key Partners'}</h3>
                <div className="space-y-1.5 text-xs text-bocra-slate/60">
                  <p>Ministry of Transport and Communications</p>
                  <p>Commonwealth Telecommunications Organisation</p>
                  <p>UK Foreign & Commonwealth Office</p>
                  <p>US State Department / MITRE / Carnegie Mellon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Electronic Evidence ═══ */}
      <section id="evidence" className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F7B731]/10 flex items-center justify-center">
                  <Scale size={20} className="text-[#F7B731]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-bocra-slate">{tn ? 'Bosupi jwa Elektroniki' : 'Electronic Evidence'}</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Electronic Records (Evidence) Act No. 13 of 2014</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                <p>
                  The Electronic Records (Evidence) Act No. 13 of 2014 allows for the admissibility and authentication of electronic records as evidence in legal proceedings and admissibility, in evidence, of electronic records as original records.
                </p>
                <p>
                  Section 5 of the Act provides that nothing in the rules of evidence shall apply to deny admissibility of an electronic record as evidence because it is an electronic record.
                </p>
                <p>
                  Section 6(2) of the Act designates BOCRA as the <strong>Certifying Authority</strong> and requires BOCRA to establish an approved process for the production of electronic documents and also certify electronic records systems for purpose of integrity.
                </p>
                <p>
                  The Electronic Records (Evidence) Regulations of 2016 establish an approved process for the certification of electronic systems. Unless otherwise provided in any other written law, where an electronic record is tendered as evidence, such an electronic record shall be admissible if it is relevant and if it is produced in accordance with this approved process.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{lang === 'tn' ? 'Ditsenya' : 'Downloads'}</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Certifying Agents Application Form', file: 'certifying_Agent_Application_Form.pdf', type: 'PDF' },
                    { label: 'Guide for Certifying Agents', file: 'Guide for Certfiying Agents.pdf', type: 'PDF' },
                    { label: 'Electronic Evidence Regulations (Draft)', file: 'Draft_Electronic_Records_(Evidence)_Regulations-8May201.docx', type: 'DOCX' },
                  ].map(doc => (
                    <a key={doc.label} href={`${BASE}documents/internet/${doc.file}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-[#F7B731]/5 hover:border-[#F7B731]/20 transition-all group">
                      <FileText size={13} className="text-[#F7B731] flex-shrink-0" />
                      <span className="text-xs text-bocra-slate/70 group-hover:text-bocra-slate flex-1">{doc.label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${doc.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{doc.type}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-[#F7B731]/5 rounded-xl border border-[#F7B731]/10 p-4">
                <h3 className="text-xs font-bold text-[#F7B731] mb-2">{tn ? 'Seabe sa BOCRA' : "BOCRA's Role"}</h3>
                <p className="text-xs text-bocra-slate/60 leading-relaxed">
                  Designated as the Certifying Authority under Section 6(2) of the Act. Responsible for establishing approved processes and certifying electronic records systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Electronic Communications & Transactions ═══ */}
      <section id="ect" className="py-8">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#6BBE4E]/10 flex items-center justify-center">
                  <Key size={20} className="text-[#6BBE4E]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-bocra-slate">{tn ? 'Dikgolagano le Ditiragatso tsa Elektroniki' : 'Electronic Communications & Transactions'}</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">ECT Act No. 14 of 2014</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                <p>
                  Under the Electronic Communications and Transactions Act, the Authority has the responsibility of accrediting Secure Electronic Signature Service Providers. The Electronic Communications and Transactions Act No. 14 of 2014 (the Act) came into force on 1st April 2016 with the passing of secondary legislation (Regulations).
                </p>
                <p>
                  The Act makes BOCRA responsible for accrediting and managing Certificate Authorities (CA), developing technical standards, handling legal and policy issues and appointing a pool of Auditors from which interested CAs can choose during the auditing process.
                </p>
              </div>

              {/* Accredited CA */}
              <div className="mt-5 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3 flex items-center gap-2">
                  <Award size={15} className="text-[#6BBE4E]" /> Accredited Certificate Authorities
                </h3>
                <div className="flex items-start gap-3 p-4 bg-[#6BBE4E]/5 rounded-lg border border-[#6BBE4E]/10">
                  <div className="w-9 h-9 rounded-lg bg-[#6BBE4E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={16} className="text-[#6BBE4E]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-bocra-slate">LAWtrust</p>
                    <p className="text-[10px] text-gray-400 mb-2">Accredited Secure Electronic Signature Service Provider</p>
                    <div className="space-y-1 text-xs text-bocra-slate/60">
                      <p>85 Regency Drive, Route 21 Corporate Office Park, Centurion, South Africa</p>
                      <p>Contact: <strong>Shawn Pilusa</strong> (Business Development Manager)</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        <a href="mailto:info@lawtrust.co.za" className="text-[#6BBE4E] hover:underline">info@lawtrust.co.za</a>
                        <a href="tel:+27126769240" className="text-[#6BBE4E] hover:underline">+27 12 676 9240</a>
                        <a href="https://www.lawtrust.co.za" target="_blank" rel="noopener noreferrer" className="text-[#6BBE4E] hover:underline">www.lawtrust.co.za</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Ditsenya' : 'Downloads'}</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Accreditation Procedure', file: 'Accreditation Procedure - rev 1 (002) (1).pdf', type: 'PDF' },
                    { label: 'ACS Standards (August 2017)', file: 'ACS Standards - August 2017.pdf', type: 'PDF' },
                    { label: 'ACS Checklist', file: 'ACS-checklist.pdf', type: 'PDF' },
                    { label: 'ECT Act Regulations 2016', file: 'Electronic Communications and Transactions Act Regulations 2016.pdf', type: 'PDF' },
                  ].map(doc => (
                    <a key={doc.label} href={`${BASE}documents/internet/${doc.file}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-[#6BBE4E]/5 transition-all group">
                      <FileText size={13} className="text-[#6BBE4E] flex-shrink-0" />
                      <span className="text-xs text-bocra-slate/70 group-hover:text-bocra-slate flex-1">{doc.label}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500">{doc.type}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-[#6BBE4E]/5 rounded-xl border border-[#6BBE4E]/10 p-4">
                <h3 className="text-xs font-bold text-[#6BBE4E] mb-2">{tn ? 'Maikarabelo a BOCRA' : "BOCRA's Responsibilities"}</h3>
                <div className="space-y-1.5">
                  {[
                    'Accredit Secure Electronic Signature Service Providers',
                    'Manage Certificate Authorities (CA)',
                    'Develop technical standards',
                    'Handle legal and policy issues',
                    'Appoint auditor pool for CA auditing',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={11} className="text-[#6BBE4E] mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-bocra-slate/60">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <h3 className="text-sm font-bold text-bocra-slate mb-4">{lang === 'tn' ? 'Ditsebe Tse di Amanang' : 'Related Pages'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Register .BW Domain', path: '/services/register-bw', icon: Globe, color: '#00A6CE' },
              { label: 'Cybersecurity Hub', path: '/cybersecurity', icon: Shield, color: '#C8237B' },
              { label: 'Data Protection', path: '/portal/data-request', icon: Lock, color: '#F7B731' },
              { label: 'Telecommunications', path: '/mandate/telecommunications', icon: Wifi, color: '#6BBE4E' },
            ].map(link => (
              <Link key={link.path} to={link.path}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}12` }}>
                  <link.icon size={16} style={{ color: link.color }} />
                </div>
                <span className="text-xs font-medium text-bocra-slate/70 group-hover:text-bocra-slate">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Colour bar */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" />
        <div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
    </div>
  );
}
