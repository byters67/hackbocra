/**
 * Board of Directors Page — BOCRA
 * 
 * Dynamic, interactive board member profiles with photos, bios,
 * expand/collapse detail views, and BOCRA dot colour accents.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ChevronDown, ChevronRight, ChevronLeft, Users, Award, Briefcase,
  GraduationCap, Globe, X, Play, Pause
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

gsap.registerPlugin(ScrollTrigger);
const B = import.meta.env.BASE_URL || '/';

/* ── BOCRA brand colours ── */
const C = {
  blue: '#00458B', cyan: '#00A6CE', magenta: '#C8237B',
  yellow: '#F7B731', green: '#6BBE4E', dark: '#001A3A',
};
const DOT_COLOURS = [C.cyan, C.magenta, C.yellow, C.green];

/* ── Board Members Data ── */
const BOARD_MEMBERS = [
  {
    id: 'basutli',
    name: 'Dr. Bokamoso Basutli, PhD',
    role: 'Chairperson',
    roleTag: 'Board Chairperson',
    photo: `${B}images/board/Dr__Bokamoso_Basutli__-_Chairperson.jpg`,
    colour: C.cyan,
    featured: true,
    bio: [
      'Dr. Bokamoso Basutli is a Professional Engineer and Senior Member of the Institute of Electrical and Electronics Engineers (IEEE). He is currently the Head of the Department of Electrical and Communications Systems Engineering at the Botswana International University of Science and Technology (BIUST), where he leads the delivery and coordination of Satellite Communications, Digital Signal Processing, and Artificial Intelligence (AI) modules. He is IEEE CertifAIEd Assessor, focusing on the ethical implications of Autonomous Intelligent Systems (AIS).',
      'Dr. Basutli serves as a member of the Signal Processing, Networking, and Systems Research (SPNS) Group. He was the Principal Investigator (PI) and originator of the BotswanaSat-1 project, Botswana\u2019s pioneering satellite initiative.',
      'Before joining academia, Dr. Basutli served as an Installation Engineer and later Lead Engineer with Singapore Technologies Electronics (Info-Software Systems). He then worked as a Senior Telecommunications Engineer with the Civil Aviation Authority of Botswana (CAAB). Dr. Basutli has served as the Chairperson, and Vice-Chairperson of the IEEE Botswana Sub-section.',
      'He earned his Ph.D. in Electronics, Electrical, and Systems Engineering from Loughborough University, United Kingdom.',
    ],
  },
  {
    id: 'pusumane',
    name: 'Mr. Moabi Pusumane',
    role: 'Vice Chairperson',
    roleTag: 'Vice Chairperson',
    photo: `${B}images/board/Mr__Moabi_Pusumane__-_Vice_Chairperson.jpg`,
    colour: C.magenta,
    featured: true,
    bio: [
      'Moabi Pusumane is a dynamic and results-driven executive with over 15 years of cross-functional experience in telecommunications, project management, market intelligence, route to market, and commercial leadership. Currently serving as Commercial Director at Coca-Cola Beverages Botswana, with responsibilities that include driving sustainable revenue growth, portfolio innovation, and market expansion.',
      'Moabi specialises in crafting and executing long-term commercial strategies rooted in deep market insights and consumer behavior analysis. His leadership has delivered a 5-year CAGR double digit revenue growth, alongside award-winning marketing campaigns and operational excellence initiatives.',
      'His key achievements include the successful launch of the Schweppes Mixology campaign, which was later adopted across Africa; driving portfolio innovation during the COVID-19 pandemic with the successful introduction of the 1.5L pack; and leading Coca-Cola Beverages Botswana to win the 2023 Africa Customer Excellence Award.',
    ],
  },
  {
    id: 'phuthego',
    name: 'Ms. Montle Phuthego',
    role: 'Board Member',
    roleTag: 'Board Member',
    photo: `${B}images/board/Ms__Montle_Phuthego_-_Member.jpg`,
    colour: C.yellow,
    bio: [
      'Montle Phuthego is a seasoned business development, trade and investment expert who holds a Master of Science Degree in Economics from the University of Warwick in the United Kingdom. She has substantial experience in economic research, business development, trade and investment, coupled with a strong enterprise and experience gained from several executive positions spanning over 20 years, including being the founding Caretaker Chief Executive Officer at SPEDU, Deputy Managing Director at Botswana Development Corporation and other senior executive positions at Botswana Investment and Trade Centre and the Citizen Entrepreneurial Development Agency.',
      'She has previously served on a number of Boards \u2014 SPEDU, Letlole La Rona and Sechaba Brewery Holdings, in the process leading some Board sub-committees. Montle is currently the Country Director for TechnoServe, an international non-profit organisation delivering business solutions that build and strengthen businesses across various sectors. She strongly believes in the power of entrepreneurship and innovation to accelerate inclusive development.',
      'Over the past 5 years, she has led the Tokafala Enterprise and Youth Development programme, delivering impact and touching many lives.',
    ],
  },
  {
    id: 'seleka',
    name: 'Ms. Alta Dimpho Seleka',
    role: 'Board Member',
    roleTag: 'Board Member',
    photo: `${B}images/board/Ms__Alta_Dimpho_Seleka_-_Member.jpg`,
    colour: C.green,
    bio: [
      'Alta Dimpho Seleka is a distinguished finance professional with over two decades of senior leadership in public financial management and fiscal governance. She is a Fellow of both the Association of Chartered Certified Accountants (FCCA-UK) and the Botswana Institute of Chartered Accountants (FCA-BICA), and a member of the Chartered Institute of Public Finance and Accountancy (CIPFA-UK) and the Association of Accounting Technicians (AAT).',
      'As Acting Commissioner for Finance and Administration at the Botswana Unified Revenue Service (BURS), Alta manages multibillion-pula tax revenues and corporate expenditure. Her mandate extends beyond financial reporting and audit oversight to include shared services, procurement, and the human resources functions of the Finance and Administration Division. She has anchored BURS\u2019 compliance with International Public Sector Accounting Standards (IPSAS), International Financial Reporting Standards (IFRS), Generally Accepted Accounting Principles (GAAP), and International Auditing Standards (IAS), while steering modernisation initiatives that strengthen transparency, efficiency, and accountability.',
      'Her impact is visible in some of Botswana\u2019s most ambitious financial reforms: automating the national payments system, integrating electronic tax collection platforms, developing public finance policies aligned with global practice, and overseeing infrastructure upgrades at strategic border posts.',
    ],
  },
  {
    id: 'george',
    name: 'Ms. Lebogang George',
    role: 'Board Member',
    roleTag: 'Board Member',
    photo: `${B}images/board/Ms_Lebogang_George_-_Member.jpg`,
    colour: C.cyan,
    bio: [
      'Lebogang George is a Partner at JLK MCL, and an attorney admitted to the High Courts of Botswana. She has extensive experience in commercial law, procurement law, ICT law, IT governance, and data protection & privacy law in Botswana, South Africa, and the EU. She specialises in drafting and negotiating complex software agreements, commercial agreements and advising clients on compliance and governance matters. Lebogang has a strong track record of developing data strategies, providing data protection and corporate governance training, compliance and corporate commercial law. Her expertise covers the Botswana Data Protection Act, South Africa\u2019s Protection of Personal Information Act and the European General Data Protection Regulation.',
      'She is a thought leader with publications in data protection and has been invited to speak at numerous conferences on data protection and AI.',
      'She also actively contributes to public education and awareness through webinars. Lebogang sits on various boards and board committees, including the Women in Mining Botswana Executive Committee as Secretary, the Association of Women in Mining in Africa Governance, Legal and Compliance Sub-Committee. One of her proudest achievements is her lifetime association with Harvard Law School, where she is a recipient of the Law & Logic Certificate from Harvard Law School and the European University Institute.',
    ],
  },
  {
    id: 'kgafela',
    name: 'Mr. Ronald Kgafela, CODP',
    role: 'Board Member',
    roleTag: 'Board Member',
    photo: `${B}images/board/Mr__Ronald_Kgafela_-_Member.jpg`,
    colour: C.magenta,
    bio: [
      'Ronald Kgafela is a seasoned Human Capital leader with over 20 years of experience spanning Human Resources, Organisational Development, Employment Relations, Change, and Transformation. He is a Certified Professional Business Coach (PBC), a Chartered Organisational Development Practitioner (CODP\u2122), and an Organisational Development Certified Consultant (ODCC) with GIODN.',
      'He holds a Master of Science in Strategic Management (University of Derby), a Bachelor of Administration in Human Resource Management (North-West University), and a Postgraduate Diploma in Labour Law (University of Johannesburg). He further completed the Senior Managers Development Programme (SMDP) at Stellenbosch University.',
      'Ronald\u2019s career spans multiple industries, including utilities, manufacturing, mining, construction, retail, consulting, and banking. He held senior roles such as Head of Organisational Development, Country HR Manager, HR Business Partner, and Acting HR Director at FNBB, and currently serves as Head of HR at NBFIRA.',
      'He is a registered professional with the South African Board for People Practices (SABPP), and a member fellow of global platforms including the Global Academy of Finance and Management (GAFM) and the American Academy of Project Management (AAMP).',
    ],
  },
  {
    id: 'ramojela',
    name: 'Dr. Kennedy Ramojela',
    role: 'Board Member',
    roleTag: 'Board Member',
    photo: `${B}images/board/Dr__Kennedy_Ramojela_-_Member.jpg`,
    colour: C.yellow,
    bio: [
      'Dr. Kennedy Ramojela holds a PhD in Media and Communications from Royal Melbourne Institute of Technology (RMIT) University, Melbourne, Australia. He did Master of Philosophy in film and broadcasting from the University of Southampton, UK. Dr. Ramojela also holds Master of Media Arts from Emerson College, Boston, USA and Bachelor of Arts in Broadcasting and Television Production from Columbia College Chicago, USA.',
      'He is a Media and Communications practitioner and a senior executive with a keen focus on management, operations and strategy. He is highly skilled in strategic planning, project management and leadership and has over two decades of experience across media, creatives and technology organisations such as University of Botswana media studies, Kanamemoy Media, Children\u2019s television and radio workshops, Spotlook newspaper, and Mokopele Express news publishing.',
      'Currently serving as a Media and Communications lecturer at the University of Botswana, Dr. Ramojela oversees and lecturers in all digital media courses in the Department of Media Studies. He has experience in digital technology, digital media, broadcasting, film, television and research. He implemented agile methodologies that aligned media studies programmes with the industry needs in the process saving the Government of Botswana money from sending students outside the country for media studies programmes.',
    ],
  },
];

