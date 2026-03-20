/**
 * ============================================================================
 * BOCRA LICENSING HUB — Apply For A Licence
 * ============================================================================
 * 13 licence types, all with HD banner images, PDF downloads, sidebar selector
 * Cards use navigate() not <a> tags to prevent scroll-to-footer bug
 * ============================================================================
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { useAuth } from '../../lib/auth';
import { sanitizeHtml } from '../../lib/sanitizeHtml';
import {
  FileText, Download, ChevronDown, ChevronRight, ArrowLeft,
  Radio, Wifi, Tv, Globe, Shield, Satellite, Phone,
  AlertCircle, Award, CheckCircle, Send, User, Mail, Building, MapPin, Lock
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';

gsap.registerPlugin(ScrollTrigger);
const B = import.meta.env.BASE_URL || '/';

const C = { cyan:'#00A6CE', magenta:'#C8237B', yellow:'#F7B731', green:'#6BBE4E', blue:'#00458B', dark:'#001A3A' };
const CR = [C.cyan, C.magenta, C.yellow, C.green];
const IC = {
  'aircraft-radio':Radio,'amateur-radio':Radio,'broadcasting':Tv,'cellular':Phone,
  'citizen-band-radio':Radio,'point-to-multipoint':Wifi,'point-to-point':Wifi,
  'private-radio':Radio,'radio-dealers':Shield,'radio-frequency':Radio,
  'satellite-service':Satellite,'type-approval':Award,'vans':Globe,
};

const INTRO = `<p>The Botswana Communications Regulatory Authority (BOCRA) is responsible for planning and managing the radio frequency spectrum in Botswana. It is responsible for compliance with licensing requirements and investigating complaints of interference to services.</p><p>The scope of BOCRA&rsquo;s role includes:</p><ul><li>Spectrum planning</li><li>Frequency allocation</li><li>Apparatus licensing</li><li>Frequency assignment and coordination</li></ul>`;
const DL = `<p>To begin the licence application process, download the application form below, fill in and submit to BOCRA with all relevant documentation.</p>`;

/* ── ALL 13 LICENCES — every one has a banner now ── */
const LICENCES = [
  { slug:'aircraft-radio', title:'Aircraft Radio Licence', short:'Aircraft Radio',
    banner:`${B}images/licences/air_radio.jpg`,
    pdf:`${B}documents/Aircraft_Radio_Licence_Application.pdf`, pdfName:'Aircraft Radio Licence Application.pdf', pdfSize:'124.21 KB',
    colour:C.cyan, content: INTRO + DL },
  { slug:'amateur-radio', title:'Amateur Radio Licence', short:'Amateur Radio',
    banner:`${B}images/licences/amateur.jpg`,
    pdf:`${B}documents/Amateur__Application_Form.pdf`, pdfName:'Amateur Application Form.pdf', pdfSize:'106.94 KB',
    colour:C.green, content: INTRO + DL },
  { slug:'broadcasting', title:'Broadcasting Licence', short:'Broadcasting',
    banner:`${B}images/licences/broadcast.png`,
    pdf:null, pdfName:null, pdfSize:null,
    colour:C.magenta, content: INTRO + `<p>To <strong>begin the licence application process</strong> download the application form below, fill in and submit to BOCRA with all relevant documentation.</p>` },
  { slug:'cellular', title:'Cellular Licence', short:'Cellular',
    banner:`${B}images/licences/cellular.jpg`,
    pdf:`${B}documents/Cellular_Licence_Application.pdf`, pdfName:'Cellular Licence Application.pdf', pdfSize:'~160 KB',
    colour:C.yellow, content: INTRO + DL },
  { slug:'citizen-band-radio', title:'Citizen Band Radio Licence', short:'Citizen Band Radio',
    banner:`${B}images/licences/citizen_band.jpg`,
    pdf:`${B}documents/Citizen_Band_Radio_Licence_Application.pdf`, pdfName:'Citizen Band Radio Licence Application.pdf', pdfSize:'106.25 KB',
    colour:C.cyan, content: INTRO + DL },
  { slug:'point-to-multipoint', title:'Point-to-Multipoint Licence', short:'Point-to-Multipoint',
    banner:`${B}images/licences/point_to_multipoint.jpg`,
    pdf:`${B}documents/Point-to-Multipoint_Licence_Application.pdf`, pdfName:'Point-to-Multipoint Licence Application.pdf', pdfSize:'149.7 KB',
    colour:C.green, content: INTRO + DL },
  { slug:'point-to-point', title:'Point-to-Point Licence', short:'Point-to-Point',
    banner:`${B}images/licences/point_to_point.jpg`,
    pdf:`${B}documents/Point-To-Point_Application.pdf`, pdfName:'Point-To-Point Application.pdf', pdfSize:'115.73 KB',
    colour:C.magenta, content: INTRO + DL },
  { slug:'private-radio', title:'Private Radio Communication Licence', short:'Private Radio',
    banner:`${B}images/licences/private_radio.jpg`,
    pdf:`${B}documents/Private_Radio_Application_Form.pdf`, pdfName:'Private Radio Application Form.pdf', pdfSize:'176.02 KB',
    colour:C.yellow, content: INTRO + DL },
  { slug:'radio-dealers', title:'Radio Dealers Licence', short:'Radio Dealers',
    banner:`${B}images/licences/radio_dealer.png`,
    pdf:null, pdfName:null, pdfSize:null, colour:C.green,
    content: `<p>Any business involved in supplying and installing telecommunications equipment for clients will need to be licensed as a radio dealer in Botswana. The licence will enable a company to import, sell, or install radio communications equipment into Botswana. To protect Botswana consumers, BOCRA has to certify itself that the company is capable of selling and supporting Telecommunication equipment it is selling.</p><p>The following are the conditions for the radio dealers licence:</p><h3>Particulars Of The Applicant</h3><ul><li>A complete ownership profile of your company must be provided, listing all the directors and their equity holding in Pula</li><li>The applicant must state whether it is a member of a group, and if so, the ownership must detail ownership of the subsidiaries from the ultimate parent company of the group to the applicant</li><li>With respect to juristic person, the nature of the juristic person must be disclosed, i.e. whether company (in which the event it should be disclosed whether it is a private or public or closed corporation, or a trust or a partnership)</li></ul><h3>Technical Information</h3><ul><li>The applicant must provide detailed information about its technical experience and capability for the authority to assess whether the applicant has sufficient technical experience and capability to be a radio dealer</li><li>The applicant must provide a list of all test instruments it has which it will use for installation and maintenance of the radio equipment</li><li>The applicant must provide the profile of its technical staff</li></ul><h3>Financial Information</h3><ul><li>The capacity and resources available to trade on radio equipment</li><li>The authority shall be entitled to request written proof for any of the particulars disclosed</li></ul>` },
  { slug:'radio-frequency', title:'Radio Frequency Licence', short:'Radio Frequency',
    banner:`${B}images/licences/radio_freq.jpg`,
    pdf:null, pdfName:null, pdfSize:null,
    colour:C.cyan, content: INTRO + DL },
  { slug:'satellite-service', title:'Satellite Service Licence', short:'Satellite Service',
    banner:`${B}images/licences/satellite_service.jpg`,
    pdf:`${B}documents/Satelllite_Service_Application_Form.pdf`, pdfName:'Satellite Service Application Form.pdf', pdfSize:'~155 KB',
    colour:C.magenta, content: INTRO + DL },
  { slug:'type-approval', title:'Type Approval Licence', short:'Type Approval',
    banner:`${B}images/licences/type_approval.webp`,
    pdf:`${B}documents/Type_Approval_Application.pdf`, pdfName:'Type Approval Application.pdf', pdfSize:'201.89 KB',
    colour:C.yellow,
    pdf2:`${B}documents/Type_Approval_Guidelines_0.pdf`, pdf2Name:'Type Approval Guidelines.pdf', pdf2Size:'227.41 KB',
    content: `<p>BOCRA&rsquo;s mandate to type approve equipment is provided in the Telecommunications Act of 1996, Section 21 and Part IV of the Telecommunications Regulations of 1997. Type approval is required for all telecommunications and radio-communications equipment.</p><p>The Department carries out equipment type approvals and maintenance of a type approval register. The Department also develops type approval guidelines and regulations.</p><p>The equipment type approval is necessary:</p><ul><li>To prevent any technical harm to the public network, by ensuring conformance to set standards</li><li>To prevent the emissions of electro-magnetic radiation above prescribed levels and provide safety to network, personnel and users operating the equipment</li><li>To ensure inter-operability of networks</li></ul><p>In carrying out the type approval process, BOCRA may recognize type approval certificates and test reports from type approving authorities and testing laboratories of other countries, especially those in Region 1 of the ITU.</p>` },
  { slug:'vans', title:'VANS Licence', short:'VANS',
    banner:`${B}images/licences/vans_licence.jpg`,
    pdf:null, pdfName:null, pdfSize:null, colour:C.green,
    content: `<p>Applicants should furnish the Authority with the following information:</p><h3>Particulars Of The Applicant</h3><ul><li>Provide certified copy of certificate of incorporation or certificate of registration of the company</li><li>A complete ownership profile must be provided, listing all the Shareholders, their nationalities, their physical and postal addresses and their shareholding</li><li>Disclose the Directorship of the company. We require certified copies of Form 2A and 2B. Form 2E is required if the company is Close Company</li><li>It must be indicated whether your company is a member of a group, and if so, give details of the ownership profile of the subsidiaries from the ultimate parent company</li><li>The nature of the company must be disclosed i.e. whether it is a private or public company incorporated in terms of the Companies Act</li><li>The company must have a registered office in Botswana. Provide details of Registered Office i.e. certified copy of Form 2</li><li>Provide contact details of the Registered Office</li></ul><h3>Business Plan</h3><p>Provide a 3-year business plan of your proposed project. The business plan must at a minimum show the following:</p><ul><li>A statement on how the applicant will be different from other players in the market</li><li>Services on offer and how such services will benefit the market</li><li>Description of aftersales support structures for customers</li><li>Target market</li><li>Pricing for the services</li><li>3 year financial projections of the Cash Flows and Income Statement</li><li>A statement of commitment indicating the date of commencement of operations</li><li>Proof of funding</li></ul><h3>Technical Information</h3><p>The configuration and description of all the technical aspects of the network as well as the equipment that will be used must be fully disclosed:</p><ul><li>Network diagram/configuration</li><li>The description of all interfaces within the network</li><li>Description of major equipment that will form the core components of the network</li><li>Applicants must include brief CVs of technical experience and managerial capability of the personnel</li><li>Applicant must show if there is any job creation and transfer of skills to local personnel</li></ul><h3>Applicable Fees</h3><ul><li>An initial licence fee of <strong>P10,000</strong> (ten thousand Pula)</li><li>An annual fee of <strong>P3,000</strong> (three thousand Pula)</li><li>All licence fees attract a <strong>12% Value Added Tax</strong></li><li>Fees for spectrum are based on spectrum requirements and considered on a case-by-case basis</li><li>BOCRA reserves the right to change these fees from time to time</li><li>Licence is valid for <strong>15 years</strong></li></ul>` },
];

