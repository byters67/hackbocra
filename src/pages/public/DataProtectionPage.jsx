/**
 * DataProtectionPage.jsx — Data Protection Information
 * 
 * Public information page about data protection in Botswana.
 * Links to the DSAR form for logged-in users.
 * Route: /data-protection
 */
import { Link } from 'react-router-dom';
import {
  ChevronRight, Shield, Lock, Eye, Edit3, Trash2, FileText,
  Users, AlertCircle, CheckCircle, ExternalLink, Phone, Mail,
  ArrowRight, Scale, Globe, Key, UserCheck
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

/* ── Your Rights Under the Act ── */
const RIGHTS = [
  { icon: Eye, title: 'Right of Access', desc: 'You have the right to request a copy of all personal data BOCRA holds about you, and to know how it is being used.', color: '#00A6CE' },
  { icon: Edit3, title: 'Right to Rectification', desc: 'If your personal data is inaccurate or incomplete, you can request that BOCRA corrects or updates it.', color: '#6BBE4E' },
  { icon: Trash2, title: 'Right to Erasure', desc: 'You can request that BOCRA deletes your personal data where there is no compelling reason to continue processing it.', color: '#C8237B' },
  { icon: Lock, title: 'Right to Restrict Processing', desc: 'You can request that BOCRA limits how your personal data is used while a complaint or concern is being resolved.', color: '#F7B731' },
  { icon: Globe, title: 'Right to Data Portability', desc: 'You can request your personal data in a structured, commonly used format to transfer to another organisation.', color: '#00458B' },
  { icon: AlertCircle, title: 'Right to Object', desc: 'You can object to the processing of your personal data in certain circumstances, including direct marketing.', color: '#7C3AED' },
];

/* ── What BOCRA Collects ── */
const DATA_CATEGORIES = [
  { category: 'Complaint Data', examples: 'Name, email, phone, complaint details, service provider', purpose: 'Investigating and resolving complaints' },
  { category: 'Licence Applications', examples: 'Company name, contact person, national ID, business details', purpose: 'Processing licence applications' },
  { category: 'Type Approval', examples: 'Applicant details, device specifications, test results', purpose: 'Equipment certification' },
  { category: 'Portal Accounts', examples: 'Name, email, password (hashed), organisation', purpose: 'Account management and authentication' },
  { category: 'Contact Enquiries', examples: 'Name, email, phone, message content', purpose: 'Responding to public enquiries' },
  { category: 'Domain Registration', examples: 'Registrant name, contact info, name servers', purpose: '.BW domain administration' },
];

export default function DataProtectionPage() {
  const { lang } = useLanguage();
  const heroRef = useScrollReveal();
  const rightsRef = useStaggerReveal({ stagger: 0.08 });

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">Data Protection</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        category="DATA PROTECTION" categoryTn="TSHIRELETSO YA DATA"
        title="Data Protection" titleTn="Tshireletso ya Data"
        description="BOCRA is committed to protecting your personal data. Learn about your rights under the Botswana Data Protection Act and how we handle your information." descriptionTn="BOCRA e ikemiseditse go sireletsa data ya gago. Ithute ka ditshwanelo tsa gago ka fa tlase ga Molao wa Tshireletso ya Data wa Botswana."
        color="blue"
      />

      {/* Overview */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-bocra-slate mb-3">The Data Protection Act, 2024</h2>
              <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                <p>
                  The Botswana Data Protection Act, 2024 establishes a comprehensive framework for the protection of personal data in Botswana. The Act gives individuals (data subjects) rights over their personal information and places obligations on organisations (data controllers and processors) that collect, store, and use personal data.
                </p>
                <p>
                  As a regulatory authority, BOCRA collects and processes personal data in the course of its mandate — including when you file complaints, apply for licences, register for portals, or submit enquiries. BOCRA is committed to handling all personal data lawfully, fairly, and transparently.
                </p>
                <p>
                  The Act aligns Botswana with international data protection standards and supports the country's digital transformation agenda by building public trust in how personal information is handled by both government and private sector organisations.
                </p>
              </div>

              {/* Key Principles */}
              <div className="mt-6 bg-[#00458B]/5 rounded-xl border border-[#00458B]/10 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Metheo ya Botlhokwa ya Tshireletso ya Data' : 'Key Principles of Data Protection'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Lawfulness & Fairness', desc: 'Data must be processed lawfully and fairly' },
                    { title: 'Purpose Limitation', desc: 'Data collected for specific, explicit purposes only' },
                    { title: 'Data Minimisation', desc: 'Only necessary data is collected' },
                    { title: 'Accuracy', desc: 'Personal data must be kept accurate and up to date' },
                    { title: 'Storage Limitation', desc: 'Data not kept longer than necessary' },
                    { title: 'Security', desc: 'Appropriate measures to protect personal data' },
                  ].map(p => (
                    <div key={p.title} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-[#00A6CE] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-bocra-slate">{p.title}</p>
                        <p className="text-[11px] text-bocra-slate/50">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* DSAR CTA */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-br from-[#00458B] to-[#001A3A] p-5">
                  <Shield size={28} className="text-[#00A6CE] mb-2" />
                  <h3 className="text-white font-bold text-sm">Exercise Your Data Rights</h3>
                  <p className="text-white/50 text-xs mt-1">Submit a Data Subject Access Request</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-bocra-slate/60 leading-relaxed mb-3">
                    Request access to, correction, or deletion of your personal data held by BOCRA. Sign in to submit and track your request.
                  </p>
                  <Link to="/portal/data-request"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#00458B] text-white text-xs font-medium rounded-lg hover:bg-[#003366] transition-all">
                    <FileText size={14} /> Submit DSAR <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{lang === 'tn' ? 'Dintlha tse di Bonako' : 'Quick Facts'}</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Response Time', value: '30 days', icon: FileText, color: '#00A6CE' },
                    { label: 'Cost to You', value: 'Free', icon: CheckCircle, color: '#6BBE4E' },
                    { label: lang === 'tn' ? 'Ditshwanelo Tsa Gago' : 'Your Rights', value: '6 Rights', icon: Shield, color: '#C8237B' },
                    { label: 'Applicable Law', value: 'DPA 2024', icon: Scale, color: '#F7B731' },
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

              {/* Contact */}
              <div className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">Data Protection Officer</p>
                <p className="text-xs text-bocra-slate/60 leading-relaxed mb-2">
                  For data protection queries or to submit a request offline.
                </p>
                <div className="space-y-1.5">
                  <a href="mailto:info@bocra.org.bw" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline">
                    <Mail size={11} className="text-[#00A6CE]" /> info@bocra.org.bw
                  </a>
                  <a href="tel:+2673957755" className="flex items-center gap-2 text-xs text-[#00458B] hover:underline">
                    <Phone size={11} className="text-[#00A6CE]" /> +267 395 7755
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Ditshwanelo Tsa Gago' : 'Your Rights'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">Under the Data Protection Act, you have the following rights over your personal data</p>
          <div ref={rightsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RIGHTS.map(right => (
              <div key={right.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${right.color}12` }}>
                  <right.icon size={20} style={{ color: right.color }} />
                </div>
                <h3 className="text-sm font-bold text-bocra-slate mb-1">{right.title}</h3>
                <p className="text-xs text-bocra-slate/60 leading-relaxed">{right.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Data BOCRA Collects */}
      <section className="py-8">
        <div className="section-wrapper max-w-5xl">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Data e BOCRA e e Kgobokanyang' : 'What Data BOCRA Collects'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">Types of personal data we process and why</p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Data Collected</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DATA_CATEGORIES.map(row => (
                    <tr key={row.category} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-bocra-slate text-xs">{row.category}</td>
                      <td className="px-5 py-3 text-xs text-bocra-slate/60">{row.examples}</td>
                      <td className="px-5 py-3 text-xs text-bocra-slate/60">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How to Exercise Your Rights */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-3xl">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-2">{lang === 'tn' ? 'Go Diragatsa Ditshwanelo Tsa Gago Jang' : 'How to Exercise Your Rights'}</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-8">Three simple steps to submit a data request</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Sign In', desc: 'Log in to your BOCRA portal account, or create one via ASMS-WebCP.', icon: UserCheck, color: '#00A6CE' },
              { step: '2', title: 'Submit Request', desc: 'Choose your request type (access, correction, or deletion) and provide details.', icon: FileText, color: '#6BBE4E' },
              { step: '3', title: 'Track Status', desc: 'BOCRA will respond within 30 days. Track progress in your dashboard.', icon: Eye, color: '#F7B731' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-sm font-bold" style={{ background: s.color }}>
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-bocra-slate mb-1">{s.title}</h3>
                <p className="text-xs text-bocra-slate/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/portal/data-request"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
              <Shield size={16} /> Submit a Data Request <ArrowRight size={14} />
            </Link>
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