/* ── Auto-Playing Board Carousel ── */
function BoardCarousel({ members, onSelect }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const photoRef = useRef(null);
  const timerRef = useRef(null);
  const total = members.length;

  const animateTransition = (newIndex) => {
    if (photoRef.current) {
      const dir = direction;
      gsap.fromTo(photoRef.current,
        { opacity: 0, x: dir * 40, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
    setActive(newIndex);
  };

  const goNext = () => {
    setDirection(1);
    animateTransition((active + 1) % total);
  };

  const goPrev = () => {
    setDirection(-1);
    animateTransition((active - 1 + total) % total);
  };

  const goTo = (i) => {
    setDirection(i > active ? 1 : -1);
    animateTransition(i);
  };

  // Auto-play
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActive(prev => {
        const next = (prev + 1) % total;
        if (photoRef.current) {
          gsap.fromTo(photoRef.current,
            { opacity: 0, x: 40, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
          );
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused, total]);

  const m = members[active];

  return (
    <div className="section-wrapper pt-8 sm:pt-12">
      <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
        {/* Main carousel area */}
        <div className="flex flex-col sm:flex-row items-center">

          {/* Left: Photo */}
          <div className="relative w-full sm:w-2/5 lg:w-1/3 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 sm:p-10 min-h-[280px] sm:min-h-[340px]">
            {/* Decorative colour ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-2 opacity-15"
                style={{ borderColor: m.colour }} />
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border opacity-8"
                style={{ borderColor: m.colour }} />
            </div>

            <div ref={photoRef} className="relative z-10">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img src={m.photo} alt={m.name}
                  className="w-full h-full object-cover object-top" />
              </div>
              {/* Colour dot indicator */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full shadow-md border-2 border-white"
                style={{ backgroundColor: m.colour }} />
            </div>
          </div>

          {/* Right: Name + Role */}
          <div className="flex-1 p-6 sm:p-8 lg:p-10 text-center sm:text-left">
            <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
              <div className="w-6 h-1 rounded-full" style={{ backgroundColor: m.colour }} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                {active + 1} / {total}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#001A3A] leading-tight">
              {m.name}
            </h3>

            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: m.colour }}>
              {m.featured && <Award className="w-3.5 h-3.5" />}
              {m.roleTag}
            </div>

            {/* Dot navigation */}
            <div className="flex items-center gap-2 mt-5 justify-center sm:justify-start">
              {members.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="relative w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === active ? members[i].colour : '#D1D5DB',
                    transform: i === active ? 'scale(1.3)' : 'scale(1)',
                  }}>
                  {i === active && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: members[i].colour }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-50/80 border-t border-gray-100">
          <button onClick={goPrev}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-[#00458B] hover:bg-white transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button onClick={() => setPaused(!paused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-[#00458B] hover:bg-white transition-all">
            {paused
              ? <><Play className="w-3.5 h-3.5" /> <span>Play</span></>
              : <><Pause className="w-3.5 h-3.5" /> <span>Pause</span></>
            }
          </button>

          <button onClick={goNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-[#00458B] hover:bg-white transition-all">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full transition-all duration-500 ease-out rounded-r-full"
            style={{
              width: `${((active + 1) / total) * 100}%`,
              backgroundColor: m.colour,
            }} />
        </div>
      </div>
    </div>
  );
}

/* ── Expanded Member Detail Modal/Panel ── */
function MemberDetail({ member, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        opacity: 0, y: 20, duration: 0.25, ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div ref={panelRef}
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10"
        onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Top section — photo + name */}
        <div className="relative">
          <div className="h-32 rounded-t-3xl" style={{ background: `linear-gradient(135deg, ${member.colour}22 0%, ${member.colour}08 100%)` }} />
          <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img src={member.photo} alt={member.name}
                  className="w-full h-full object-cover object-top" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: member.colour }}>
                {member.featured
                  ? <Award className="w-4 h-4 text-white" />
                  : <Briefcase className="w-4 h-4 text-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* Name + role */}
        <div className="text-center pt-20 sm:pt-24 px-6 sm:px-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001A3A]">{member.name}</h2>
          <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: member.colour }}>
            {member.roleTag}
          </div>
        </div>

        {/* Bio paragraphs */}
        <div className="px-6 sm:px-10 py-8 space-y-4">
          {member.bio.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-gray-600">
              {p}
            </p>
          ))}
        </div>

        {/* Bottom accent bar */}
        <div className="h-1.5 rounded-b-3xl" style={{ backgroundColor: member.colour }} />
      </div>
    </div>
  );
}

