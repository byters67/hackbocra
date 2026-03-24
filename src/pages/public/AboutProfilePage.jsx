/**
 * About / Profile Page — Redesigned with BOCRA brand colours
 *
 * Colour mapping (from the four BOCRA dots):
 *   Cyan (#00A6CE) — Telecommunications
 *   Magenta (#C8237B) — Broadcasting
 *   Yellow (#F7B731) — Postal
 *   Green (#6BBE4E) — Internet
 *
 * Bilingual support: EN / TN (Setswana) via useTranslatedStrings hook.
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Target, Eye, Star, Lightbulb, Shield, Heart,
  ArrowRight, Users, Globe, Scale, Landmark, BookOpen
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import { useLanguage } from '../../lib/language';
import { useTranslatedStrings } from '../../hooks/useTranslatedContent';

import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';
const VALUES = [
  { icon: Star, titleKey: 'val.excellence', descKey: 'val.excellenceDesc', color: '#00A6CE', bg: 'bg-[#00A6CE]/10', text: 'text-[#00A6CE]' },
  { icon: Lightbulb, titleKey: 'val.proactiveness', descKey: 'val.proactivenessDesc', color: '#C8237B', bg: 'bg-[#C8237B]/10', text: 'text-[#C8237B]' },
  { icon: Shield, titleKey: 'val.integrity', descKey: 'val.integrityDesc', color: '#F7B731', bg: 'bg-[#F7B731]/10', text: 'text-[#F7B731]' },
  { icon: Heart, titleKey: 'val.people', descKey: 'val.peopleDesc', color: '#6BBE4E', bg: 'bg-[#6BBE4E]/10', text: 'text-[#6BBE4E]' },
];

const CORE_BUSINESS = [
  { titleKey: 'core.competition', descKey: 'core.competitionDesc', icon: Scale, color: '#00A6CE' },
  { titleKey: 'core.access', descKey: 'core.accessDesc', icon: Globe, color: '#C8237B' },
  { titleKey: 'core.consumer', descKey: 'core.consumerDesc', icon: Shield, color: '#F7B731' },
  { titleKey: 'core.resource', descKey: 'core.resourceDesc', icon: Landmark, color: '#6BBE4E' },
  { titleKey: 'core.talent', descKey: 'core.talentDesc', icon: Users, color: '#00A6CE' },
  { titleKey: 'core.stakeholder', descKey: 'core.stakeholderDesc', icon: BookOpen, color: '#C8237B' },
];

/* ── English strings ── */
const ABOUT_EN = {
  'breadcrumb.home': 'Home',
  'breadcrumb.about': 'About BOCRA',
  'hero.section': 'About',
  'hero.title': 'Regulating for a Connected Botswana',
  'hero.desc': 'BOCRA was established on 1 April 2013 through the Communications Regulatory Authority Act 2012 to regulate telecommunications, broadcasting, internet, and postal services in Botswana.',
  'mission.title': 'Our Mission',
  'mission.desc': 'To regulate the Communications sector for the promotion of competition, innovation, consumer protection and universal access.',
  'vision.title': 'Our Vision',
  'vision.desc': 'A connected and Digitally Driven Society.',
  'values.title': 'Our Values',
  'values.subtitle': 'The principles that guide everything we do',
  'core.title': 'Core Business Areas',
  'leadership.title': 'Our Leadership',
  'leadership.ce': 'Chief Executive',
  'leadership.board': 'Board of Directors',
  'leadership.exec': 'Executive Management',
  /* Values */
  'val.excellence': 'Excellence',
  'val.excellenceDesc': 'World-class leader in regulatory services through committed teams and impeccable customer service.',
  'val.proactiveness': 'Proactiveness',
  'val.proactivenessDesc': 'Anticipating and responding to industry changes ahead of time.',
  'val.integrity': 'Integrity',
  'val.integrityDesc': 'Acting with honesty, transparency, and accountability in all we do.',
  'val.people': 'People',
  'val.peopleDesc': 'Putting the needs of Botswana\u2019s citizens and stakeholders first.',
  /* Core Business */
  'core.competition': 'Competition',
  'core.competitionDesc': 'Promoting fair competition among service providers to benefit consumers.',
  'core.access': 'Universal Access',
  'core.accessDesc': 'Ensuring all citizens have access to essential communications services.',
  'core.consumer': 'Consumer Protection',
  'core.consumerDesc': 'Safeguarding the rights and interests of communications consumers.',
  'core.resource': 'Resource Optimisation',
  'core.resourceDesc': 'Efficient management of spectrum and numbering resources.',
  'core.talent': 'Talent Management',
  'core.talentDesc': 'Developing skilled professionals for the communications sector.',
  'core.stakeholder': 'Stakeholder Engagement',
  'core.stakeholderDesc': 'Collaborating with industry, government, and the public.',
};

