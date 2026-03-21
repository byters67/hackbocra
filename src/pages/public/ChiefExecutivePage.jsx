/**
 * ChiefExecutivePage.jsx — A Word From The Chief Executive
 * Route: /about/chief-executive
 */
import { Link } from 'react-router-dom';
import {
  ChevronRight, Quote, Award, Briefcase, GraduationCap, Globe,
  Users, ArrowRight, Shield, BookOpen, Radio, Wifi, Mail, Phone
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

const BASE = import.meta.env.BASE_URL || '/';

const getPRIORITIES = (lang) => [
  { title: lang === 'tn' ? 'Phetogo ya Dijithale' : 'Digital Transformation', desc: lang === 'tn' ? 'Go gogela Botswana kwa setšhabeng se se golaganeng le se se etelletsweng ke dijithale ka taolo ya seša le boitlhamedi.' : 'Driving Botswana towards a connected and digitally driven society through modern regulation and innovation.', icon: Globe, color: '#00A6CE' },
  { title: lang === 'tn' ? 'Tshireletso ya Badirisi' : 'Consumer Protection', desc: lang === 'tn' ? 'Go netefatsa gore Batswana botlhe ba na le phitlhelelo ya ditirelo tsa dikgolagano tse di boleng, tse di sa tureng, le tse di ikanyegang.' : 'Ensuring all Batswana have access to quality, affordable, and reliable communications services.', icon: Shield, color: '#C8237B' },
  { title: lang === 'tn' ? 'Kgaisano e e Siameng' : 'Fair Competition', desc: lang === 'tn' ? 'Go boloka lefelo le le lekalekanyeng la go tshamekelana ga balaodi botlhe fa go rotloediwa matsolo le kgolo ya mmaraka.' : 'Maintaining a level playing field for all operators while encouraging investment and market growth.', icon: Award, color: '#F7B731' },
  { title: lang === 'tn' ? 'Phitlhelelo e e Akaretsang' : 'Universal Access', desc: lang === 'tn' ? 'Go atolosa phitlhelelo kwa mafelong a magae le a a sa fitisweng ka Letlole la Tirelo ya Phitlhelelo ya Botlhe.' : 'Expanding coverage to rural and underserved areas through the Universal Access Service Fund.', icon: Wifi, color: '#6BBE4E' },
];

export default function ChiefExecutivePage() {
  const { lang } = useLanguage();
  const PRIORITIES = getPRIORITIES(lang);
  const heroRef = useScrollReveal();
  const tn = lang === 'tn';

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue">{tn ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <Link to="/about/profile" className="hover:text-bocra-blue">{tn ? 'Ka ga Rona' : 'About'}</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate font-medium">{tn ? 'Mokaedi Mogolo' : 'Chief Executive'}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <PageHero category="ABOUT" categoryTn="KA GA RONA" title="A Word From The Chief Executive" titleTn="Lefoko go Tswa go Mokaedi Mogolo" description="Mr. Martin Mokgware leads BOCRA's mission to regulate for a connected and digitally driven Botswana." descriptionTn="Rre Martin Mokgware o etelela pele tiragatso ya BOCRA ya go laola Botswana e e golaganeng le e e etelletsweng pele ke dijithale." color="blue" />

      {/* CE Profile */}
      <section className="py-10">
        <div className="section-wrapper max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photo + Name Card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-56 flex-shrink-0">
                    <img
                      src={`${BASE}images/Martin_mokgware.jpg`}
                      alt={tn ? 'Rre Martin Mokgware — Mokaedi Mogolo, BOCRA' : 'Mr. Martin Mokgware — Chief Executive, BOCRA'}
                      className="w-full h-64 sm:h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-6 rounded-full bg-[#00A6CE]" />
                      <span className="text-[10px] text-[#00A6CE] uppercase tracking-widest font-medium">{tn ? 'Mokaedi Mogolo' : 'Chief Executive'}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-bocra-slate">{tn ? 'Rre Martin Mokgware' : 'Mr. Martin Mokgware'}</h2>
                    <p className="text-sm text-bocra-slate/50 mt-1">{tn ? 'Bothati jwa Taolo ya Dikgolagano jwa Botswana' : 'Botswana Communications Regulatory Authority'}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-bocra-slate/50">
                        <Briefcase size={12} className="text-[#00A6CE]" /> {tn ? 'Mokaedi Mogolo' : 'Chief Executive'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-bocra-slate/50">
                        <Globe size={12} className="text-[#6BBE4E]" /> Gaborone, Botswana
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="relative">
                <div className="absolute -top-2 left-6">
                  <div className="w-10 h-10 rounded-full bg-[#00A6CE]/10 flex items-center justify-center">
                    <Quote size={18} className="text-[#00A6CE]" />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 pt-10">
                  <div className="space-y-4 text-sm text-bocra-slate/70 leading-relaxed">
                    {tn ? (
                      <>
                        <p>
                          Re a go amogela mo webosaeteng ya Bothati jwa Taolo ya Dikgolagano jwa Botswana. Jaaka Mokaedi Mogolo, ke laletsa baamegi botlhe — baagi, ba ba nang le dilaesense, le balekane — go sekaseka polateforomo ya rona ya dijithale le go ikgolaganya le rona ka merero ya taolo ya dikgolagano.
                        </p>
                        <p>
                          BOCRA e ntse e ikemiseditse go rotloetsa tikologo ya dikgolagano e e nang le kgaisano, boitlhamedi, le e e siametseng badirisi mo Botswana. Re tswelela go bereka go ya kwa ponong ya rona ya <strong className="text-bocra-slate">setšhaba se se golaganeng le se se etelletsweng ke dijithale</strong>.
                        </p>
                        <p>
                          Lefelo la dikgolagano mo Botswana le fetogile thata fa e sa le BOCRA e tlhomiwa ka 2013. Re bonye go bulwa ga mmaraka wa megala, go atolosiwa ga marang-rang a mogala kwa mafelong a magae, kgolo ya inthanete ya lobelo le legolo, le go tlhaga ga ditirelo tse disha tsa dijithale tse di fetolang ka fa Batswana ba tshelang le ba berekang ka teng.
                        </p>
                        <p>
                          Mokgwa wa rona wa taolo o lekalekanya tlhokego ya kgaisano le boitlhamedi le botlhokwa jwa tshireletso ya badirisi le phitlhelelo e e akaretsang. Ka mananeo a tshwana le Letlole la Tirelo ya Phitlhelelo ya Botlhe (UASF), tlhokomelo ya boleng jwa tirelo, le temoso ya tshireletso ya saebo, re bereka go netefatsa gore Batswana botlhe ba ka tsaya karolo mo ikonoming ya dijithale.
                        </p>
                        <p>
                          Ke go rotloetsa go dirisa ditirelo tsa rona tsa mo inthaneteng — e ka nna go tlhagisa ngongorego, go netefatsa laesense, go tlhola boleng jwa neteweke, kgotsa go tsaya karolo mo ditherisanong tsa setšhaba. Go tsaya karolo ga gago go botlhokwa mo tirong ya rona. Mmogo, re ka aga Botswana e e golaganeng botoka mo go botlhe.
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          Welcome to the Botswana Communications Regulatory Authority website. As Chief Executive, I invite all stakeholders — citizens, licensees, and partners — to explore our digital platform and engage with us on matters of communications regulation.
                        </p>
                        <p>
                          BOCRA remains committed to fostering a competitive, innovative, and consumer-friendly communications environment in Botswana. We continue to work towards our vision of <strong className="text-bocra-slate">a connected and digitally driven society</strong>.
                        </p>
                        <p>
                          The communications landscape in Botswana has evolved significantly since BOCRA&#8217;s establishment in 2013. We have witnessed the liberalisation of the telecommunications market, the expansion of mobile coverage to rural areas, the growth of broadband internet, and the emergence of new digital services that are transforming how Batswana live and work.
                        </p>
                        <p>
                          Our regulatory approach balances the need for competition and innovation with the imperative of consumer protection and universal access. Through initiatives like the Universal Access Service Fund (UASF), quality of service monitoring, and cybersecurity awareness, we are working to ensure that all Batswana can participate in the digital economy.
                        </p>
                        <p>
                          I encourage you to use our online services — whether it is filing a complaint, verifying a licence, checking network quality, or participating in public consultations. Your engagement is vital to our mandate. Together, we can build a better-connected Botswana for all.
                        </p>
                      </>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm font-bold text-bocra-slate">Martin Mokgware</p>
                    <p className="text-xs text-bocra-slate/40">{tn ? 'Mokaedi Mogolo, BOCRA' : 'Chief Executive, BOCRA'}</p>
                  </div>
                </div>
              </div>

              {/* Strategic Priorities */}
              <div>
                <h3 className="text-lg font-bold text-bocra-slate mb-4">{tn ? 'Dintlha tsa Togamaano' : 'Strategic Priorities'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRIORITIES.map(p => (
                    <div key={p.title} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: `${p.color}12` }}>
                        <p.icon size={16} style={{ color: p.color }} />
                      </div>
                      <h4 className="text-xs font-bold text-bocra-slate mb-1">{p.title}</h4>
                      <p className="text-[11px] text-bocra-slate/50 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Ka ga Mokaedi Mogolo' : 'About the CE'}</h3>
                <div className="space-y-3">
                  {[
                    { label: tn ? 'Leina ka Botlalo' : 'Full Name', value: tn ? 'Rre Martin Mokgware' : 'Mr. Martin Mokgware', icon: Users, color: '#00458B' },
                    { label: tn ? 'Maemo' : 'Position', value: tn ? 'Mokaedi Mogolo' : 'Chief Executive', icon: Briefcase, color: '#00A6CE' },
                    { label: tn ? 'Mokgatlho' : 'Organisation', value: 'BOCRA', icon: Shield, color: '#C8237B' },
                    { label: tn ? 'O Kwa' : 'Based in', value: 'Gaborone, Botswana', icon: Globe, color: '#6BBE4E' },
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

              {/* Related Pages */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{tn ? 'Botsamaisi jwa BOCRA' : 'BOCRA Leadership'}</h3>
                <div className="space-y-2">
                  {[
                    { label: tn ? 'Lekgotla la Batlhankedi' : 'Board of Directors', path: '/about/board', color: '#00458B' },
                    { label: tn ? 'Botsamaisi jwa Phethagatso' : 'Executive Management', path: '/about/executive-management', color: '#C8237B' },
                    { label: tn ? 'Ka ga BOCRA' : 'About BOCRA', path: '/about/profile', color: '#00A6CE' },
                    { label: tn ? 'Histori' : 'History', path: '/about/history', color: '#F7B731' },
                  ].map(link => (
                    <Link key={link.path} to={link.path} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-all group">
                      <div className="w-2 h-2 rounded-full" style={{ background: link.color }} />
                      <span className="text-xs font-medium text-bocra-slate/70 group-hover:text-bocra-slate">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Speeches */}
              <Link to="/media/speeches" className="flex items-center gap-3 p-4 bg-[#00458B] rounded-xl text-white hover:bg-[#003366] transition-all">
                <BookOpen size={20} />
                <div>
                  <p className="text-sm font-bold">{tn ? 'Dipuo tsa Mokaedi Mogolo' : 'CE Speeches'}</p>
                  <p className="text-[10px] text-white/50">{tn ? 'Bona polokelo ya dipuo' : 'View the speech archive'}</p>
                </div>
                <ArrowRight size={16} className="ml-auto" />
              </Link>

              {/* Contact */}
              <div className="bg-bocra-off-white rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">{tn ? 'Ofisi ya Mokaedi Mogolo' : 'Office of the CE'}</p>
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

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
