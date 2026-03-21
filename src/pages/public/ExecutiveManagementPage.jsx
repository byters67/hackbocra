/**
 * Executive Management Page — BOCRA
 * 
 * Interactive team page with CE featured at top,
 * department directors in a grid, and expand-to-read bios.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Users, Briefcase, ChevronRight, X, Award,
  TrendingUp, Settings, DollarSign, Cpu, FileCheck,
  Wifi, Scale, Star
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

gsap.registerPlugin(ScrollTrigger);
const B = import.meta.env.BASE_URL || '/';

const C = {
  blue: '#00458B', cyan: '#00A6CE', magenta: '#C8237B',
  yellow: '#F7B731', green: '#6BBE4E', dark: '#001A3A',
};

/* ── Executive Management Data ── */
const getExecMembers = (lang) => [
  {
    id: 'mokgware',
    name: 'Mr. Martin Mokgware',
    role: lang === 'tn' ? 'Motlhankedi yo Mogolo' : 'Chief Executive',
    department: lang === 'tn' ? 'Ofisi ya Motlhankedi yo Mogolo' : 'Office of the Chief Executive',
    photo: `${B}images/executive/Martin_mokgware.jpg`,
    colour: C.blue,
    icon: Star,
    featured: true,
    bio: [
      lang === 'tn' ? 'Rre Martin Mokgware o tlhomilwe jaaka Motlhankedi yo Mogolo wa BOCRA ka Sedimonthole 2017, a na le maitemogelo a go feta dingwaga di le 17 a taolo. O etelela pele Bothati bo bo ikarabelang ka megala le ICT, phasalatso, le merero ya poso mo Botswana.' : 'Mr. Martin Mokgware was appointed Chief Executive of BOCRA in December 2017, bringing over seventeen years of regulatory experience. He leads the Authority responsible for telecommunications and ICTs, broadcasting, and postal matters in Botswana.',
      lang === 'tn' ? 'Pele ga go tlhongwa ga gagwe, Rre Mokgware o ne a bereka mo maemong a botsamaisi kwa BOCRA ka dingwaga tse di fetang lesome — jaaka Motlhankedi wa Tlhabololo ya Mmaraka le Tshekatsheko, Motlhankedi wa Inthanete e e Lebelo le Tirelo ya Botlhe, le Motlatsa Motlhankedi yo Mogolo yo o dirang wa Ditiro le Leano.' : 'Prior to his appointment, Mr. Mokgware served in executive positions at BOCRA for over a decade — as Director Market Development and Analysis, Director Broadband and Universal Service, and acting Deputy Chief Executive responsible for Operations and Strategy.',
      lang === 'tn' ? 'O ne a le botlhokwa mo go dirweng le go diragatsiwa ga leano la Letlole la Tirelo ya Phitlhelelo ya Botlhe, le le isitseng kwa go fanweng ga mafelo a Wi-Fi a setšhaba mo Botswana yotlhe, go tlhabolola diteišene tsa megala go tswa go 2G go ya go 3G, le Porojeke ya Kgolagano ya Dikolo e e fanang ka inthanete ya lobelo le legolo kwa dikolong tsa puso tsa poraemari mo dikgaolong tse di sa fitisweng.' : 'He was instrumental in the formulation and implementation of the Universal Access and Service Fund strategy, leading to the provision of public Wi-Fi hotspots across Botswana, the upgrade of telecommunications base stations from 2G to 3G technology, and the Schools Connectivity Project providing broadband internet to government primary schools in underserved districts.',
      lang === 'tn' ? 'Rre Mokgware o na le Dikerii ya Masetase ya Ikonomi ya Dipalangwa go tswa Yunibesithing ya Leeds (UK), Dikerii ya Botlhano ya Ikonomi go tswa Yunibesithing ya Botswana, le Diploma ya Morago ga Dikerii ya Taolo ya Megala go tswa Yunibesithing ya Westminster (UK).' : 'Mr. Mokgware holds a Master\u2019s Degree in Transport Economics from the University of Leeds (UK), a Bachelor\u2019s Degree in Economics from the University of Botswana, and a Post Graduate Diploma in Telecommunications Regulation from the University of Westminster (UK).',
    ],
  },
  {
    id: 'setshwane',
    name: 'Mr. Murphy Setshwane',
    role: lang === 'tn' ? 'Motlhankedi' : 'Director',
    department: lang === 'tn' ? 'Tlhabololo ya Kgwebo' : 'Business Development',
    photo: `${B}images/executive/Murphy_setshwane.jpg`,
    colour: C.cyan,
    icon: TrendingUp,
    bio: [
      lang === 'tn' ? 'Rre Murphy Setshwane o bereka jaaka Motlhankedi wa Tlhabololo ya Kgwebo kwa BOCRA. O ikarabela ka go tsamaisa tlhabololo ya mmaraka, tshekatsheko ya madirelo, le mananeo a leano a kgwebo a a rotloetsang kgolo le kgaisano mo Botswana\u2019s communications sector.' : 'Mr. Murphy Setshwane serves as Director of Business Development at BOCRA. He is responsible for driving market development, industry analysis, and business strategy programmes that promote growth and competition in Botswana\u2019s communications sector.',
      lang === 'tn' ? 'Lefapha la gagwe le okamela patlisiso ya mmaraka, tshekatsheko ya ikonomi ya madirelo a megala, le tlhabololo ya dipholisi tse di rotloetsang matsolo le boitlhamedi mo lefapheng.' : 'His department oversees market research, economic analysis of the telecommunications industry, and the development of policies that encourage investment and innovation in the sector.',
    ],
  },
  {
    id: 'tladinyane',
    name: 'Mr. Peter Tladinyane',
    role: lang === 'tn' ? 'Motlhankedi' : 'Director',
    department: lang === 'tn' ? 'Ditirelo tsa Khomporasi' : 'Corporate Services',
    photo: `${B}images/executive/Peter_tladinyane.jpg`,
    colour: C.magenta,
    icon: Settings,
    bio: [
      lang === 'tn' ? 'Rre Peter Tladinyane o bereka jaaka Motlhankedi wa Ditirelo tsa Khomporasi kwa BOCRA. O okamela Bothati\u2019s human resources, administration, and corporate governance functions.' : 'Mr. Peter Tladinyane serves as Director of Corporate Services at BOCRA. He oversees the Authority\u2019s human resources, administration, and corporate governance functions.',
      lang === 'tn' ? 'Lefapha la gagwe le ikarabela ka tlhabololo ya mokgatlho, tsamaiso ya bokgoni, le go netefatsa gore BOCRA e boloka maemo a maemo a lefatshe mo go isiweng ga tiragatso ya yona ya taolo.' : 'His department is responsible for organisational development, talent management, and ensuring BOCRA maintains world-class operational standards in the delivery of its regulatory mandate.',
    ],
  },
  {
    id: 'mine',
    name: 'Ms. Bonny Mine',
    role: lang === 'tn' ? 'Motlhankedi' : 'Director',
    department: lang === 'tn' ? 'Ditšhelete' : 'Finance',
    photo: `${B}images/executive/Bonnie_mine.jpg`,
    colour: C.yellow,
    icon: DollarSign,
    bio: [
      lang === 'tn' ? 'Mme Bonny Mine o bereka jaaka Motlhankedi wa Ditšhelete kwa BOCRA. O ikarabela ka Bothati\u2019s financial management, budgeting, procurement, and reporting functions.' : 'Ms. Bonny Mine serves as Director of Finance at BOCRA. She is responsible for the Authority\u2019s financial management, budgeting, procurement, and reporting functions.',
      lang === 'tn' ? 'Lefapha la gagwe le netefatsa taolo e e siameng ya ditšhelete, go obamela maemo a go bala ditšhelete a setšhaba, le tsamaiso e e nang le bokgoni ya metswedi ya BOCRA go tshegetsa ditiro tsa taolo tsa Bothati.' : 'Her department ensures sound financial governance, compliance with public sector accounting standards, and efficient management of BOCRA\u2019s resources to support the Authority\u2019s regulatory activities.',
    ],
  },
  {
    id: 'luke',
    name: 'Mr. Bathopi Luke',
    role: lang === 'tn' ? 'Motlhankedi' : 'Director',
    department: lang === 'tn' ? 'Ditirelo tsa Setegeniki' : 'Technical Services',
    photo: `${B}images/executive/Bathopi_luke.jpg`,
    colour: C.green,
    icon: Cpu,
    bio: [
      lang === 'tn' ? 'Rre Bathopi Luke o bereka jaaka Motlhankedi wa Ditirelo tsa Setegeniki kwa BOCRA. O etelela pele lefapha la setegeniki le le ikarabelang ka tsamaiso ya sepeketeramo, peakanyo ya frikwensi ya radio, tlhokomelo ya boleng jwa tirelo, le maemo a boenjiniri.' : 'Mr. Bathopi Luke serves as Director of Technical Services at BOCRA. He leads the technical division responsible for spectrum management, radio frequency planning, quality of service monitoring, and engineering standards.',
      lang === 'tn' ? 'Lefapha la gagwe le tshameka karolo e e botlhokwa mo tsamaisong ya sepeketeramo sa frikwensi ya radio ya Botswana, tumelelo ya mofuta wa didirisiwa tsa megala, le go netefatsa gore maemo a boleng jwa neteweke le phitlhelelo a fitlheletswe ke balaodi mo nageng yotlhe.' : 'His department plays a critical role in managing Botswana\u2019s radio frequency spectrum, type approval of telecommunications equipment, and ensuring network quality and coverage standards are met by operators across the country.',
    ],
  },
  {
    id: 'mmoshe',
    name: 'Ms. Tebogo Mmoshe',
    role: lang === 'tn' ? 'Motlhankedi' : 'Director',
    department: lang === 'tn' ? 'Dilaesense' : 'Licensing',
    photo: `${B}images/executive/Tebogo_mmoshe.jpg`,
    colour: C.cyan,
    icon: FileCheck,
    bio: [
      lang === 'tn' ? 'Mme Tebogo Mmoshe o bereka jaaka Motlhankedi wa Dilaesense kwa BOCRA. O ikarabela ka go dirisa le go ntsha dilaesense tsa megala, phasalatso, poso, le ditirelo tsa dikgolagano tsa radio mo Botswana.' : 'Ms. Tebogo Mmoshe serves as Director of Licensing at BOCRA. She is responsible for processing and issuing licences for telecommunications, broadcasting, postal, and radio communication services in Botswana.',
      lang === 'tn' ? 'Lefapha la gagwe le tsamaisa tlhamo yotlhe ya dilaesense, le netefatsa go obamela ga maemo a dilaesense, le go tshegetsa tlhabololo ya thulaganyo ya dilaesense tsa ICT go tsamaelana le kgatelopele ya thekenoloji mo lefapheng la dikgolagano.' : 'Her department manages the full licensing lifecycle, ensures compliance with licensing conditions, and supports the development of the ICT licensing framework to keep pace with technological advancements in the communications sector.',
    ],
  },
  {
    id: 'ratladi',
    name: 'Ms. Maitseo Ratladi',
    role: lang === 'tn' ? 'Motlhankedi' : 'Director',
    department: lang === 'tn' ? 'Inthanete e e Lebelo le Tirelo ya Botlhe' : 'Broadband & Universal Service',
    photo: `${B}images/executive/Maitseo_ratladi.jpg`,
    colour: C.magenta,
    icon: Wifi,
    bio: [
      lang === 'tn' ? 'Mme Maitseo Ratladi o bereka jaaka Motlhankedi wa Inthanete e e Lebelo le Tirelo ya Botlhe kwa BOCRA. O etelela pele mananeo a go atolosa kgolagano ya inthanete le go netefatsa phitlhelelo e e akaretsang ya ditirelo tsa dikgolagano mo Botswana yotlhe, go akaretsa mafelo a magae le a a sa fitisweng.' : 'Ms. Maitseo Ratladi serves as Director of Broadband and Universal Service at BOCRA. She leads initiatives to expand broadband connectivity and ensure universal access to communications services across Botswana, including rural and underserved areas.',
      lang === 'tn' ? 'Lefapha la gagwe le tsamaisa Letlole la Tirelo ya Phitlhelelo ya Botlhe (UASF), le okamela diporojeke tsa tlhabololo ya mafaratlhatlha a inthanete, le go diragatsa dipholisi tsa go ritibatsa pharologanyo ya dijithale le go rotloetsa go akarediwa ga dijithale mo Batswana botlhe.' : 'Her department administers the Universal Access and Service Fund (UASF), oversees broadband infrastructure development projects, and implements policies to bridge the digital divide and promote digital inclusion for all Batswana.',
    ],
  },
  {
    id: 'isa-molwane',
    name: 'Ms. Joyce Isa-Molwane',
    role: lang === 'tn' ? 'Molao, Go Obamela le Mongodi wa Boto' : 'Legal, Compliance & Board Secretary',
    department: lang === 'tn' ? 'Molao le Go Obamela' : 'Legal & Compliance',
    photo: `${B}images/executive/Joyce-Isa-molwane.jpg`,
    colour: C.yellow,
    icon: Scale,
    bio: [
      lang === 'tn' ? 'Mme Joyce Isa-Molwane o bereka jaaka tlhogo ya Molao, Go Obamela, le Mongodi wa Boto kwa BOCRA. O fana ka kgakololo ya molao go Bothati, o okamela go obamela ga taolo, mme o bereka jaaka Mongodi wa Boto ya Batsamaisi ya BOCRA.' : 'Ms. Joyce Isa-Molwane serves as the head of Legal, Compliance, and Board Secretary at BOCRA. She provides legal counsel to the Authority, oversees regulatory compliance, and serves as Secretary to the BOCRA Board of Directors.',
      lang === 'tn' ? 'Lefapha la gagwe le tshwara merero ya molao, go kwala melao, tlhokomelo ya go obamela, tharabololo ya dikganetsano, le go netefatsa gore ditiro tsa BOCRA di dirwa ka fa gare ga thulaganyo ya molao le taolo e e tlhomilweng ke Molao wa Bothati jwa Taolo ya Dikgolagano, 2012.' : 'Her department handles legal affairs, drafting of regulations, compliance monitoring, dispute resolution, and ensures BOCRA\u2019s activities are conducted within the legal and regulatory framework established by the Communications Regulatory Authority Act, 2012.',
    ],
  },
];

