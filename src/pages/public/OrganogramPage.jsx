/**
 * OrganogramPage.jsx — BOCRA Organisational Structure
 * Animated org tree with GSAP — lines draw themselves, nodes fade in
 * Route: /about/organogram
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ChevronRight, Users, Shield, BarChart3, Radio, Briefcase,
  Globe, Scale, Award, Wifi, BookOpen, Building, FileText,
  ChevronDown
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

gsap.registerPlugin(ScrollTrigger);

const DEPARTMENTS = [
  { name: 'Compliance & Monitoring', icon: Shield, color: '#00A6CE', desc: 'Licensee compliance, inspections, enforcement', functions: ['Licence compliance monitoring', 'Regulatory inspections', 'Consumer complaint investigation', 'Enforcement actions'] },
  { name: 'Technical Services', icon: Radio, color: '#C8237B', desc: 'Spectrum, type approval, QoS monitoring', functions: ['Spectrum management & planning', 'Type approval certification', 'QoS monitoring & reporting', 'Technical standards'] },
  { name: 'Licensing', icon: Award, color: '#6BBE4E', desc: 'Licence applications, renewals, registry', functions: ['Application processing', 'Licence renewals', 'Operator registry', 'Fee administration'] },
  { name: 'Broadband & Universal Service', icon: Wifi, color: '#F7B731', desc: 'UASF, broadband expansion, rural coverage', functions: ['UASF projects', 'Broadband strategy', 'Rural connectivity', 'Digital inclusion'] },
  { name: 'Business Development', icon: BarChart3, color: '#7C3AED', desc: 'Strategy, research, market analysis', functions: ['Strategic planning', 'Market analysis', 'Stakeholder engagement', 'Industry benchmarking'] },
  { name: 'Corporate Communications', icon: Globe, color: '#0891B2', desc: 'Public affairs, media, consumer education', functions: ['Media relations', 'Consumer education', 'Digital presence', 'Public consultations'] },
  { name: 'Legal & Board Secretary', icon: Scale, color: '#DC2626', desc: 'Legal affairs, governance, disputes', functions: ['Legal advisory', 'Board secretariat', 'Dispute resolution', 'Compliance framework'] },
  { name: 'Finance', icon: FileText, color: '#059669', desc: 'Financial management, procurement', functions: ['Financial reporting', 'Budget control', 'Procurement & tenders', 'Revenue management'] },
  { name: 'Corporate Support', icon: Building, color: '#64748B', desc: 'HR, administration, IT, facilities', functions: ['Human resources', 'ICT infrastructure', 'Facilities', 'Training & development'] },
];

const OBJECTIVES = [
  { title: 'Competition', icon: BarChart3, color: '#00A6CE' },
  { title: 'Universal Access', icon: Wifi, color: '#6BBE4E' },
  { title: 'Consumer Protection', icon: Shield, color: '#C8237B' },
  { title: 'Resource Optimisation', icon: Radio, color: '#F7B731' },
  { title: 'Talent Development', icon: Users, color: '#7C3AED' },
  { title: 'Stakeholder Engagement', icon: Globe, color: '#00458B' },
];

export default function OrganogramPage() {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const treeRef = useRef(null);
  const boardRef = useRef(null);
  const ceRef = useRef(null);
  const lineRefs = useRef([]);
  const deptRefs = useRef([]);
  const objRef = useRef(null);

  useEffect(() => {
    if (!treeRef.current) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: treeRef.current, start: 'top 80%' };

      // Board node
      gsap.fromTo(boardRef.current,
        { opacity: 0, y: -30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)', scrollTrigger: trigger }
      );

      // Connector lines draw in
      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { scaleY: 0, transformOrigin: 'top' },
          { scaleY: 1, duration: 0.4, delay: 0.3 + i * 0.15, ease: 'power2.out', scrollTrigger: trigger }
        );
      });

      // CE node
      gsap.fromTo(ceRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.7, delay: 0.4, ease: 'back.out(1.7)', scrollTrigger: trigger }
      );

      // CE glow pulse
      gsap.to('.ce-glow', {
        boxShadow: '0 0 40px rgba(0, 166, 206, 0.25)',
        repeat: -1, yoyo: true, duration: 2.5, ease: 'sine.inOut',
      });

      // Department cards
      deptRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, y: 40, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.7 + i * 0.07, ease: 'back.out(1.2)', scrollTrigger: trigger }
        );
      });

      // Objectives
      if (objRef.current) {
        gsap.fromTo(objRef.current.children,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.4, ease: 'back.out(1.2)',
            scrollTrigger: { trigger: objRef.current, start: 'top 85%' }
          }
        );
      }
    }, treeRef);

    return () => ctx.revert();
  }, []);

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

      <PageHero category="ABOUT" categoryTn="KA GA RONA" title="Organisational Structure" titleTn="Thulaganyo ya Setheo" description="BOCRA is structured into specialised departments under the leadership of the Chief Executive, each focused on a key area of the Authority's mandate." descriptionTn="BOCRA e bopilwe ka mafapha a a ikgethegileng ka fa tlase ga botsamaisi jwa Mokaedi Mogolo." color="blue" />

      {/* Animated Org Tree */}
      <section className="py-10 overflow-hidden" ref={treeRef}>
        <div className="section-wrapper max-w-6xl">

          {/* Board */}
          <div className="flex justify-center" ref={boardRef} style={{ opacity: 0 }}>
            <Link to="/about/board" className="bg-white border-2 border-[#00A6CE]/20 rounded-2xl px-8 py-5 text-center hover:border-[#00A6CE] hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A6CE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-[#00A6CE]/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Users size={20} className="text-[#00A6CE]" />
                </div>
                <p className="text-sm font-bold text-bocra-slate">{lang === 'tn' ? 'Lekgotla la Batlhankedi' : 'Board of Directors'}</p>
                <p className="text-[10px] text-bocra-slate/40">Chaired by Dr. Bokamoso Basutli</p>
              </div>
            </Link>
          </div>

          {/* Line: Board → CE */}
          <div className="flex justify-center" ref={el => lineRefs.current[0] = el} style={{ transformOrigin: 'top', transform: 'scaleY(0)' }}>
            <div className="w-0.5 h-8 bg-gradient-to-b from-[#00A6CE]/40 to-[#00458B]/40 rounded-full" />
          </div>

          {/* CE */}
          <div className="flex justify-center" ref={ceRef} style={{ opacity: 0 }}>
            <Link to="/about/chief-executive" className="ce-glow bg-gradient-to-br from-[#00458B] via-[#003366] to-[#001A3A] text-white rounded-2xl p-6 text-center max-w-sm w-full hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00A6CE]/5 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#C8237B]/5 rounded-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-colors duration-300 group-hover:scale-110">
                  <Briefcase size={24} className="text-[#00A6CE]" />
                </div>
                <p className="text-lg font-bold tracking-tight">Mr. Martin Mokgware</p>
                <p className="text-xs text-white/40 mt-0.5">{lang === 'tn' ? 'Mokaedi Mogolo' : 'Chief Executive'}</p>
                <div className="flex justify-center gap-1.5 mt-3">
                  {['#00A6CE','#C8237B','#F7B731','#6BBE4E'].map(c => (
                    <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </Link>
          </div>

          {/* Line: CE → Departments */}
          <div className="flex justify-center" ref={el => lineRefs.current[1] = el} style={{ transformOrigin: 'top', transform: 'scaleY(0)' }}>
            <div className="w-0.5 h-8 bg-gradient-to-b from-[#00458B]/40 to-gray-200 rounded-full" />
          </div>

          {/* Horizontal connector */}
          <div className="flex justify-center mb-2" ref={el => lineRefs.current[2] = el} style={{ transformOrigin: 'top', transform: 'scaleY(0)' }}>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" style={{ width: '90%' }} />
          </div>

          {/* Departments label */}
          <p className="text-[10px] text-bocra-slate/25 uppercase tracking-[0.25em] font-medium text-center mb-5">{lang === 'tn' ? 'Mafapha' : 'Departments'}</p>

          {/* Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEPARTMENTS.map((dept, i) => {
              const isExp = expanded === dept.name;
              const Icon = dept.icon;
              return (
                <div
                  key={dept.name}
                  ref={el => deptRefs.current[i] = el}
                  style={{ opacity: 0 }}
                  onClick={() => setExpanded(isExp ? null : dept.name)}
                  className="cursor-pointer bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group relative"
                >
                  <div className="h-1 transition-all duration-500 group-hover:h-1.5" style={{ background: dept.color }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                    style={{ boxShadow: `inset 0 0 40px ${dept.color}06` }} />
                  <div className="p-4 relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ background: `${dept.color}12` }}>
                        <Icon size={18} style={{ color: dept.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-bocra-slate truncate group-hover:text-[#00458B] transition-colors">{dept.name}</p>
                        <p className="text-[10px] text-bocra-slate/30">Director</p>
                      </div>
                      <ChevronDown size={14} className={`text-gray-300 transition-all duration-300 flex-shrink-0 ${isExp ? 'rotate-180 text-gray-500' : 'group-hover:text-gray-400'}`} />
                    </div>
                    <p className="text-[11px] text-bocra-slate/50 leading-relaxed">{dept.desc}</p>
                    <div className={`overflow-hidden transition-all duration-400 ${isExp ? 'max-h-40 mt-3 pt-3 border-t border-gray-100' : 'max-h-0'}`}>
                      <div className="space-y-1.5">
                        {dept.functions.map((fn, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dept.color, animation: `pulse 2s ease-in-out ${j * 0.2}s infinite` }} />
                            <p className="text-[10px] text-bocra-slate/60">{fn}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <p className="text-[10px] text-bocra-slate/25 uppercase tracking-[0.25em] font-medium text-center mb-4">{lang === 'tn' ? 'Maikemisetso a Togamaano' : 'Strategic Objectives'}</p>
          <div ref={objRef} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {OBJECTIVES.map(obj => {
              const OIcon = obj.icon;
              return (
                <div key={obj.title} className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `${obj.color}10` }}>
                    <OIcon size={16} style={{ color: obj.color }} />
                  </div>
                  <p className="text-[10px] font-bold text-bocra-slate leading-tight">{obj.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-6">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: lang === 'tn' ? 'Mokaedi Mogolo' : 'Chief Executive', path: '/about/chief-executive', icon: Briefcase, color: '#00458B' },
              { label: lang === 'tn' ? 'Lekgotla la Batlhankedi' : 'Board of Directors', path: '/about/board', icon: Users, color: '#00A6CE' },
              { label: 'Executive Management', path: '/about/executive-management', icon: Award, color: '#C8237B' },
              { label: lang === 'tn' ? 'Ka ga BOCRA' : 'About BOCRA', path: '/about/profile', icon: BookOpen, color: '#6BBE4E' },
            ].map(link => (
              <Link key={link.path} to={link.path} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${link.color}12` }}>
                  <link.icon size={14} style={{ color: link.color }} />
                </div>
                <span className="text-xs font-medium text-bocra-slate/60 group-hover:text-bocra-slate transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