/* ── Setswana strings ── */
const ABOUT_TN = {
  'breadcrumb.home': 'Gae',
  'breadcrumb.about': 'Ka ga BOCRA',
  'hero.section': 'Ka ga Rona',
  'hero.title': 'Go Laola Botswana e e Golaganeng',
  'hero.desc': 'BOCRA e tlhomilwe ka la 1 Moranang 2013 ka Molao wa Communications Regulatory Authority Act 2012 go laola megala, phasalatso, inthanete, le ditirelo tsa poso mo Botswana.',
  'mission.title': 'Tiro ya Rona',
  'mission.desc': 'Go laola lefapha la dikgolagano go rotloetsa kgaisano, boitlhamedi, tshireletso ya badirisi le phitlhelelo e e akaretsang.',
  'vision.title': 'Pono ya Rona',
  'vision.desc': 'Setšhaba se se golaganeng le se se etelletsweng pele ke dijithale.',
  'values.title': 'Maitlamo a Rona',
  'values.subtitle': 'Meono e e kaelang tsotlhe tse re di dirang',
  'core.title': 'Mafapha a a Botlhokwa a Kgwebo',
  'leadership.title': 'Botsamaisi jwa Rona',
  'leadership.ce': 'Motlhankedi yo Mogolo',
  'leadership.board': 'Boto ya Batsamaisi',
  'leadership.exec': 'Botsamaisi jwa Phethagatso',
  /* Values */
  'val.excellence': 'Bokgabane',
  'val.excellenceDesc': 'Moeteledipele wa maemo a a kwa godimo mo ditirelong tsa taolo ka ditlhopha tse di ikemiseditseng le tirelo e e se nang molato ya badirisi.',
  'val.proactiveness': 'Go Ipaakanyetsa',
  'val.proactivenessDesc': 'Go solofela le go araba diphetogo tsa lefapha ka bonako.',
  'val.integrity': 'Boikanyego',
  'val.integrityDesc': 'Go dira ka boammaaruri, ponagatso, le maikarabelo mo go tsotlhe tse re di dirang.',
  'val.people': 'Batho',
  'val.peopleDesc': 'Go baya ditlhokego tsa baagi ba Botswana le baamegi kwa pele.',
  /* Core Business */
  'core.competition': 'Kgaisano',
  'core.competitionDesc': 'Go rotloetsa kgaisano e e siameng magareng ga batlhagisi ba ditirelo go solegela badirisi molemo.',
  'core.access': 'Phitlhelelo e e Akaretsang',
  'core.accessDesc': 'Go netefatsa gore baagi botlhe ba na le phitlhelelo ya ditirelo tsa dikgolagano tse di botlhokwa.',
  'core.consumer': 'Tshireletso ya Badirisi',
  'core.consumerDesc': 'Go sireletsa ditshwanelo le dikgatlhegelo tsa badirisi ba dikgolagano.',
  'core.resource': 'Tokafatso ya Metswedi',
  'core.resourceDesc': 'Taolo e e nonofileng ya sepeketeramo le metswedi ya dinomoro.',
  'core.talent': 'Taolo ya Bokgoni',
  'core.talentDesc': 'Go godisa baporofešenale ba ba nang le bokgoni ba lefapha la dikgolagano.',
  'core.stakeholder': 'Go Ikgolaganya le Baamegi',
  'core.stakeholderDesc': 'Go dirisanya le madirelo, puso, le setšhaba.',
};

