/**
 * GuidedJourneysPage — Phase 6: Guided Journey landing + individual view.
 *
 * Without :journeyId param → shows a grid of all available journeys.
 * With :journeyId param → renders the GuidedJourney wizard for that journey.
 */
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight, ArrowRight, ArrowLeft, HelpCircle,
  Wifi, Globe, Shield, FileText, MessageSquare, BookOpen,
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';
import GuidedJourney from '../../components/ui/GuidedJourney';
import { journeys } from '../../data/journeys';
import { useLanguage } from '../../lib/language';
import { useStaggerReveal } from '../../hooks/useAnimations';

const ICON_MAP = { Wifi, Globe, Shield, FileText, MessageSquare, BookOpen, HelpCircle };

function resolveIcon(name) {
  return ICON_MAP[name] || HelpCircle;
}

export default function GuidedJourneysPage() {
  const { journeyId } = useParams();
  const { lang, t } = useLanguage();
  const tn = lang === 'tn';
  const cardsRef = useStaggerReveal({ stagger: 0.08 });

  const txt = (en, tnVal) => tn && tnVal ? tnVal : en;

  // ─── Individual journey view ────────────────────────────────
  if (journeyId) {
    const journey = journeys.find(j => j.id === journeyId);

    if (!journey) {
      return (
        <div className="bg-white">
          <div className="bg-bocra-off-white border-b border-gray-100">
            <div className="section-wrapper py-4">
              <Breadcrumb items={[
                { label: tn ? 'Ditirelo' : 'Services', path: '/services/file-complaint' },
                { label: t('guided_journeys_title'), path: '/services/guided-journeys' },
                { label: t('guided_journeys_not_found') },
              ]} />
            </div>
          </div>
          <div className="section-wrapper py-20 text-center">
            <HelpCircle size={48} className="mx-auto mb-4 text-gray-200" />
            <h1 className="text-xl font-bold text-bocra-slate mb-2">{t('guided_journeys_not_found')}</h1>
            <p className="text-sm text-gray-400 mb-6">{t('guided_journeys_not_found_description')}</p>
            <Link to="/services/guided-journeys" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
              <ArrowLeft size={14} /> {t('guided_journeys_back_to_list')}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white">
        <Helmet>
          <title>{txt(journey.title, journey.title_tn)} — BOCRA</title>
          <meta name="description" content={txt(journey.description, journey.description_tn)} />
        </Helmet>
        <div className="bg-bocra-off-white border-b border-gray-100">
          <div className="section-wrapper py-4">
            <Breadcrumb items={[
              { label: tn ? 'Ditirelo' : 'Services', path: '/services/file-complaint' },
              { label: t('guided_journeys_title'), path: '/services/guided-journeys' },
              { label: txt(journey.title, journey.title_tn) },
            ]} />
          </div>
        </div>

        <section className="py-8 sm:py-12">
          <div className="section-wrapper">
            <div className="mb-8">
              <Link to="/services/guided-journeys" className="inline-flex items-center gap-2 text-sm text-[#00A6CE] hover:text-[#00458B] font-medium transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {t('guided_journeys_back_to_list')}
              </Link>
            </div>
            <GuidedJourney journey={journey} />
          </div>
        </section>

        <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
      </div>
    );
  }

  // ─── Landing page: all journeys ─────────────────────────────
  return (
    <div className="bg-white">
      <Helmet>
        <title>{t('guided_journeys_title')} — BOCRA</title>
        <meta name="description" content="Step-by-step guides for common tasks: file a complaint, apply for a licence, find regulations, and more." />
        <link rel="canonical" href="https://bocra.org.bw/services/guided-journeys" />
      </Helmet>

      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={[
            { label: tn ? 'Ditirelo' : 'Services', path: '/services/file-complaint' },
            { label: t('guided_journeys_title') },
          ]} />
        </div>
      </div>

      <PageHero
        category="SERVICES" categoryTn="DITIRELO"
        title="How Can We Help?" titleTn="Re ka Go Thusa Jang?"
        description="Choose a topic below and we'll guide you step by step to the right place."
        descriptionTn="Tlhopha setlhogo fa tlase mme re tla go kaela kgato ka kgato go fitlha mo lefelong le le siameng."
        color="cyan"
      />

      <section className="py-8 sm:py-12">
        <div className="section-wrapper">
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {journeys.map(j => {
              const Icon = resolveIcon(j.icon);
              return (
                <Link
                  key={j.id}
                  to={`/services/guided-journeys/${j.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: j.color }} />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${j.color}15` }}>
                    <Icon size={22} style={{ color: j.color }} />
                  </div>
                  <h3 className="text-base font-bold text-bocra-slate group-hover:text-[#00458B] transition-colors">
                    {txt(j.title, j.title_tn)}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                    {txt(j.description, j.description_tn)}
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-semibold" style={{ color: j.color }}>
                    {tn ? 'Simolola' : 'Start'} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="py-8">
        <div className="section-wrapper max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-3">{tn ? 'Ga o bone se o se batlang?' : "Can\u2019t find what you\u2019re looking for?"}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/search" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
              {tn ? 'Batla mo Webosaeteng' : 'Search the Website'}
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-bocra-slate text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
              {tn ? 'Ikgolaganye le Rona' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
