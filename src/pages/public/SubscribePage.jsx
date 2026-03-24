/**
 * SubscribePage — Public subscription management
 *
 * Phase 7: Citizens subscribe to BOCRA regulatory area updates.
 * Handles 3 states via URL query params:
 *   - Default: subscribe form (email + areas + language)
 *   - ?verify={token}: email verification confirmation
 *   - ?unsubscribe={token}: unsubscribe confirmation
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bell, CheckCircle, AlertCircle, Mail, ChevronRight,
  Wifi, Radio, Globe, Shield, FileText, Loader2,
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useLanguage } from '../../lib/language';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';

const NOTIFICATION_API = `${supabaseUrl_}/functions/v1/send-notification`;

const AREAS = [
  { id: 'telecoms', icon: Wifi, color: '#00A6CE' },
  { id: 'broadcasting', icon: Radio, color: '#C8237B' },
  { id: 'postal', icon: Mail, color: '#F7B731' },
  { id: 'internet_ict', icon: Globe, color: '#6BBE4E' },
  { id: 'licensing', icon: FileText, color: '#00458B' },
  { id: 'cybersecurity', icon: Shield, color: '#F7B731' },
];

export default function SubscribePage() {
  const { lang, t } = useLanguage();
  const tn = lang === 'tn';
  const [searchParams] = useSearchParams();
  const { executeRecaptcha } = useRecaptcha();

  // Detect mode from URL params
  const verifyToken = searchParams.get('verify');
  const unsubscribeToken = searchParams.get('unsubscribe');

  // ─── Verification state ─────────────────────────────────────
  const [verifyStatus, setVerifyStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    if (!verifyToken) return;
    (async () => {
      try {
        const res = await fetch(NOTIFICATION_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey_}`, apikey: supabaseAnonKey_ },
          body: JSON.stringify({ action: 'verify', token: verifyToken }),
        });
        const data = await res.json();
        setVerifyStatus(data.success ? 'success' : 'error');
      } catch {
        setVerifyStatus('error');
      }
    })();
  }, [verifyToken]);

  // ─── Unsubscribe state ──────────────────────────────────────
  const [unsubStatus, setUnsubStatus] = useState('loading');

  useEffect(() => {
    if (!unsubscribeToken) return;
    (async () => {
      try {
        const res = await fetch(NOTIFICATION_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey_}`, apikey: supabaseAnonKey_ },
          body: JSON.stringify({ action: 'unsubscribe', token: unsubscribeToken }),
        });
        const data = await res.json();
        setUnsubStatus(data.success ? 'success' : 'error');
      } catch {
        setUnsubStatus('error');
      }
    })();
  }, [unsubscribeToken]);

  // ─── Subscribe form state ───────────────────────────────────
  const [email, setEmail] = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [notifLang, setNotifLang] = useState(lang);
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(''); // '' | 'success' | 'error'
  const [formError, setFormError] = useState('');

  function toggleArea(areaId) {
    setSelectedAreas(prev =>
      prev.includes(areaId) ? prev.filter(a => a !== areaId) : [...prev, areaId]
    );
  }

  function toggleAll() {
    if (selectedAreas.length === AREAS.length) {
      setSelectedAreas([]);
    } else {
      setSelectedAreas(AREAS.map(a => a.id));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(tn ? 'Tsweetswee kenya aterese ya imeili e e siameng.' : 'Please enter a valid email address.');
      return;
    }
    if (selectedAreas.length === 0) {
      setFormError(t('subscribe_at_least_one_area'));
      return;
    }

    setSubmitting(true);

    try {
      const recaptchaToken = await executeRecaptcha('subscribe');

      const res = await fetch(NOTIFICATION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey_}`, apikey: supabaseAnonKey_ },
        body: JSON.stringify({
          action: 'subscribe',
          email: email.trim(),
          areas: selectedAreas,
          language: notifLang,
          recaptcha_token: recaptchaToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormStatus('success');
      } else {
        setFormError(data.error || t('subscribe_error'));
      }
    } catch {
      setFormError(t('subscribe_error'));
    } finally {
      setSubmitting(false);
    }
  }

  const areaLabel = (id) => t(`subscribe_area_${id === 'internet_ict' ? 'internet' : id}`);

  // ─── Verify page ────────────────────────────────────────────
  if (verifyToken) {
    return (
      <div className="bg-white">
        <Helmet><title>{t('subscribe_title')} — BOCRA</title></Helmet>
        <div className="bg-bocra-off-white border-b border-gray-100">
          <div className="section-wrapper py-4"><Breadcrumb items={[{ label: t('subscribe_title') }]} /></div>
        </div>
        <div className="section-wrapper py-20 text-center">
          {verifyStatus === 'loading' && <Loader2 size={32} className="mx-auto mb-4 text-[#00A6CE] animate-spin" />}
          {verifyStatus === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-bocra-slate mb-2">{tn ? 'E Netefaditswe!' : 'Verified!'}</h1>
              <p className="text-sm text-gray-500 max-w-md mx-auto">{t('subscribe_verified')}</p>
            </>
          )}
          {verifyStatus === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-bocra-slate mb-2">{tn ? 'Phoso' : 'Error'}</h1>
              <p className="text-sm text-gray-500 max-w-md mx-auto">{t('subscribe_verify_error')}</p>
            </>
          )}
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
            {tn ? 'Boela Gae' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  // ─── Unsubscribe page ───────────────────────────────────────
  if (unsubscribeToken) {
    return (
      <div className="bg-white">
        <Helmet><title>{t('subscribe_title')} — BOCRA</title></Helmet>
        <div className="bg-bocra-off-white border-b border-gray-100">
          <div className="section-wrapper py-4"><Breadcrumb items={[{ label: t('subscribe_title') }]} /></div>
        </div>
        <div className="section-wrapper py-20 text-center">
          {unsubStatus === 'loading' && <Loader2 size={32} className="mx-auto mb-4 text-[#00A6CE] animate-spin" />}
          {unsubStatus === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-gray-400" />
              </div>
              <h1 className="text-xl font-bold text-bocra-slate mb-2">{tn ? 'O Tlositswe' : 'Unsubscribed'}</h1>
              <p className="text-sm text-gray-500 max-w-md mx-auto">{t('subscribe_unsubscribed')}</p>
            </>
          )}
          {unsubStatus === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-bocra-slate mb-2">{tn ? 'Phoso' : 'Error'}</h1>
              <p className="text-sm text-gray-500 max-w-md mx-auto">{t('subscribe_unsubscribe_error')}</p>
            </>
          )}
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 bg-[#00458B] text-white text-sm font-medium rounded-xl hover:bg-[#003366] transition-all">
            {tn ? 'Boela Gae' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  // ─── Subscribe form (success state) ─────────────────────────
  if (formStatus === 'success') {
    return (
      <div className="bg-white">
        <Helmet><title>{t('subscribe_title')} — BOCRA</title></Helmet>
        <div className="bg-bocra-off-white border-b border-gray-100">
          <div className="section-wrapper py-4"><Breadcrumb items={[{ label: t('subscribe_title') }]} /></div>
        </div>
        <PageHero category="SERVICES" categoryTn="DITIRELO" title="Subscribe to BOCRA Updates" titleTn="Ingodisa go Fumana Dikitsiso tsa BOCRA" color="cyan" />
        <div className="section-wrapper py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-bocra-slate mb-2">{tn ? 'Tlhola Imeili ya Gago' : 'Check Your Email'}</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('subscribe_success')}</p>
        </div>
        <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
      </div>
    );
  }

  // ─── Subscribe form ─────────────────────────────────────────
  return (
    <div className="bg-white">
      <Helmet>
        <title>{t('subscribe_title')} — BOCRA</title>
        <meta name="description" content="Subscribe to BOCRA regulatory updates in telecommunications, broadcasting, postal, and internet services." />
      </Helmet>

      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <Breadcrumb items={[{ label: t('subscribe_title') }]} />
        </div>
      </div>

      <PageHero
        category="SERVICES" categoryTn="DITIRELO"
        title="Subscribe to BOCRA Updates" titleTn="Ingodisa go Fumana Dikitsiso tsa BOCRA"
        description="Get notified when new documents, consultations, or regulations are published."
        descriptionTn="Fumana dikitsiso fa dikwalo, ditheriso, kgotsa melawana e mesha e gatisiwa."
        color="cyan"
      />

      <section className="py-8 sm:py-12">
        <div className="section-wrapper max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="sub-email" className="block text-sm font-semibold text-bocra-slate mb-1.5">
                {t('subscribe_email')}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="sub-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t('subscribe_email_placeholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00458B] focus:ring-1 focus:ring-[#00458B]/20 outline-none"
                  required
                />
              </div>
            </div>

            {/* Areas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-bocra-slate">
                  {t('subscribe_areas')}
                </label>
                <button type="button" onClick={toggleAll} className="text-xs text-[#00A6CE] hover:text-[#00458B] font-medium">
                  {selectedAreas.length === AREAS.length ? t('subscribe_deselect_all') : t('subscribe_select_all')}
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">{t('subscribe_areas_description')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label={t('subscribe_areas')}>
                {AREAS.map(area => {
                  const Icon = area.icon;
                  const selected = selectedAreas.includes(area.id);
                  return (
                    <button
                      key={area.id} type="button"
                      onClick={() => toggleArea(area.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${selected ? 'border-current shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                      style={selected ? { borderColor: area.color } : undefined}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${area.color}15` }}>
                        <Icon size={16} style={{ color: area.color }} />
                      </div>
                      <span className={`text-sm font-medium ${selected ? 'text-bocra-slate' : 'text-gray-500'}`}>
                        {areaLabel(area.id)}
                      </span>
                      {selected && (
                        <CheckCircle size={16} className="ml-auto flex-shrink-0" style={{ color: area.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language preference */}
            <div>
              <label className="block text-sm font-semibold text-bocra-slate mb-2">
                {t('subscribe_language_pref')}
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setNotifLang('en')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${notifLang === 'en' ? 'border-[#00458B] bg-[#00458B]/5 text-[#00458B]' : 'border-gray-100 text-gray-500'}`}>
                  {t('subscribe_language_en')}
                </button>
                <button type="button" onClick={() => setNotifLang('tn')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${notifLang === 'tn' ? 'border-[#00458B] bg-[#00458B]/5 text-[#00458B]' : 'border-gray-100 text-gray-500'}`}>
                  {t('subscribe_language_tn')}
                </button>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('subscribe_privacy')}
            </p>

            {/* Error */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2" aria-live="polite">
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={submitting}
              aria-busy={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00458B] text-white font-bold rounded-xl hover:bg-[#003366] disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> {t('subscribe_submitting')}</>
              ) : (
                <><Bell size={16} /> {t('subscribe_submit')}</>
              )}
            </button>
          </form>
        </div>
      </section>

      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