/* ── Detail Modal ── */
function ExecDetail({ member, onClose }) {
  const panelRef = useRef(null);
  const Icon = member.icon;

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
    } else onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div ref={panelRef}
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10"
        onClick={e => e.stopPropagation()}>

        <button onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="relative">
          <div className="h-28 rounded-t-3xl" style={{ background: `linear-gradient(135deg, ${member.colour}20 0%, ${member.colour}08 100%)` }} />
          <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 flex justify-center">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: member.colour }}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-20 sm:pt-24 px-6 sm:px-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001A3A]">{member.name}</h2>
          <p className="text-sm font-semibold mt-1" style={{ color: member.colour }}>{member.role}</p>
          <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Icon className="w-3 h-3" />
            {member.department}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-8 space-y-4">
          {member.bio.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-gray-600">{p}</p>
          ))}
        </div>

        <div className="h-1.5 rounded-b-3xl" style={{ backgroundColor: member.colour }} />
      </div>
    </div>
  );
}

/* ── Executive Card ── */
function ExecCard({ member, index, onClick }) {
  const { lang } = useLanguage();
  const cardRef = useRef(null);
  const Icon = member.icon;

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        delay: index * 0.08,
        scrollTrigger: { trigger: cardRef.current, start: 'top 90%', once: true },
      }
    );
  }, [index]);

  return (
    <div ref={cardRef} onClick={onClick}
      className="group cursor-pointer relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent">

      <div className="h-1.5 w-full" style={{ backgroundColor: member.colour }} />

      <div className="relative pt-6 pb-3 px-6 flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-500 border-2 border-gray-50">
            <img src={member.photo} alt={member.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white"
            style={{ backgroundColor: member.colour }}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 text-center pt-2">
        <h3 className="text-base font-bold text-[#001A3A] group-hover:text-[#00458B] transition-colors leading-tight">
          {member.name}
        </h3>
        <p className="text-sm font-semibold mt-1" style={{ color: member.colour }}>
          {member.role}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">{member.department}</p>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          style={{ color: member.colour }}>
          <span>{lang === 'tn' ? 'Bona Porofaele' : 'View Profile'}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 2px ${member.colour}40, 0 8px 32px ${member.colour}15` }} />
    </div>
  );
}

/* ── CE Featured Card (wide) ── */
function CECard({ member, onClick }) {
  const { lang } = useLanguage();
  const cardRef = useRef(null);
  const Icon = member.icon;

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    );
  }, []);

  return (
    <div ref={cardRef} onClick={onClick}
      className="group cursor-pointer relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-transparent">

      <div className="h-1.5 w-full" style={{ backgroundColor: member.colour }} />

      <div className="flex flex-col sm:flex-row items-center">
        {/* Photo side */}
        <div className="relative w-full sm:w-2/5 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 sm:p-10">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border-2 opacity-10" style={{ borderColor: member.colour }} />
          </div>
          <div className="relative z-10">
            <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img src={member.photo} alt={member.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-md border-2 border-white"
              style={{ backgroundColor: member.colour }}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Info side */}
        <div className="flex-1 p-6 sm:p-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white mb-3"
            style={{ backgroundColor: member.colour }}>
            <Award className="w-3 h-3" />
            Chief Executive
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#001A3A] group-hover:text-[#00458B] transition-colors">
            {member.name}
          </h3>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
            {member.bio[0]}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold opacity-60 group-hover:opacity-100 transition-all duration-300 justify-center sm:justify-start"
            style={{ color: member.colour }}>
            <span>{lang === 'tn' ? 'Bona Porofaele ka Botlalo' : 'View Full Profile'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 2px ${member.colour}40, 0 8px 32px ${member.colour}15` }} />
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
 * MAIN PAGE EXPORT
 * ══════════════════════════════════════════════════════════════════ */
