/**
 * CareersPage.jsx — Careers at BOCRA
 * Route: /about/careers
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Briefcase, GraduationCap, Heart, Globe, Shield,
  Users, Wifi, ArrowRight, Mail, Phone, MapPin, Clock, Star,
  CheckCircle, Building, Award, Send, Calendar, Edit3
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useLanguage } from '../../lib/language';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

const getWHY_BOCRA = (lang) => [
  { icon: Globe, title: lang === 'tn' ? 'Phetogo ya Dijithale' : 'Digital Transformation', desc: lang === 'tn' ? 'Tshwaela mo go ageng Botswana e e golaganeng le e e etelletsweng ke dijithale.' : 'Help build a connected and digitally driven Botswana for all citizens.', color: '#00A6CE' },
  { icon: Shield, title: lang === 'tn' ? 'Taolo e e Nang le Ditlamorago' : 'Impactful Regulation', desc: lang === 'tn' ? 'Tiro ya gago e ama batho ba le dimilione — go netefatsa ditirelo tsa dikgolagano tse di boleng.' : 'Your work impacts millions — ensuring quality, affordable communications services.', color: '#C8237B' },
  { icon: GraduationCap, title: lang === 'tn' ? 'Tlhabololo ya Boprofešenale' : 'Professional Growth', desc: lang === 'tn' ? 'Phitlhelelo ya katiso, dikopano tsa boditšhabatšhaba, le mananeo a boeteledipele.' : 'Access to training, international conferences, and leadership development programmes.', color: '#F7B731' },
  { icon: Heart, title: lang === 'tn' ? 'Mesola e e Kgaisanyang' : 'Competitive Benefits', desc: lang === 'tn' ? 'Tuelo e e kgaisanyang, mesola ya bophelo, le leano la penshene le le nonofileng.' : 'Competitive salary, medical aid, pension scheme, and generous leave allowances.', color: '#6BBE4E' },
  { icon: Users, title: lang === 'tn' ? 'Setlhopha se se Akaretsang' : 'Inclusive Team', desc: lang === 'tn' ? 'Tikologo ya tiro e e dirisanyang e e nang le setso sa go tlotla le tlhabololo.' : 'A collaborative work environment with a culture of respect and continuous improvement.', color: '#7C3AED' },
  { icon: Building, title: lang === 'tn' ? 'Botsalano jwa Boditšhabatšhaba' : 'Global Network', desc: lang === 'tn' ? 'Dirisana le ditheo tsa taolo tsa boditšhabatšhaba le baamegi ba lefapha.' : 'Engage with international regulatory bodies and industry stakeholders worldwide.', color: '#00458B' },
];

const getDEPARTMENTS = (lang) => [
  { name: lang === 'tn' ? 'Ditirelo tsa Setegeniki' : 'Technical Services', desc: lang === 'tn' ? 'Sepeketeramo, tumelelo ya mofuta, boleng jwa tirelo' : 'Spectrum, type approval, QoS', color: '#00A6CE' },
  { name: lang === 'tn' ? 'Dilaesense' : 'Licensing', desc: lang === 'tn' ? 'Dikopo, diphetogo, rejisteri' : 'Applications, renewals, registry', color: '#C8237B' },
  { name: lang === 'tn' ? 'Tlhabololo ya Kgwebo' : 'Business Development', desc: lang === 'tn' ? 'Leano, patlisiso, mmaraka' : 'Strategy, research, markets', color: '#F7B731' },
  { name: lang === 'tn' ? 'Ditirelo tsa Khomporasi' : 'Corporate Services', desc: lang === 'tn' ? 'Badiredi, tsamaiso, IT' : 'HR, administration, IT', color: '#6BBE4E' },
  { name: lang === 'tn' ? 'Molao le Go Obamela' : 'Legal & Compliance', desc: lang === 'tn' ? 'Molao, taolo, dikganetsano' : 'Legal, governance, disputes', color: '#7C3AED' },
  { name: lang === 'tn' ? 'Ditšhelete' : 'Finance', desc: lang === 'tn' ? 'Ditšhelete, theko, tekanyetso' : 'Finance, procurement, budget', color: '#00458B' },
];

const getAPPLICATION_STEPS = (lang) => [
  { step: '1', title: lang === 'tn' ? 'Batlana le Maemo' : 'Browse Openings', desc: lang === 'tn' ? 'Sekaseka maemo a a leng teng mo lenaaneng la rona fa tlase.' : 'Review current positions listed below.', color: '#00A6CE' },
  { step: '2', title: lang === 'tn' ? 'Baakanya Dikwalo' : 'Prepare Documents', desc: lang === 'tn' ? 'Rulaganya CV ya gago, lekwalo la kopo, le ditokomane tse di tshegetswang.' : 'Prepare your CV, cover letter, and supporting documents.', color: '#C8237B' },
  { step: '3', title: lang === 'tn' ? 'Romela Kopo' : 'Submit Application', desc: lang === 'tn' ? 'Romela kopo ya gago ka imeile go info@bocra.org.bw ka leina la tiro mo motlhalong.' : 'Email your application to info@bocra.org.bw with the job title as subject.', color: '#F7B731' },
  { step: '4', title: lang === 'tn' ? 'Tsamaiso ya Tlhopho' : 'Selection Process', desc: lang === 'tn' ? 'Bakopi ba ba fitlhetseng maemo ba tla laleledwa dipuisano le ditlhatlhobo.' : 'Shortlisted candidates will be invited for interviews and assessments.', color: '#6BBE4E' },
];

const CAREERS_CV_EMAIL = 'info@bocra.org.bw';
const CAREERS_CV_SUBJECT = 'General Application - CV Submission';
const CAREERS_MAILTO_HREF = `mailto:${CAREERS_CV_EMAIL}?subject=${encodeURIComponent(CAREERS_CV_SUBJECT)}`;
/** Opens in the browser when no desktop mail client handles mailto: */
const CAREERS_GMAIL_COMPOSE_HREF =
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CAREERS_CV_EMAIL)}&su=${encodeURIComponent(CAREERS_CV_SUBJECT)}`;

export default function CareersPage() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const heroRef = useScrollReveal();
  const WHY_BOCRA = getWHY_BOCRA(lang);
  const DEPARTMENTS = getDEPARTMENTS(lang);
  const STEPS = getAPPLICATION_STEPS(lang);
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_openings')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!cancelled && data) {
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        if (!cancelled) setLoadingJobs(false);
      }
    };
    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Careers — BOCRA</title>
        <meta name="description" content="Career opportunities at the Botswana Communications Regulatory Authority." />
        <link rel="canonical" href="https://bocra.org.bw/about/careers" />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={[
            { label: 'About', href: '/about/profile' },
            { label: 'Careers' },
          ]} />
        </div>
      </div>

      {/* Hero */}
      <PageHero
        category="ABOUT"
        categoryTn="KA GA RONA"
        title="Careers at BOCRA"
        titleTn="Menyetla ya Ditiro kwa BOCRA"
        description="Join a team dedicated to shaping Botswana's digital future. We are looking for talented individuals who share our passion for communications regulation and public service."
        descriptionTn="Tsena mo setlhopheng se se ikemiseditseng go bopa isagwe ya dijithale ya Botswana. Re batla batho ba ba nang le bokgoni ba ba abelanang keletso ya rona ya taolo ya dikgolagano le tirelo ya setšhaba."
        color="cyan"
      />

      {/* Why Work at BOCRA */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-[10px] text-bocra-slate/30 uppercase tracking-[0.25em] font-medium mb-2">{tn ? 'KE GORENG BOCRA' : 'WHY BOCRA'}</p>
            <h2 className="text-xl font-bold text-[#001A3A]">{tn ? 'Ke Goreng o Dira Kwa BOCRA?' : 'Why Work at BOCRA?'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_BOCRA.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ background: `${item.color}12` }}>
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-bocra-slate mb-1">{item.title}</h3>
                  <p className="text-xs text-bocra-slate/50 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-10 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-[10px] text-bocra-slate/30 uppercase tracking-[0.25em] font-medium mb-2">{tn ? 'MAEMO A A LENG TENG' : 'CURRENT OPENINGS'}</p>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-xl font-bold text-[#001A3A]">{tn ? 'Maemo a Ditiro a a Leng Teng' : 'Current Job Openings'}</h2>
              {isAdmin && (
                <Link to="/admin/jobs" className="text-sm text-bocra-blue hover:underline flex items-center gap-1">
                  <Edit3 size={14} /> Manage
                </Link>
              )}
            </div>
          </div>

          {loadingJobs ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-7 animate-pulse">
                  <div className="flex justify-between mb-3"><div className="h-6 w-2/3 bg-gray-200 rounded" /><div className="h-6 w-16 bg-gray-200 rounded-full" /></div>
                  <div className="flex gap-3 mb-4"><div className="h-4 w-28 bg-gray-100 rounded" /><div className="h-4 w-32 bg-gray-100 rounded" /><div className="h-4 w-20 bg-gray-100 rounded" /></div>
                  <div className="space-y-2"><div className="h-4 w-full bg-gray-100 rounded" /><div className="h-4 w-5/6 bg-gray-100 rounded" /></div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ml-3">Open</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1"><Briefcase size={14} /> {job.department}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {job.employment_type}</span>
                    {job.closing_date && (
                      <span className="flex items-center gap-1"><Calendar size={14} /> Closes: {new Date(job.closing_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{job.description}</p>
                  {job.requirements && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">{job.requirements}</p>
                    </div>
                  )}
                  {job.qualifications && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Qualifications</h4>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">{job.qualifications}</p>
                    </div>
                  )}
                  {job.salary_range && (
                    <p className="text-bocra-blue font-medium">{job.salary_range}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* No openings state — preserved exactly as original */
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#00A6CE]/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-[#00A6CE]" />
              </div>
              <h3 className="text-lg font-bold text-bocra-slate mb-2">{tn ? 'Ga go na Maemo a a Butsweng ga Jaana' : 'No Current Openings'}</h3>
              <p className="text-sm text-bocra-slate/50 max-w-md mx-auto mb-4">
                {tn
                  ? 'Ga go na maemo a a leng teng ga jaana. Boelang gape ka metlha go bona menyetla e mesha, kgotsa romela CV ya gago go re bolokela mo lenaaneng la rona.'
                  : 'There are no open positions at this time. Please check back regularly for new opportunities, or submit your CV to be kept on file for future vacancies.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href={CAREERS_GMAIL_COMPOSE_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#00A6CE] hover:bg-[#008DB3] transition-colors w-full sm:w-auto"
                >
                  <Send size={14} />
                  {tn ? 'Romela CV ya Gago' : 'Submit Your CV'}
                </a>
                <a
                  href={CAREERS_MAILTO_HREF}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#00A6CE] bg-white border-2 border-[#00A6CE] hover:bg-[#00A6CE]/5 transition-colors w-full sm:w-auto"
                >
                  <Mail size={14} />
                  {tn ? 'Bula sesebeli sa imeile' : 'Use email app'}
                </a>
              </div>
              <p className="text-xs text-bocra-slate/40 mt-3 max-w-md mx-auto">
                {tn
                  ? 'Konopo e e kwa godimo e bula Gmail mo thepeng e nngwe (o ka tsenela mo akhaonteng ya gago). Fa o na le Outlook, Thunderbird, kgotsa se sengwe, dirisa konopo ya bobedi.'
                  : 'The main button opens Gmail in a new tab (sign in if asked). If you use Outlook, Thunderbird, or Apple Mail, use "Use email app" instead \u2014 or write to info@bocra.org.bw.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How to Apply */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-[10px] text-bocra-slate/30 uppercase tracking-[0.25em] font-medium mb-2">{tn ? 'TSAMAISO' : 'PROCESS'}</p>
            <h2 className="text-xl font-bold text-[#001A3A]">{tn ? 'Tsela ya go Ikopela' : 'How to Apply'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(s => (
              <div key={s.step} className="relative bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3" style={{ background: s.color }}>
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-bocra-slate mb-1">{s.title}</h3>
                <p className="text-xs text-bocra-slate/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-10 bg-bocra-off-white">
        <div className="section-wrapper max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-[10px] text-bocra-slate/30 uppercase tracking-[0.25em] font-medium mb-2">{tn ? 'MAFAPHA A RONA' : 'OUR DEPARTMENTS'}</p>
            <h2 className="text-xl font-bold text-[#001A3A]">{tn ? 'Mafapha a BOCRA' : 'BOCRA Departments'}</h2>
            <p className="text-sm text-bocra-slate/50 mt-2 max-w-lg mx-auto">
              {tn
                ? 'Menyetla ya ditiro e ka tswa mo lefapheng lefe kgotsa lefe la mafapha a a latelang.'
                : 'Career opportunities may arise across any of the following departments.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEPARTMENTS.map(dept => (
              <div key={dept.name} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
                <div className="w-2 h-2 rounded-full mb-2" style={{ background: dept.color }} />
                <p className="text-sm font-bold text-bocra-slate group-hover:text-[#00458B] transition-colors">{dept.name}</p>
                <p className="text-[10px] text-bocra-slate/40 mt-0.5">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="bg-gradient-to-br from-[#00458B] via-[#003366] to-[#001A3A] rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00A6CE]/10 rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#C8237B]/10 rounded-full" />
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-xl font-bold mb-2">{tn ? 'Kgolagano' : 'Get in Touch'}</h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  {tn
                    ? 'O na le dipotso ka menyetla ya ditiro kwa BOCRA? Ikgolaganye le lefapha la rona la Badiredi.'
                    : 'Have questions about career opportunities at BOCRA? Contact our Human Resources department.'}
                </p>
              </div>
              <div className="space-y-3">
                <a href="mailto:info@bocra.org.bw" className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-[#00A6CE]" />
                  </div>
                  info@bocra.org.bw
                </a>
                <a href="tel:+2673957755" className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-[#00A6CE]" />
                  </div>
                  +267 395 7755
                </a>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-[#00A6CE]" />
                  </div>
                  {tn ? 'Gaborone, Botswana' : 'Gaborone, Botswana'}
                </div>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-[#00A6CE]" />
                  </div>
                  {tn ? 'Mosupologo – Labotlhano: 07:30 – 16:30' : 'Monday – Friday: 07:30 – 16:30 CAT'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-6">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: tn ? 'Ka ga BOCRA' : 'About BOCRA', path: '/about/profile', icon: Building, color: '#00458B' },
              { label: tn ? 'Thulaganyo ya Setheo' : 'Organogram', path: '/about/organogram', icon: Users, color: '#00A6CE' },
              { label: tn ? 'Botsamaisi' : 'Executive Management', path: '/about/executive-management', icon: Award, color: '#C8237B' },
              { label: tn ? 'Ditendara' : 'Tenders', path: '/tenders', icon: Briefcase, color: '#F7B731' },
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
