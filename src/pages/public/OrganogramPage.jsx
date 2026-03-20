/**
 * OrganogramPage.jsx — BOCRA Organisational Structure
 * Route: /about/organogram
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Users, Shield, BarChart3, Radio, Briefcase,
  Globe, Scale, Award, Wifi, BookOpen, Building, FileText,
  Phone, ArrowRight, ChevronDown
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';

const DEPARTMENTS = [
  {
    name: 'Office of the Chief Executive',
    head: 'Mr. Martin Mokgware',
    title: 'Chief Executive',
    color: '#00458B',
    icon: Briefcase,
    desc: 'Provides overall leadership and strategic direction for the Authority. Reports to the Board of Directors.',
    isTop: true,
  },
  {
    name: 'Compliance & Monitoring',
    head: 'Department Head',
    title: 'Director',
    color: '#00A6CE',
    icon: Shield,
    desc: 'Ensures licensee compliance with regulations, conducts inspections, and monitors adherence to licence conditions and regulatory requirements.',
    functions: ['Licence compliance monitoring', 'Regulatory inspections', 'Consumer complaint investigation', 'Enforcement actions'],
  },
  {
    name: 'Technical Services',
    head: 'Department Head',
    title: 'Director',
    color: '#C8237B',
    icon: Radio,
    desc: 'Manages radio frequency spectrum, type approval of equipment, quality of service monitoring, and technical standards development.',
    functions: ['Spectrum management & planning', 'Type approval certification', 'QoS monitoring & reporting', 'Technical standards development'],
  },
  {
    name: 'Licensing',
    head: 'Department Head',
    title: 'Director',
    color: '#6BBE4E',
    icon: Award,
    desc: 'Processes licence applications, manages licence renewals, and maintains the registry of licensed operators across all sectors.',
    functions: ['Licence application processing', 'Licence renewals & amendments', 'Operator registry management', 'Fee collection & administration'],
  },
  {
    name: 'Broadband & Universal Service',
    head: 'Department Head',
    title: 'Director',
    color: '#F7B731',
    icon: Wifi,
    desc: 'Implements the Universal Access Service Fund (UASF) and broadband expansion projects to extend coverage to underserved and rural areas.',
    functions: ['UASF project management', 'Broadband strategy implementation', 'Rural connectivity expansion', 'Digital inclusion programmes'],
  },
  {
    name: 'Business Development',
    head: 'Department Head',
    title: 'Director',
    color: '#7C3AED',
    icon: BarChart3,
    desc: 'Drives strategy, research, market analysis, and stakeholder engagement to inform regulatory decisions and industry development.',
    functions: ['Strategic planning & research', 'Market analysis & statistics', 'Stakeholder engagement', 'Industry benchmarking'],
  },
  {
    name: 'Corporate Communications & Relations',
    head: 'Department Head',
    title: 'Director',
    color: '#00A6CE',
    icon: Globe,
    desc: 'Manages public affairs, media relations, consumer education, and BOCRA\'s public image and outreach programmes.',
    functions: ['Public affairs & media relations', 'Consumer education campaigns', 'Website & digital presence', 'Public consultations'],
  },
  {
    name: 'Legal, Compliance & Board Secretary',
    head: 'Department Head',
    title: 'Director',
    color: '#DC2626',
    icon: Scale,
    desc: 'Provides legal advice, manages governance and board affairs, handles dispute resolution, and ensures regulatory compliance.',
    functions: ['Legal advisory services', 'Board secretariat & governance', 'Dispute resolution', 'Regulatory compliance framework'],
  },
  {
    name: 'Finance',
    head: 'Department Head',
    title: 'Director',
    color: '#059669',
    icon: FileText,
    desc: 'Manages financial planning, budgeting, accounting, procurement, and financial reporting for the Authority.',
    functions: ['Financial management & reporting', 'Budget planning & control', 'Procurement & tenders', 'Revenue management'],
  },
  {
    name: 'Corporate Support',
    head: 'Department Head',
    title: 'Director',
    color: '#64748B',
    icon: Building,
    desc: 'Handles human resources, administration, facilities management, IT infrastructure, and organisational development.',
    functions: ['Human resources management', 'ICT & infrastructure', 'Facilities management', 'Training & development'],
  },
];

const OBJECTIVES = [
  { title: 'Promote Competition', desc: 'Foster a competitive market that benefits consumers', icon: BarChart3, color: '#00A6CE' },
  { title: 'Universal Access', desc: 'Expand communications services to all Batswana', icon: Wifi, color: '#6BBE4E' },
  { title: 'Consumer Protection', desc: 'Safeguard the interests of communications consumers', icon: Shield, color: '#C8237B' },
  { title: 'Resource Optimisation', desc: 'Efficient management of spectrum and national resources', icon: Radio, color: '#F7B731' },
  { title: 'Talent Development', desc: 'Build a skilled and motivated workforce', icon: Users, color: '#7C3AED' },
  { title: 'Stakeholder Engagement', desc: 'Meaningful engagement with industry and public', icon: Globe, color: '#00458B' },
];

export default function OrganogramPage() {
  const [expandedDept, setExpandedDept] = useState(null);
  const heroRef = useScrollReveal();
  const deptRef = useStaggerReveal({ stagger: 0.06 });
  const objRef = useStaggerReveal({ stagger: 0.08 });

  const ceDept = DEPARTMENTS.find(d => d.isTop);
  const depts = DEPARTMENTS.filter(d => !d.isTop);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">Home</Link>
            <ChevronRight size={14} />
            <Link to="/about/profile" className="hover:text-bocra-blue">About</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">Organogram</span>
          </nav>
        </div>
      </div>

      <PageHero category="ABOUT" title="Organisational Structure" description="BOCRA is structured into specialised departments under the leadership of the Chief Executive, each focused on a key area of the Authority's mandate." color="blue" />

      {/* Visual Org Chart */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">

          {/* CE Box — Top */}
          <div className="flex justify-center mb-2">
            <Link to="/about/chief-executive" className="bg-gradient-to-br from-[#00458B] to-[#001A3A] text-white rounded-xl p-5 text-center max-w-xs w-full hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <Briefcase size={22} className="text-[#00A6CE]" />
              </div>
              <p className="text-sm font-bold">{ceDept.head}</p>
              <p className="text-[10px] text-white/50">{ceDept.title}</p>
              <p className="text-[10px] text-[#00A6CE] mt-1 opacity-0 group-hover:opacity-100 transition-all">View Profile →</p>
            </Link>
          </div>

          {/* Connector line */}
          <div className="flex justify-center mb-2">
            <div className="w-px h-8 bg-gray-300" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="h-px bg-gray-300" style={{ width: '80%' }} />
          </div>

          {/* Board */}
          <div className="flex justify-center mb-6">
            <Link to="/about/board" className="bg-white border-2 border-[#00A6CE]/20 rounded-xl px-5 py-3 text-center hover:border-[#00A6CE] hover:shadow-md transition-all">
              <p className="text-xs font-bold text-bocra-slate">Board of Directors</p>
              <p className="text-[10px] text-bocra-slate/40">Chaired by Dr. Bokamoso Basutli</p>
            </Link>
          </div>

          {/* Department Grid */}
          <h3 className="text-lg font-bold text-bocra-slate text-center mb-6">Departments</h3>
          <div ref={deptRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {depts.map(dept => {
              const isExpanded = expandedDept === dept.name;
              return (
                <button
                  key={dept.name}
                  onClick={() => setExpandedDept(isExpanded ? null : dept.name)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all text-left w-full"
                >
                  <div className="h-1.5" style={{ background: dept.color }} />
                  <div className="p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${dept.color}12` }}>
                        <dept.icon size={16} style={{ color: dept.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-bocra-slate truncate">{dept.name}</p>
                        <p className="text-[10px] text-gray-400">{dept.title}</p>
                      </div>
                      <ChevronDown size={14} className={`text-gray-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    <p className="text-[11px] text-bocra-slate/50 leading-relaxed">{dept.desc}</p>

                    {isExpanded && dept.functions && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                        {dept.functions.map((fn, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dept.color }} />
                            <p className="text-[10px] text-bocra-slate/60">{fn}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Organisational Objectives */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <h3 className="text-lg font-bold text-bocra-slate text-center mb-2">Organisational Objectives</h3>
          <p className="text-sm text-bocra-slate/40 text-center mb-6">The strategic goals that guide BOCRA's operations</p>
          <div ref={objRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {OBJECTIVES.map(obj => (
              <div key={obj.title} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: `${obj.color}12` }}>
                  <obj.icon size={18} style={{ color: obj.color }} />
                </div>
                <p className="text-[11px] font-bold text-bocra-slate">{obj.title}</p>
                <p className="text-[9px] text-bocra-slate/40 mt-0.5">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-8">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Chief Executive', path: '/about/chief-executive', icon: Briefcase, color: '#00458B' },
              { label: 'Board of Directors', path: '/about/board', icon: Users, color: '#00A6CE' },
              { label: 'Executive Management', path: '/about/executive-management', icon: Award, color: '#C8237B' },
              { label: 'About BOCRA', path: '/about/profile', icon: BookOpen, color: '#6BBE4E' },
            ].map(link => (
              <Link key={link.path} to={link.path} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}12` }}>
                  <link.icon size={16} style={{ color: link.color }} />
                </div>
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