export default function ExecutiveManagementPage() {
  const { lang } = useLanguage();
  const EXEC_MEMBERS = getExecMembers(lang);
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

  const ce = EXEC_MEMBERS.find(m => m.featured);
  const directors = EXEC_MEMBERS.filter(m => !m.featured);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></span>
            <Link to="/about/profile" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Ka ga Rona' : 'About'}</Link>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></span>
            <span className="text-bocra-slate font-medium">{lang === 'tn' ? 'Botsamaisi jwa Phethagatso' : 'Executive Management'}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero category="ABOUT" categoryTn="KA GA RONA" title="Executive Management" titleTn="Botsamaisi jwa Setheo" description="The Executive Management team leads BOCRA's day-to-day operations, driving the Authority's strategic vision across telecommunications, broadcasting, postal services, and digital transformation in Botswana." descriptionTn="Setlhopha sa botsamaisi se se etelelang pele ditiro tsa letsatsi le letsatsi tsa BOCRA." color="blue" />

      {/* Chief Executive — Featured */}
      <div className="section-wrapper pt-8 sm:pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${C.blue}15` }}>
            <Star className="w-4 h-4" style={{ color: C.blue }} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#001A3A]">{lang === 'tn' ? 'Mokaedi Mogolo' : 'Chief Executive'}</h2>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <div className="max-w-3xl mx-auto">
          <CECard member={ce} onClick={() => setSelected(ce)} />
        </div>
      </div>

      {/* Directors Grid */}
      <div className="section-wrapper pt-8 sm:pt-10 pb-8 sm:pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${C.cyan}15` }}>
            <Users className="w-4 h-4" style={{ color: C.cyan }} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#001A3A]">{lang === 'tn' ? 'Batlhankedi ba Maphata' : 'Department Directors'}</h2>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {directors.map((m, i) => (
            <ExecCard key={m.id} member={m} index={i} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>

      {/* Org structure hint */}
      <div className="section-wrapper pb-12">
        <div className="text-center">
          <Link to="/about/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#00458B] bg-[#00458B]/5 hover:bg-[#00458B]/10 transition-colors">
            <Users className="w-4 h-4" />
            {lang === 'tn' ? 'Bona Porofaele ya Mokgatlho' : 'View Organisational Profile'}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <ExecDetail member={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
