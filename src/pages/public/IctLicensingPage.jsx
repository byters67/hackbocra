/**
 * ICT Licensing Framework Page
 * 
 * Dedicated page for the ICT licensing documents, organized into
 * clear categories: Framework & Guidelines, Licence Types,
 * Application Requirements, Licensed Operators, and Public Notices.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Download, FileText, Search, Shield, Radio,
  Building, Users, Globe, Award, BookOpen, Filter, ChevronDown
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';

import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
const BASE = import.meta.env.BASE_URL;

const ICT_SECTIONS = [
  {
    title: 'Framework & Guidelines',
    desc: 'Core ICT licensing framework documents and application guidelines',
    icon: BookOpen,
    color: '#00458B',
    docs: [
      { title: 'ICT Licensing Framework', desc: 'The comprehensive framework governing ICT licensing in Botswana', file: 'ict/ICT_Licensing_Framework.pdf', size: '359 KB' },
      { title: 'Guidelines for Application of Licences', desc: 'Step-by-step guide for applying for ICT licences from BOCRA', file: 'ict/Guidelines_For_Application_Of_Licences.pdf', size: '727 KB' },
      { title: 'ICT Licence Application Requirements & Fees', desc: 'Complete list of requirements, documents needed, and applicable fees', file: 'ict/ICT_Licence_Application_Requirements_and_Fees.pdf', size: '150 KB' },
      { title: 'Migration Conversion Plan', desc: 'Plan for migration of existing licences to the new ICT licensing framework', file: 'ict/Migration_Conversion_Plan.pdf', size: '353 KB' },
      { title: 'Products and Services', desc: 'Catalogue of ICT products and services regulated by BOCRA (September 2016)', file: 'ict/Products_and_Services.pdf', size: '76 KB' },
    ],
  },
  {
    title: 'Licence Types',
    desc: 'Individual licence category documents',
    icon: Award,
    color: '#00A6CE',
    docs: [
      { title: 'Network Facilities Licence', desc: 'Licence for providers of telecommunications network infrastructure', file: 'ict/Network_Facilities_Licence.pdf', size: '386 KB' },
      { title: 'Service and Application Licence', desc: 'Licence for service providers and application operators', file: 'ict/Service_and_Application_Licence.pdf', size: '296 KB' },
      { title: 'Campus Radio Licensing Framework', desc: 'Framework for licensing campus radio stations at educational institutions', file: 'ict/Campus_Radio_Licensing_Framework.pdf', size: '6.9 MB' },
    ],
  },
  {
    title: 'Application Requirements',
    desc: 'Specific requirements for each provisional licence category',
    icon: FileText,
    color: '#C8237B',
    docs: [
      { title: 'Broadcasting Provisional Licence Requirements', desc: 'Requirements for broadcasting service provisional licence applications', file: 'ict/Broadcasting_Provisional_Licence_Requirements.pdf', size: '542 KB' },
      { title: 'CPO Provisional Licence Requirements', desc: 'Requirements for Content Provider Operator provisional licence applications', file: 'ict/CPO_Provisional_Licence_Requirements.pdf', size: '305 KB' },
      { title: 'NFP Provisional Licence Requirements', desc: 'Requirements for Network Facilities Provider provisional licence applications', file: 'ict/NFP_Provisional_Licence_Requirements.pdf', size: '597 KB' },
      { title: 'SAP Provisional Licence Requirements', desc: 'Requirements for Service and Application Provider provisional licence applications', file: 'ict/SAP_Provisional_Licence_Requirements.pdf', size: '460 KB' },
      { title: 'Campus Radio Application Requirements', desc: 'Specific requirements for campus radio station licence applications', file: 'ict/Campus_Radio_Application_Requirements.pdf', size: '169 KB' },
    ],
  },
  {
    title: 'Licensed Operators',
    desc: 'Current list of BOCRA-licensed telecommunications operators',
    icon: Building,
    color: '#6BBE4E',
    docs: [
      { title: 'Licensed Operators', desc: 'Complete directory of all currently licensed ICT operators in Botswana', file: 'ict/Licensed_Operators.pdf', size: '241 KB' },
    ],
  },
  {
    title: 'Public Notices',
    desc: 'Regulatory notices and announcements',
    icon: Globe,
    color: '#F7B731',
    docs: [
      { title: 'RIOs Final Public Notice', desc: 'Final public notice on Reference Interconnection Offers', file: 'ict/RIOs_Final_Public_Notice.pdf', size: '8 KB' },
    ],
  },
];

export default function IctLicensingPage() {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const heroRef = useScrollReveal();

  const allDocs = ICT_SECTIONS.flatMap(s => s.docs.map(d => ({ ...d, section: s.title })));
  const totalDocs = allDocs.length;

  const filteredSections = searchTerm
    ? ICT_SECTIONS.map(s => ({
        ...s,
        docs: s.docs.filter(d =>
          d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.desc.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter(s => s.docs.length > 0)
    : ICT_SECTIONS;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <Link to="/documents/drafts" className="hover:text-bocra-blue transition-colors">Documents</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate">ICT Licensing Framework</span>
          </nav>
        </div>
      </div>
      {/* Hero */}
      <PageHero category="LICENSING" categoryTn="DILAESENSE" title="ICT Licensing Framework" titleTn="Thulaganyo ya Dilaesense tsa ICT" description="Regulatory framework documents, application requirements, and guidelines for ICT service providers in Botswana." descriptionTn="Dikwalo tsa thulaganyo ya taolo, ditlhokego tsa dikopo, le ditaelo tsa baneedi ba ditirelo tsa ICT." color="green" />


      {/* Search */}
      <section className="py-6">
        <div className="section-wrapper max-w-3xl mx-auto">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search ICT licensing documents..."
              className="w-full pl-11 pr-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-[#F7B731] focus:ring-2 focus:ring-[#F7B731]/10 outline-none" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-bocra-slate/30 hover:text-bocra-slate">
                <span className="text-xs">Clear</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Document sections */}
      <section className="pb-8">
        <div className="section-wrapper max-w-4xl mx-auto">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">No documents match "{searchTerm}"</p>
            </div>
          ) : (
            filteredSections.map((section, si) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="mb-8 last:mb-0">
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: section.color + '15' }}>
                      <Icon size={20} style={{ color: section.color }} />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-bocra-slate">{section.title}</h2>
                      <p className="text-xs text-bocra-slate/40">{section.desc} · {section.docs.length} {section.docs.length === 1 ? 'document' : 'documents'}</p>
                    </div>
                  </div>

                  {/* Document cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-0 sm:ml-13">
                    {section.docs.map((doc, di) => (
                      <a key={di} href={`${BASE}documents/${doc.file}`} target="_blank" rel="noopener noreferrer"
                        className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-gray-200 transition-all group flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-bocra-slate group-hover:text-[#00458B] transition-colors leading-tight">{doc.title}</h3>
                          <p className="text-xs text-bocra-slate/40 mt-1 leading-relaxed">{doc.desc}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-500 rounded">PDF</span>
                            <span className="text-[10px] text-bocra-slate/30">{doc.size}</span>
                            <span className="text-[10px] text-[#00A6CE] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download size={10} /> Download
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Related links */}
      <section className="py-6 bg-bocra-off-white">
        <div className="section-wrapper max-w-3xl mx-auto text-center">
          <p className="text-xs text-bocra-slate/30 mb-3">{lang === 'tn' ? 'Ditsebe Tse di Amanang' : 'Related Pages'}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/licensing" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/60 hover:text-[#00A6CE] hover:border-[#00A6CE]/30 transition-all">
              Apply for a Licence
            </Link>
            <Link to="/documents/drafts" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/60 hover:text-[#00A6CE] hover:border-[#00A6CE]/30 transition-all">
              All Documents
            </Link>
            <Link to="/mandate/licensing" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-bocra-slate/60 hover:text-[#00A6CE] hover:border-[#00A6CE]/30 transition-all">
              Licensing Mandate
            </Link>
          </div>
        </div>
      </section>

      {/* Colour bar */}
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
