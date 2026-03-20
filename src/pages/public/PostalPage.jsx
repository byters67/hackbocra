/**
 * PostalPage.jsx — BOCRA Postal Services Mandate
 * Route: /mandate/postal
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, Package, Globe, Shield, Award, Truck, MapPin, CheckCircle, ArrowRight, Users, Building } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

export default function PostalPage() {
  const { lang } = useLanguage();
  const cardsRef = useStaggerReveal({ stagger: 0.1 });
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue">Home</Link><ChevronRight size={14} /><span className="text-bocra-slate/50">Mandate</span><ChevronRight size={14} /><span className="text-bocra-slate font-medium">Postal Services</span></nav></div></div>
      <PageHero category="MANDATE" categoryTn="TIRAGATSO" title="Postal Services" titleTn="Ditirelo tsa Poso" description="Ensuring safe, reliable, efficient and affordable postal services throughout Botswana — regulating universal and commercial postal operators." descriptionTn="Go netefatsa ditirelo tsa poso tse di babalesegileng, tse di ikanyegang, tse di nonofileng le tse di sa tureng mo Botswana yotlhe." color="yellow" />

      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Taolo ya Ditirelo tsa Poso' : 'Postal Services Regulation'}</h2>
                <div className="space-y-3 text-sm text-bocra-slate/70 leading-relaxed">
                  <p>The CRA Act, 2012 ushered in a new dawn of regulation for the postal sector as BOCRA assumed the mandate of supervising the provision of postal services in Botswana. The CRA Act prohibits any person from providing postal services without a valid licence issued by BOCRA.</p>
                  <p>The Authority is mandated to ensure that there is provision of safe, reliable, efficient and affordable postal services throughout Botswana.</p>
                </div>
              </div>

              {/* Market Structure */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4 flex items-center gap-2"><Package size={18} className="text-[#F7B731]" /> Market Structure</h3>
                <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#F7B731]/10 flex items-center justify-center mb-3"><Mail size={20} className="text-[#F7B731]" /></div>
                    <h4 className="text-sm font-bold text-bocra-slate mb-1">Universal Postal Services</h4>
                    <p className="text-xs text-bocra-slate/60 leading-relaxed">Provided by the Designated Postal Operator (DPO) — Botswana Post. Ensures nationwide mail delivery coverage including rural and remote areas.</p>
                    <div className="mt-3 flex items-center gap-2 p-2 bg-[#F7B731]/5 rounded-lg">
                      <Building size={13} className="text-[#F7B731]" />
                      <span className="text-[11px] font-medium text-bocra-slate">Botswana Post — Designated Postal Operator</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#C8237B]/10 flex items-center justify-center mb-3"><Truck size={20} className="text-[#C8237B]" /></div>
                    <h4 className="text-sm font-bold text-bocra-slate mb-1">Commercial Postal Services</h4>
                    <p className="text-xs text-bocra-slate/60 leading-relaxed">Courier and value-added services provided by licensed Commercial Postal Operators (CPOs). Includes express delivery, parcel services, and logistics.</p>
                    <div className="mt-3 flex items-center gap-2 p-2 bg-[#C8237B]/5 rounded-lg">
                      <Users size={13} className="text-[#C8237B]" />
                      <span className="text-[11px] font-medium text-bocra-slate">Multiple Licensed CPOs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOCRA's Role */}
              <div className="bg-[#F7B731]/5 rounded-xl border border-[#F7B731]/10 p-5">
                <h3 className="text-sm font-bold text-bocra-slate mb-3">{lang === 'tn' ? 'Tiragatso ya BOCRA ya Poso' : "BOCRA's Postal Mandate"}</h3>
                <div className="space-y-2">
                  {[
                    'License and regulate all postal service providers in Botswana',
                    'Ensure universal access to affordable postal services nationwide',
                    'Monitor quality of service and delivery standards',
                    'Resolve consumer complaints related to postal services',
                    'Promote competition in the commercial postal market',
                    'Ensure compliance with international postal conventions (Universal Postal Union)',
                    'Protect postal consumers from unfair practices',
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2"><CheckCircle size={13} className="text-[#F7B731] mt-0.5 flex-shrink-0" /><p className="text-xs text-bocra-slate/60">{r}</p></div>
                  ))}
                </div>
              </div>

              {/* World Post Day */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A6CE]/10 flex items-center justify-center flex-shrink-0"><Globe size={18} className="text-[#00A6CE]" /></div>
                  <div>
                    <h3 className="text-sm font-bold text-bocra-slate mb-1">International Postal Cooperation</h3>
                    <p className="text-xs text-bocra-slate/60 leading-relaxed">Botswana participates in the Universal Postal Union (UPU) and celebrates World Post Day annually. BOCRA works with international partners to improve cross-border postal services and modernise the postal sector.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{lang === 'tn' ? 'Lefapha la Poso' : 'Postal Sector'}</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Designated Postal Operator', value: 'Botswana Post', color: '#F7B731' },
                    { label: lang === 'tn' ? 'Popego ya Mmaraka' : 'Market Structure', value: 'Universal + Commercial', color: '#C8237B' },
                    { label: 'Governing Law', value: 'CRA Act 2012', color: '#00458B' },
                    { label: 'International Body', value: 'UPU Member', color: '#00A6CE' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}><Mail size={14} style={{ color: s.color }} /></div>
                      <div><p className="text-sm font-bold text-bocra-slate">{s.value}</p><p className="text-[10px] text-gray-400">{s.label}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/services/file-complaint" className="flex items-center gap-3 p-4 bg-[#C8237B] rounded-xl text-white hover:bg-[#A01D64] transition-all">
                <Shield size={20} /><div><p className="text-sm font-bold">{lang === 'tn' ? 'Tlhagisa Ngongorego ya Poso' : 'File a Postal Complaint'}</p><p className="text-[10px] text-white/60">Report delivery issues or service problems</p></div><ArrowRight size={16} className="ml-auto" />
              </Link>

              <Link to="/licensing" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <Award size={18} className="text-[#6BBE4E]" /><div><p className="text-xs font-bold text-bocra-slate">{lang === 'tn' ? 'Ikopela Laesense' : 'Apply for a Licence'}</p><p className="text-[10px] text-gray-400">Postal operator licensing</p></div>
              </Link>

              <Link to="/media/speeches" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <Globe size={18} className="text-[#00A6CE]" /><div><p className="text-xs font-bold text-bocra-slate">World Post Day Speeches</p><p className="text-[10px] text-gray-400">View speech archive</p></div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