/* ── Sidebar ── */
function Sidebar({ slug, nav }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const cur = LICENCES.find(l => l.slug === slug);

  return (
    <div className="lg:w-80 flex-shrink-0">
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-[#001A3A] rounded-2xl p-5 sm:p-6 text-white shadow-xl">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Apply For A Licence</h3>
          <div className="flex items-start gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-[#00A6CE]" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed">Choose the type of licence you are applying for from the following list</p>
          </div>
          <div ref={ref} className="relative">
            <button onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-sm transition-all duration-200">
              <span className="text-white/90 truncate">{cur?.short || 'Choose a Licence'}</span>
              <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-72 overflow-y-auto">
                {LICENCES.map(l => {
                  const active = l.slug === slug;
                  const Ic = IC[l.slug] || FileText;
                  return (
                    <button key={l.slug}
                      onClick={() => { nav(`/licensing/${l.slug}`); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${active ? 'bg-blue-50 text-[#00458B] font-semibold' : 'text-gray-700'}`}>
                      <Ic className="w-4 h-4 flex-shrink-0" style={{ color: l.colour }} />
                      <span className="flex-1 truncate">{l.short}</span>
                      {active && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#00458B] mb-3">Complaints Process</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">BOCRA will investigate a consumer complaint against a service provider if there is sufficient evidence to establish.</p>
          <Link to="/services/file-complaint" className="block w-full text-center bg-[#00A6CE] hover:bg-[#0090B5] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">File A Complaint</Link>
        </div>
      </div>
    </div>
  );
}

/* ── PDF Card ── */
function PdfCard({ url, name, size }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00A6CE] hover:shadow-lg transition-all duration-200 group">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-[#00458B] group-hover:text-[#00A6CE] transition-colors truncate">{name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{size}</p>
      </div>
      <Download className="w-5 h-5 text-gray-300 group-hover:text-[#00A6CE] transition-all duration-200 group-hover:-translate-y-0.5 flex-shrink-0" />
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * GRID VIEW — All 13 licence cards, consistent design, HD images
 * ══════════════════════════════════════════════════════════════════════ */
function Grid({ nav }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current.querySelectorAll('.lc'),
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%' } });
  }, []);

  /* Navigate on card click — NOT an <a> tag to avoid scroll/hash issues */
  const go = useCallback((slug) => {
    nav(`/licensing/${slug}`);
    /* Layout handles scrollTo — don't duplicate here */
  }, [nav]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">Home</Link>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></span>
            <span className="text-bocra-slate font-medium">Licensing</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero category="LICENSING" title="Apply For A Licence" description="BOCRA is responsible for planning and managing the radio frequency spectrum in Botswana. Choose a licence type below to view requirements and download application forms." color="green" />

      {/* Cards */}
      <section className="py-8">
        <div className="section-wrapper">
          <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {LICENCES.map((l, i) => {
          const Ic = IC[l.slug] || FileText;
          const c = CR[i % 4];
          return (
            <div key={l.slug}
              role="button" tabIndex={0}
              onClick={() => go(l.slug)}
              onKeyDown={e => { if (e.key === 'Enter') go(l.slug); }}
              className="lc group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A6CE]/40">

              {/* Image — consistent height, object-cover, no pixelation */}
              <div className="relative h-36 sm:h-40 overflow-hidden">
                <img
                  src={l.banner}
                  alt={l.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* Colour accent line at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5" style={{ backgroundColor: c }} />
              </div>

              {/* Info */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c}12` }}>
                    <Ic className="w-4 h-4" style={{ color: c }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#00458B] text-sm leading-tight group-hover:text-[#00A6CE] transition-colors">{l.title}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {l.pdf ? (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><FileText className="w-3 h-3 text-green-500" />Form available</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><AlertCircle className="w-3 h-3" />Contact BOCRA</span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ color: c }}>
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * DETAIL VIEW — Individual licence page
 * ══════════════════════════════════════════════════════════════════════ */
/* ── Licence Application Form — Download PDF, fill, upload back ── */
function LicenceApplicationForm({ licence }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState('');
  const fileRef = useRef(null);
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { executeRecaptcha } = useRecaptcha();

  // Auto-fill form if logged in — fallback chain:
  // 1. Auth user metadata (always available)
  // 2. Operators table (if extended with user profiles)
  // 3. Profiles table (auto-created on signup, may have phone)
  useEffect(() => {
    if (user) {
      (async () => {
        let fullName = user.user_metadata?.full_name || '';
        let email = user.email || '';
        let phone = '';

        try {
          // Try operator profile first (may not exist if schema wasn't extended)
          const { data: opData } = await supabase
            .from('operators').select('*').eq('user_id', user.id).single();
          if (opData) {
            fullName = ((opData.first_name || '') + ' ' + (opData.last_name || '')).trim() || fullName;
            email = opData.email || email;
            phone = opData.phone || '';
          }
        } catch (_) { /* operators table may lack user_id column */ }

        if (!phone) {
          try {
            const { data: profile } = await supabase
              .from('profiles').select('full_name, phone').eq('id', user.id).single();
            if (profile) {
              fullName = fullName || profile.full_name || '';
              phone = profile.phone || '';
            }
          } catch (_) { /* profile may not exist yet */ }
        }

        setForm(f => ({ ...f, fullName, email, phone }));
      })();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const ref = 'LIC-' + licence.slug.toUpperCase().slice(0, 4) + '-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000 + 1000));
    try {
      const { error } = await supabase.from('licence_applications').insert([{
        licence_type: licence.title,
        licence_slug: licence.slug,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        omang: '',
        purpose: 'Application submitted with uploaded form',
        reference_number: ref,
        status: 'pending',
        operator_user_id: user?.id || null,
      }]);
      if (error) {
        console.error('[BOCRA] Licence application insert error:', error.message);
        setSubmitError(error.message);
      } else {
        setRefNum(ref);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('[BOCRA] Network error submitting application:', err);
      setSubmitError('Unable to submit. Please check your connection and try again.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="mt-6 sm:mt-8 p-6 sm:p-8 bg-green-50 rounded-2xl border border-green-200 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-7 h-7 text-green-600" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Application Submitted Successfully</h3>
        <p className="text-sm text-gray-600 mb-3">Your {licence.title} application has been received by BOCRA. A confirmation will be sent to <strong>{form.email}</strong>.</p>
        <div className="inline-block px-5 py-2.5 bg-white rounded-lg text-lg font-mono font-bold text-[#00458B] border border-green-200 mb-4">{refNum}</div>
        <p className="text-xs text-gray-400">Save this reference number. BOCRA will review your application and respond within 10 business days.</p>
      </div>
    );
  }

  // Auth gate — must be logged in to apply
  if (!user) {
    return (
      <div className="mt-6 sm:mt-8">
        <div className="p-6 sm:p-8 rounded-2xl border-2 border-[#00458B]/20 bg-[#00458B]/5 text-center">
          <Lock className="w-10 h-10 text-[#00458B] mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#00458B] mb-2">Registration Required</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
            You must be registered and signed in to your BOCRA operator account before applying for a licence. This ensures your application is linked to your company profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/services/asms-webcp" className="px-6 py-3 bg-[#00458B] text-white font-semibold text-sm rounded-xl hover:bg-[#003366] transition-all inline-flex items-center justify-center gap-2">
              Register / Sign In
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">Already registered? <Link to="/services/asms-webcp" className="text-[#00A6CE] hover:underline">Sign in to your operator account</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      <div className="p-5 sm:p-6 rounded-2xl border-2" style={{ borderColor: licence.colour + '30', backgroundColor: licence.colour + '05' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: licence.colour + '15' }}>
            <Send className="w-5 h-5" style={{ color: licence.colour }} />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#00458B]">Submit Your Application</h3>
            <p className="text-xs text-gray-500">Upload your completed {licence.short} application form</p>
          </div>
        </div>

        {/* Step instructions */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">How to apply</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: licence.colour + '15', color: licence.colour }}>1</span>
              <p className="text-sm text-gray-600"><strong>Download</strong> the application form above{licence.pdf ? '' : ' (contact BOCRA if not available online)'}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: licence.colour + '15', color: licence.colour }}>2</span>
              <p className="text-sm text-gray-600"><strong>Fill in</strong> all required fields in the form, print and sign it, then scan or photograph it as a PDF</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: licence.colour + '15', color: licence.colour }}>3</span>
              <p className="text-sm text-gray-600"><strong>Upload</strong> the completed form below with your contact details and submit</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact details */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3.5 h-3.5" /> Your Contact Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                <input required type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] focus:ring-2 focus:ring-[#00A6CE]/10 outline-none" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Email Address *</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] outline-none" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+267" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#00A6CE] outline-none" /></div>
            </div>
          </div>

          {/* File upload */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3"><FileText className="w-3.5 h-3.5" /> Completed Application Form</p>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-[#00A6CE] hover:bg-[#00A6CE]/5'}`}>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB · Click to change file</p>
                  </div>
                </div>
              ) : (
                <>
                  <Download className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">Click to upload your completed application form</p>
                  <p className="text-xs text-gray-400 mt-1">Accepted: PDF, Word, JPG, PNG — max 10MB</p>
                </>
              )}
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{submitError}</div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-gray-400 max-w-xs">By submitting, you agree that BOCRA may contact you. Your data is protected under the Data Protection Act 2018.</p>
            <button type="submit" disabled={!file || !form.fullName || !form.email || !form.phone || submitting}
              className="px-6 py-3 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed" style={{ backgroundColor: licence.colour }}>
              <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Detail({ licence: l, nav }) {
  const ref = useRef(null);
  useEffect(() => {
    /* Don't scrollTo here — Layout already does it on pathname change */
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [l.slug]);

  return (
    <div>
      {/* Banner — HD, object-cover, consistent height */}
      <div className="relative h-44 sm:h-56 lg:h-72 mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-lg">
        <img src={l.banner} alt={l.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-1 rounded-full" style={{ backgroundColor: l.colour }} />
            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Licence</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white drop-shadow-lg">{l.title}</h1>
        </div>
      </div>

      {/* Back */}
      <button onClick={() => nav('/licensing')}
        className="flex items-center gap-2 text-sm text-[#00A6CE] hover:text-[#00458B] font-medium mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to All Licences</span>
      </button>

      {/* Two columns — stacks on mobile */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div ref={ref} className="flex-1 min-w-0">
          <div className="content-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(l.content) }} />

          {(l.pdf || l.pdf2) && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-[#00458B] uppercase tracking-widest mb-3">
                {l.pdf2 ? 'Licence Files' : 'Licence File'}
              </h3>
              <PdfCard url={l.pdf} name={l.pdfName} size={l.pdfSize} />
              <PdfCard url={l.pdf2} name={l.pdf2Name} size={l.pdf2Size} />
            </div>
          )}

          {!l.pdf && !l.pdf2 && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Application Form Not Available Online</p>
                  <p className="text-sm text-amber-700 mt-1">Please contact BOCRA directly or visit the{' '}
                    <a href="https://op-web.bocra.org.bw/" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-amber-900">BOCRA Portal</a>
                    {' '}for this licence application.</p>
                </div>
              </div>
            </div>
          )}

          {/* Online Application Form */}
          <LicenceApplicationForm licence={l} />
        </div>

        <Sidebar slug={l.slug} nav={nav} />
      </div>
    </div>
  );
}

/* ── Main Export ── */
export default function LicensingHubPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const l = slug ? LICENCES.find(x => x.slug === slug) : null;

  if (slug && !l) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-[#00458B] mb-2">Licence Not Found</h1>
      <button onClick={() => nav('/licensing')} className="inline-flex items-center gap-2 px-6 py-3 bg-[#00A6CE] text-white rounded-xl font-semibold hover:bg-[#0090B5] transition-colors mt-4">
        <ArrowLeft className="w-4 h-4" /> Back to All Licences
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {l ? <Detail licence={l} nav={nav} /> : <Grid nav={nav} />}
    </div>
  );
}