/* ── Board Member Card ── */
function MemberCard({ member, index, onClick }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        delay: index * 0.08,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 90%',
          once: true,
        },
      }
    );
  }, [index]);

  const isFeatured = member.featured;

  return (
    <div ref={cardRef}
      onClick={onClick}
      className={`group cursor-pointer relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent ${isFeatured ? 'sm:col-span-2 lg:col-span-1' : ''}`}>

      {/* Colour accent top */}
      <div className="h-1.5 w-full" style={{ backgroundColor: member.colour }} />

      {/* Photo */}
      <div className="relative pt-8 pb-4 px-6 flex justify-center">
        <div className="relative">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-500 border-2 border-gray-50 group-hover:border-transparent"
            style={{ '--hover-border': member.colour }}>
            <img src={member.photo} alt={member.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
          </div>

          {/* Role badge */}
          {isFeatured && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-md"
              style={{ backgroundColor: member.colour }}>
              {member.role}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-6 pb-6 text-center pt-2">
        <h3 className="text-lg font-bold text-[#001A3A] group-hover:text-[#00458B] transition-colors">
          {member.name}
        </h3>
        {!isFeatured && (
          <p className="text-sm font-medium mt-1" style={{ color: member.colour }}>
            {member.roleTag}
          </p>
        )}

        {/* Preview bio — first sentence */}
        <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">
          {member.bio[0].split('.').slice(0, 1).join('.') + '.'}
        </p>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          style={{ color: member.colour }}>
          <span>View Profile</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 2px ${member.colour}40, 0 8px 32px ${member.colour}15` }} />
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
 * MAIN PAGE EXPORT
 * ══════════════════════════════════════════════════════════════════ */
export default function BoardOfDirectorsPage() {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, []);

  // Chairperson and Vice Chair featured at top
  const leadership = BOARD_MEMBERS.filter(m => m.featured);
  const members = BOARD_MEMBERS.filter(m => !m.featured);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">Home</Link>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></span>
            <Link to="/about/profile" className="hover:text-bocra-blue transition-colors">About</Link>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></span>
            <span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Lekgotla la Batlhankedi' : 'Board of Directors'}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero category="ABOUT" categoryTn="KA GA RONA" title="Board of Directors" titleTn="Lekgotla la Batlhankedi" description="The BOCRA Board provides strategic direction in line with Botswana National Digital Economy Roadmap 2025–2030 and the Botswana Economic Transformation Programme." descriptionTn="Lekgotla la BOCRA le neela kaelo ya togamaano go ya ka National Digital Economy Roadmap ya Botswana 2025-2030." color="blue" />

      {/* ── Auto-Playing Carousel ── */}
      <BoardCarousel members={BOARD_MEMBERS} onSelect={setSelected} />

      {/* Leadership — Chair + Vice Chair */}
      <div className="section-wrapper pt-8 sm:pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${C.cyan}15` }}>
            <Award className="w-4 h-4" style={{ color: C.cyan }} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#001A3A]">Leadership</h2>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {leadership.map((m, i) => (
            <MemberCard key={m.id} member={m} index={i} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>

      {/* Board Members */}
      <div className="section-wrapper pt-8 sm:pt-10 pb-8 sm:pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${C.magenta}15` }}>
            <Briefcase className="w-4 h-4" style={{ color: C.magenta }} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#001A3A]">Board Members</h2>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <MemberCard key={m.id} member={m} index={i + 2} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>

      {/* BOCRA dot accent strip */}
      <div className="section-wrapper pb-12">
        <div className="flex items-center justify-center gap-2">
          {DOT_COLOURS.map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <MemberDetail member={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