export default function AboutProfilePage() {
  const heroRef = useScrollReveal();
  const valuesRef = useStaggerReveal({ stagger: 0.08 });
  const coreRef = useStaggerReveal({ stagger: 0.06 });
  const { lang } = useLanguage();
  const { translations: at } = useTranslatedStrings(ABOUT_EN, lang, 'about', ABOUT_TN);

  return (
    <div>
      <Helmet>
        <title>About BOCRA — Botswana Communications Regulatory Authority</title>
        <meta name="description" content="Learn about BOCRA's mission, mandate, and role in regulating Botswana's communications sector." />
        <link rel="canonical" href="https://bocra.org.bw/about/profile" />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={[{ label: 'About BOCRA' }]} />
        </div>
      </div>
      {/* Hero */}
      <PageHero category="ABOUT" categoryTn="KA GA RONA" title="Regulating for a Connected Botswana" titleTn="Go Laola Botswana e e Golaganeng" description="BOCRA was established on 1 April 2013 through the Communications Regulatory Authority Act 2012 to regulate telecommunications, broadcasting, internet, and postal services in Botswana." descriptionTn="BOCRA e tlhomilwe ka la 1 Moranang 2013 ka Molao wa Communications Regulatory Authority Act 2012." color="cyan" />


      {/* Mission & Vision — side by side with BOCRA colours */}
      <section className="py-10 md:py-14 bg-white">
        <div className="section-wrapper">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 md:p-10 border-2 border-[#00A6CE]/20 bg-[#00A6CE]/5 hover:border-[#00A6CE]/40 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-[#00A6CE]/10 group-hover:bg-[#00A6CE] transition-colors duration-300">
                <Target size={28} className="text-[#00A6CE] group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-extrabold text-bocra-slate mb-3">{at['mission.title']}</h2>
              <p className="text-bocra-slate/70 text-lg leading-relaxed">
                {at['mission.desc']}
              </p>
            </div>
            <div className="rounded-2xl p-8 md:p-10 border-2 border-[#6BBE4E]/20 bg-[#6BBE4E]/5 hover:border-[#6BBE4E]/40 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-[#6BBE4E]/10 group-hover:bg-[#6BBE4E] transition-colors duration-300">
                <Eye size={28} className="text-[#6BBE4E] group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-extrabold text-bocra-slate mb-3">{at['vision.title']}</h2>
              <p className="text-bocra-slate/70 text-lg leading-relaxed">
                {at['vision.desc']}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values — coloured by BOCRA dots */}
      <section className="py-10 md:py-14 bg-gray-50">
        <div className="section-wrapper">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-bocra-slate">{at['values.title']}</h2>
            <p className="text-bocra-slate/50 mt-2">{at['values.subtitle']}</p>
          </div>
          <div ref={valuesRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.titleKey} className="bg-white rounded-2xl p-7 text-center border-2 border-transparent hover:border-current transition-all duration-300 group hover:shadow-lg hover:-translate-y-1" style={{ '--tw-border-opacity': 0.2, borderColor: `${v.color}33` }}>
                  <div className={`w-16 h-16 ${v.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className={v.text} />
                  </div>
                  <h3 className="font-bold text-bocra-slate text-lg mb-2">{at[v.titleKey]}</h3>
                  <p className="text-sm text-bocra-slate/60 leading-relaxed">{at[v.descKey]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Business — coloured cards */}
      <section className="py-10 md:py-14 bg-white">
        <div className="section-wrapper">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-bocra-slate">{at['core.title']}</h2>
          </div>
          <div ref={coreRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_BUSINESS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.titleKey} className="rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group bg-gray-50 hover:bg-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300" style={{ background: `${item.color}15` }}>
                      <Icon size={22} style={{ color: item.color }} />
                    </div>
                    <div>
                      <span className="text-3xl font-extrabold" style={{ color: `${item.color}30` }}>0{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-bocra-slate text-lg mb-2">{at[item.titleKey]}</h3>
                  <p className="text-sm text-bocra-slate/60 leading-relaxed">{at[item.descKey]}</p>
                  {/* Colour bar at bottom */}
                  <div className="mt-5 h-1 w-12 rounded-full group-hover:w-full transition-all duration-500" style={{ background: item.color }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership links */}
      <section className="py-8 bg-bocra-blue-dark">
        <div className="section-wrapper text-center">
          <h2 className="text-3xl font-extrabold text-white mb-8">{at['leadership.title']}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/about/chief-executive" className="px-6 py-3 bg-white text-bocra-blue font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2">
              {at['leadership.ce']} <ArrowRight size={16} />
            </Link>
            <Link to="/about/board" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
              {at['leadership.board']} <ArrowRight size={16} />
            </Link>
            <Link to="/about/executive-management" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
              {at['leadership.exec']} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
