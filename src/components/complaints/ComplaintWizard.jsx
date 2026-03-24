/**
 * ComplaintWizard.jsx — Multi-step complaint filing wizard
 *
 * Phase 1 of the BOCRA Implementation Roadmap.
 * Replaces the flat complaint form with a guided 6-step experience:
 *   1. Select service provider (visual cards)
 *   2. Select complaint type (contextual to provider category)
 *   3. Have you contacted your provider? (gate with support number)
 *   4. Describe the problem (free text + helper prompts)
 *   5. Your contact details
 *   6. Review & submit
 *
 * Wires to the existing submit-form Edge Function and classify-complaint pipeline.
 * Bilingual: English + Setswana throughout.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle,
  Phone, Send, Edit2,
} from 'lucide-react';

const BASE = import.meta.env.BASE_URL; // '/hackbocra/' — matches vite.config.js base
import { useLanguage } from '../../lib/language';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { sanitizeInput, validateEmail } from '../../lib/security';
import { checkRateLimit, supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';
import ConsentCheckbox from '../ui/ConsentCheckbox';

// ─── PROVIDER REGISTRY ────────────────────────────────────────────────────────
// logoSrc: path relative to BASE_URL (public/images/operators/).
//   null = no logo file yet → falls back to colorClass initial badge.
// colorClass: fallback background when logo is absent or fails to load.
const PROVIDERS = [
  { id: 'mascom',    name: 'Mascom Wireless',                              shortName: 'Mascom',    category: 'mobile',       supportPhone: '119',           logoSrc: `${BASE}images/operators/mascom.png`,       colorClass: 'bg-red-500'    },
  { id: 'btc',       name: 'Botswana Telecommunications Corporation (BTC)',shortName: 'BTC',       category: 'telco',        supportPhone: '121',           logoSrc: `${BASE}images/operators/btc.png`,          colorClass: 'bg-blue-700'   },
  { id: 'orange',    name: 'Orange Botswana',                              shortName: 'Orange',    category: 'mobile',       supportPhone: '111',           logoSrc: `${BASE}images/operators/orange.png`,       colorClass: 'bg-orange-500' },
  { id: 'bofinet',   name: 'Botswana Fibre Networks (BoFiNet)',            shortName: 'BoFiNet',   category: 'internet',     supportPhone: '+267 317 0000', logoSrc: `${BASE}images/operators/bofinet.png`,      colorClass: 'bg-emerald-600'},
  { id: 'bwpost',    name: 'Botswana Post',                                shortName: 'BW Post',   category: 'postal',       supportPhone: '+267 368 1000', logoSrc: `${BASE}images/operators/botswana-post.png`,colorClass: 'bg-red-600'    },
  { id: 'yarona',    name: 'Yarona FM',                                    shortName: 'Yarona FM', category: 'broadcasting', supportPhone: '+267 360 1400', logoSrc: `${BASE}images/operators/yarona-fm.png`,    colorClass: 'bg-purple-600' },
  { id: 'duma',      name: 'Duma FM',                                      shortName: 'Duma FM',   category: 'broadcasting', supportPhone: '+267 391 2222', logoSrc: `${BASE}images/operators/duma-fm.png`,      colorClass: 'bg-pink-600'   },
  { id: 'gabz',      name: 'Gabz FM',                                      shortName: 'Gabz FM',   category: 'broadcasting', supportPhone: '+267 360 0000', logoSrc: `${BASE}images/operators/gabz-fm.png`,      colorClass: 'bg-teal-600'   },
  { id: 'ebotswana', name: 'eBotswana TV',                                 shortName: 'eBotswana', category: 'broadcasting', supportPhone: '+267 395 0000', logoSrc: `${BASE}images/operators/ebotswana.png`,    colorClass: 'bg-indigo-600' },
  { id: 'other',     name: 'Other',                                        shortName: 'Other',     category: 'general',      supportPhone: null,            logoSrc: null,                                       colorClass: 'bg-gray-400'   },
];

// ─── COMPLAINT TYPES BY PROVIDER CATEGORY ─────────────────────────────────────
const COMPLAINT_TYPES = {
  mobile: {
    en: ['Billing / Charging Issues', 'Network Coverage / Signal Problems', 'Internet & Data Service Quality', 'Service Activation Delays', 'Customer Service Issues', 'SIM Swap Issues', 'Consumer Rights Violation', 'Other'],
    tn: ['Mathata a Dituelo / Go Lefisiwa', 'Phitlhelelo ya Neteweke / Mathata a Letshwao', 'Boleng jwa Tirelo ya Inthanete', 'Go Diega ga Tshupo ya Tirelo', 'Ditirelo tsa Badirisi', 'Mathata a SIM Swap', 'Go Tlolwa ga Ditshwanelo tsa Badirisi', 'Tse Dingwe'],
  },
  telco: {
    en: ['Billing / Charging Issues', 'Broadband / Internet Quality', 'Line Quality Problems', 'Installation / Activation Delays', 'Customer Service Issues', 'Consumer Rights Violation', 'Other'],
    tn: ['Mathata a Dituelo / Go Lefisiwa', 'Boleng jwa Broadband / Inthanete', 'Mathata a Boleng jwa Molelo', 'Go Diega ga Tshomiso / Tshupo', 'Ditirelo tsa Badirisi', 'Go Tlolwa ga Ditshwanelo tsa Badirisi', 'Tse Dingwe'],
  },
  internet: {
    en: ['Billing / Charging Issues', 'Connectivity / Outage', 'Slow Speed Issues', 'Service Activation Delays', 'Customer Service Issues', 'Other'],
    tn: ['Mathata a Dituelo / Go Lefisiwa', 'Kgolagano / Go Tima ga Tirelo', 'Lebelo le le Nnyennye', 'Go Diega ga Tshupo ya Tirelo', 'Ditirelo tsa Badirisi', 'Tse Dingwe'],
  },
  broadcasting: {
    en: ['Signal / Reception Problems', 'Content Issues', 'Advertising Complaints', 'Service Availability', 'Consumer Rights Violation', 'Other'],
    tn: ['Mathata a Letshwao / Amogelo', 'Mathata a Diteng', 'Dingongorego tsa Papatso', 'Phitlhelelo ya Tirelo', 'Go Tlolwa ga Ditshwanelo tsa Badirisi', 'Tse Dingwe'],
  },
  postal: {
    en: ['Lost Mail / Parcel', 'Delivery Delays', 'Damaged Parcel', 'Customs Issues', 'Customer Service Issues', 'Other'],
    tn: ['Lekwalo / Phasela e Latlhegileng', 'Go Diega ga Abo', 'Phasela e Sentswe', 'Mathata a Customs', 'Ditirelo tsa Badirisi', 'Tse Dingwe'],
  },
  general: {
    en: ['Billing / Charging Issues', 'Service Quality', 'Consumer Rights Violation', 'Licensing Query', 'Spectrum / Frequency Interference', 'Other'],
    tn: ['Mathata a Dituelo', 'Boleng jwa Tirelo', 'Go Tlolwa ga Ditshwanelo tsa Badirisi', 'Potso ya Laesense', 'Tshitswako ya Sepeketeramo / Frikwensi', 'Tse Dingwe'],
  },
};

// ─── DESCRIPTION HELPER PROMPTS ───────────────────────────────────────────────
const DESCRIPTION_PROMPTS = {
  en: ['When did this problem start?', 'What have you already tried?', 'How has this affected you?', 'Do you have a reference number from your provider?'],
  tn: ['Bothata jono bo simologa leng?', 'O setse o lekile eng?', 'Go go amile jang?', 'A o na le nomoro ya tshupetso go tswa go motlamedi wa gago?'],
};

// ─── STEP LABELS FOR PROGRESS BAR ─────────────────────────────────────────────
const STEP_NAMES = {
  en: ['Provider', 'Problem', 'Contact', 'Describe', 'Details', 'Review'],
  tn: ['Motlamedi', 'Bothata', 'Kgolagano', 'Tlhaloso', 'Tshedimosetso', 'Sekaseka'],
};

const TOTAL_STEPS = 6;

// ─── ANALYTICS STUB ───────────────────────────────────────────────────────────
// Dispatches a custom DOM event. Connect to your analytics provider here.
function trackWizardEvent(eventName, props = {}) {
  if (import.meta.env.DEV) {
    console.log('[wizard]', eventName, props);
  }
  window.dispatchEvent(new CustomEvent('bocra:wizard', { detail: { event: eventName, ...props } }));
}

// ─── PROVIDER LOGO ────────────────────────────────────────────────────────────
// Shows the provider's actual logo; falls back to a coloured initial badge on
// load error (404 for missing files) so cards always look consistent.
function ProviderLogo({ src, alt, colorClass, initial }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
        {initial}
      </div>
    );
  }
  return (
    <div className="h-10 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="h-10 w-auto object-contain max-w-[88px]"
        onError={() => setErr(true)}
      />
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ step, lang }) {
  const names = STEP_NAMES[lang] || STEP_NAMES.en;
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-1 mb-3">
        {names.map((name, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="flex flex-col items-center flex-1 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                done   ? 'bg-bocra-green text-white' :
                active ? 'bg-bocra-blue text-white ring-4 ring-bocra-blue/20' :
                         'bg-gray-200 text-gray-400'
              }`}>
                {done ? <CheckCircle size={14} /> : n}
              </div>
              <span className={`hidden sm:block mt-1 text-[10px] font-medium text-center truncate w-full ${
                active ? 'text-bocra-blue' : done ? 'text-bocra-green' : 'text-gray-400'
              }`}>
                {name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-bocra-blue rounded-full transition-all duration-300"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>
      <p className="text-right text-xs text-bocra-slate/40 mt-1">
        {lang === 'tn' ? `Kgato ${step} ya ${TOTAL_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}
      </p>
    </div>
  );
}

// ─── BACK BUTTON ──────────────────────────────────────────────────────────────
function BackBtn({ lang, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-bocra-slate/60 hover:text-bocra-slate transition-colors"
    >
      <ChevronLeft size={16} />
      {lang === 'tn' ? 'Boela Moago' : 'Back'}
    </button>
  );
}

// ─── STEP 1: PROVIDER SELECTION ───────────────────────────────────────────────
function StepProvider({ lang, selected, onSelect, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-bocra-slate">
          {lang === 'tn' ? 'Ke mang motlamedi wa gago wa tirelo?' : 'Who is your service provider?'}
        </h3>
        <p className="text-sm text-bocra-slate/60 mt-1">
          {lang === 'tn' ? 'Tlhopha kgampani e o nang le bothata le yone' : 'Select the company you have a complaint about'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              onSelect(p.name);
              trackWizardEvent('wizard_provider_selected', { provider: p.name });
            }}
            className={`relative p-3 rounded-xl border-2 transition-all text-left flex flex-col items-center justify-center gap-2 min-h-[88px] ${
              selected === p.name
                ? 'border-bocra-blue bg-bocra-blue/5 shadow-sm'
                : 'border-gray-200 bg-white hover:border-bocra-blue/40 hover:bg-bocra-off-white'
            }`}
          >
            <ProviderLogo
              src={p.logoSrc}
              alt={p.shortName}
              colorClass={p.colorClass}
              initial={p.shortName.charAt(0)}
            />
            <p className="text-[11px] font-semibold text-bocra-slate leading-tight text-center">{p.shortName}</p>
            {selected === p.name && (
              <div className="absolute top-2 right-2">
                <CheckCircle size={15} className="text-bocra-blue" />
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => {
          trackWizardEvent('wizard_step_completed', { step: 1 });
          onNext();
        }}
        className="btn-primary w-full justify-center disabled:opacity-40"
      >
        {lang === 'tn' ? 'Tswelela' : 'Continue'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── STEP 2: COMPLAINT TYPE ────────────────────────────────────────────────────
function StepComplaintType({ lang, provider, selected, onSelect, onNext, onBack }) {
  const providerObj = PROVIDERS.find((p) => p.name === provider) || PROVIDERS[PROVIDERS.length - 1];
  const types = (COMPLAINT_TYPES[providerObj.category] || COMPLAINT_TYPES.general)[lang] || COMPLAINT_TYPES.general.en;

  return (
    <div className="space-y-6">
      <BackBtn lang={lang} onClick={onBack} />
      <div>
        <p className="text-xs font-semibold text-bocra-blue uppercase tracking-wider mb-1">
          {providerObj.shortName}
        </p>
        <h3 className="text-xl font-bold text-bocra-slate">
          {lang === 'tn' ? 'Ke mofuta ofe wa bothata?' : 'What type of problem are you experiencing?'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${
              selected === type
                ? 'border-bocra-blue bg-bocra-blue/5 text-bocra-blue font-medium'
                : 'border-gray-200 text-bocra-slate hover:border-bocra-blue/40 hover:bg-bocra-off-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => {
          trackWizardEvent('wizard_step_completed', { step: 2, complaintType: selected });
          onNext();
        }}
        className="btn-primary w-full justify-center disabled:opacity-40"
      >
        {lang === 'tn' ? 'Tswelela' : 'Continue'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── STEP 3: CONTACTED PROVIDER? ──────────────────────────────────────────────
function StepContactedProvider({ lang, provider, contacted, onAnswer, onNext, onBack }) {
  const providerObj = PROVIDERS.find((p) => p.name === provider);
  const shortName = providerObj?.shortName || provider;

  return (
    <div className="space-y-6">
      <BackBtn lang={lang} onClick={onBack} />
      <div>
        <h3 className="text-xl font-bold text-bocra-slate">
          {lang === 'tn'
            ? `A o setse o ikgolaganye le ${shortName} ka tlhamalalo?`
            : `Have you contacted ${shortName} directly?`}
        </h3>
        <p className="text-sm text-bocra-slate/60 mt-1">
          {lang === 'tn'
            ? 'BOCRA e kopa gore o leke go rarabolola bothata le motlamedi pele o bua le rona'
            : 'BOCRA recommends first raising the issue directly with your provider before escalating'}
        </p>
      </div>

      <div className="flex gap-3">
        {[true, false].map((val) => (
          <button
            key={String(val)}
            type="button"
            onClick={() => onAnswer(val)}
            className={`flex-1 py-3.5 rounded-xl border-2 font-medium text-sm transition-all ${
              contacted === val
                ? 'border-bocra-blue bg-bocra-blue/5 text-bocra-blue'
                : 'border-gray-200 text-bocra-slate hover:border-bocra-blue/40'
            }`}
          >
            {val
              ? (lang === 'tn' ? 'Ee, ke ikgolaganye' : 'Yes, I have')
              : (lang === 'tn' ? "Nnyaa, ga ke iko" : "No, I haven't")}
          </button>
        ))}
      </div>

      {contacted === false && providerObj?.supportPhone && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Phone size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">
              {lang === 'tn'
                ? `Leka go ikgolaganye le ${shortName} pele`
                : `Try contacting ${shortName} first`}
            </p>
            <p className="text-sm text-amber-700">
              {lang === 'tn' ? 'Nomoro ya mogala: ' : 'Support number: '}
              <a href={`tel:${providerObj.supportPhone}`} className="font-bold underline">
                {providerObj.supportPhone}
              </a>
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {lang === 'tn'
                ? 'Fa e ntse e sa rarabololwa, tswelela go tlhagisa ngongorego eno.'
                : 'If the issue remains unresolved, you can still continue filing this complaint.'}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={contacted === null || contacted === undefined}
        onClick={() => {
          trackWizardEvent('wizard_step_completed', { step: 3, contactedProvider: contacted });
          onNext();
        }}
        className="btn-primary w-full justify-center disabled:opacity-40"
      >
        {lang === 'tn' ? 'Tswelela' : 'Continue'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── STEP 4: DESCRIPTION ──────────────────────────────────────────────────────
function StepDescription({ lang, description, onChange, onNext, onBack }) {
  const [error, setError] = useState('');
  const prompts = DESCRIPTION_PROMPTS[lang] || DESCRIPTION_PROMPTS.en;
  const MIN_LEN = 20;

  const handleNext = () => {
    if (!description.trim() || description.trim().length < MIN_LEN) {
      setError(
        lang === 'tn'
          ? `Tsweetswee fana ka dintlha tse di oketsegileng (bonnye ditlhaka di le ${MIN_LEN})`
          : `Please provide more detail (minimum ${MIN_LEN} characters)`,
      );
      return;
    }
    setError('');
    trackWizardEvent('wizard_step_completed', { step: 4, descriptionLength: description.length });
    onNext();
  };

  return (
    <div className="space-y-6">
      <BackBtn lang={lang} onClick={onBack} />
      <div>
        <h3 className="text-xl font-bold text-bocra-slate">
          {lang === 'tn' ? 'Tlhalosa se se diragetseng' : 'Describe what happened'}
        </h3>
        <p className="text-sm text-bocra-slate/60 mt-1">
          {lang === 'tn'
            ? 'Dintlha tse di oketsegileng di re thusa go batlisisa bothata ka bonako'
            : 'The more detail you provide, the faster we can investigate your complaint'}
        </p>
      </div>

      <div className="bg-bocra-off-white rounded-xl p-3">
        <p className="text-xs font-semibold text-bocra-slate/50 uppercase tracking-wider mb-2">
          {lang === 'tn' ? 'Dipotsoseletso tsa thuso:' : 'Helpful prompts:'}
        </p>
        <ul className="space-y-1">
          {prompts.map((prompt) => (
            <li key={prompt} className="text-xs text-bocra-slate/60 flex items-start gap-2">
              <span className="text-bocra-blue mt-0.5 shrink-0">›</span>
              {prompt}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => { onChange(e.target.value); setError(''); }}
          rows={6}
          placeholder={
            lang === 'tn'
              ? 'Tlhalosa bothata jwa gago kwa...'
              : 'Describe your complaint here...'
          }
          className={`w-full px-4 py-3 bg-bocra-off-white border rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all resize-none ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
        <div className="flex items-center justify-between mt-1">
          {error
            ? <p className="text-xs text-red-500">{error}</p>
            : <span />}
          <p className={`text-xs ${description.length >= MIN_LEN ? 'text-bocra-green' : 'text-bocra-slate/40'}`}>
            {description.length} {lang === 'tn' ? 'ditlhaka' : 'chars'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="btn-primary w-full justify-center"
      >
        {lang === 'tn' ? 'Tswelela' : 'Continue'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── STEP 5: CONTACT DETAILS ──────────────────────────────────────────────────
function StepDetails({ lang, data, onChange, consent, onConsentChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    const e = {};
    if (!data.name.trim())
      e.name = lang === 'tn' ? 'Leina le a tlhokega' : 'Name is required';
    if (!data.email.trim())
      e.email = lang === 'tn' ? 'Imeile e a tlhokega' : 'Email is required';
    else if (!validateEmail(data.email))
      e.email = lang === 'tn' ? 'Mokgwa wa imeile o o fosagetseng' : 'Invalid email format';
    if (data.phone && !/^\+?\d{7,15}$/.test(data.phone.replace(/\s/g, '')))
      e.phone = lang === 'tn' ? 'Nomoro ya mogala e fosagetseng' : 'Invalid phone number';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    trackWizardEvent('wizard_step_completed', { step: 5 });
    onNext();
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-bocra-off-white border rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="space-y-6">
      <BackBtn lang={lang} onClick={onBack} />
      <div>
        <h3 className="text-xl font-bold text-bocra-slate">
          {lang === 'tn' ? 'Tshedimosetso ya gago' : 'Your contact details'}
        </h3>
        <p className="text-sm text-bocra-slate/60 mt-1">
          {lang === 'tn'
            ? 'Re tlhoka tshedimosetso eno go go romela diphetogo ka ga ngongorego ya gago'
            : 'We need this to send you updates and notify you about the progress of your complaint'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-bocra-slate mb-1.5">
            {lang === 'tn' ? 'Leina ka Botlalo *' : 'Full Name *'}
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => { onChange('name', e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
            placeholder={lang === 'tn' ? 'Leina la gago ka botlalo' : 'Your full name'}
            className={inputClass('name')}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-bocra-slate mb-1.5">
            {lang === 'tn' ? 'Aterese ya Imeile *' : 'Email Address *'}
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => { onChange('email', e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
            placeholder="your@email.com"
            className={inputClass('email')}
          />
          {errors.email
            ? <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            : <p className="text-xs text-bocra-slate/40 mt-1">{lang === 'tn' ? 'O tla amogela diphetogo ka imeile' : 'You will receive updates at this email'}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-bocra-slate mb-1.5">
            {lang === 'tn' ? 'Nomoro ya Mogala' : 'Phone Number'}{' '}
            <span className="text-bocra-slate/40 font-normal">
              ({lang === 'tn' ? 'ga e tlhokelwe' : 'optional'})
            </span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => { onChange('phone', e.target.value); setErrors((p) => ({ ...p, phone: '' })); }}
            placeholder="+267 7X XXX XXXX"
            className={inputClass('phone')}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-bocra-slate mb-1.5">
            {lang === 'tn' ? 'Kompone / Mokgatlho' : 'Company / Organisation'}{' '}
            <span className="text-bocra-slate/40 font-normal">
              ({lang === 'tn' ? 'fa go tshwanela' : 'if applicable'})
            </span>
          </label>
          <input
            type="text"
            value={data.company}
            onChange={(e) => onChange('company', e.target.value)}
            placeholder={lang === 'tn' ? 'Fa go amanang' : 'If applicable'}
            className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all"
          />
        </div>

        <ConsentCheckbox
          checked={consent}
          onChange={onConsentChange}
          purpose="investigating and resolving your complaint, which may involve sharing details with the relevant service provider"
          purposeTn="go batlisisa le go rarabolola ngongorego ya gago, se se ka akaretsang go abelana dintlha le motlamedi wa tirelo"
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="btn-primary w-full justify-center"
      >
        {lang === 'tn' ? 'Sekaseka Ngongorego' : 'Review Complaint'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── REVIEW CARD (used in Step 6) ─────────────────────────────────────────────
function ReviewCard({ lang, title, onEdit, children }) {
  return (
    <div className="bg-bocra-off-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-bocra-slate/50 uppercase tracking-wider">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-bocra-blue hover:underline"
        >
          <Edit2 size={11} />
          {lang === 'tn' ? 'Fetola' : 'Edit'}
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── STEP 6: REVIEW & SUBMIT ──────────────────────────────────────────────────
function StepReview({ lang, data, onGoToStep, onSubmit, loading, error, onBack }) {
  return (
    <div className="space-y-6">
      <BackBtn lang={lang} onClick={onBack} />
      <div>
        <h3 className="text-xl font-bold text-bocra-slate">
          {lang === 'tn' ? 'Sekaseka le romela' : 'Review & submit'}
        </h3>
        <p className="text-sm text-bocra-slate/60 mt-1">
          {lang === 'tn'
            ? 'Netefatsa gore tshedimosetso yotlhe e nepagetseng pele o romela'
            : 'Confirm all details are correct before submitting'}
        </p>
      </div>

      <div className="space-y-3">
        <ReviewCard
          lang={lang}
          title={lang === 'tn' ? 'Motlamedi le Bothata' : 'Provider & Problem Type'}
          onEdit={() => onGoToStep(1)}
        >
          <p className="text-sm font-medium text-bocra-slate">{data.provider}</p>
          <p className="text-sm text-bocra-slate/70">{data.complaintType}</p>
        </ReviewCard>

        <ReviewCard
          lang={lang}
          title={lang === 'tn' ? 'Kgolagano e e Fetileng' : 'Prior Contact with Provider'}
          onEdit={() => onGoToStep(3)}
        >
          <p className="text-sm text-bocra-slate">
            {data.contactedProvider
              ? (lang === 'tn' ? 'Ee — ke ikgolaganye le motlamedi pele' : 'Yes — contacted provider directly')
              : (lang === 'tn' ? 'Nnyaa — ga ke a ikgolaganye le motlamedi' : 'No — have not contacted provider')}
          </p>
        </ReviewCard>

        <ReviewCard
          lang={lang}
          title={lang === 'tn' ? 'Tlhaloso' : 'Description'}
          onEdit={() => onGoToStep(4)}
        >
          <p className="text-sm text-bocra-slate/80 line-clamp-4 whitespace-pre-wrap">{data.description}</p>
        </ReviewCard>

        <ReviewCard
          lang={lang}
          title={lang === 'tn' ? 'Tshedimosetso ya Mogoba' : 'Contact Details'}
          onEdit={() => onGoToStep(5)}
        >
          <p className="text-sm font-medium text-bocra-slate">{data.name}</p>
          <p className="text-sm text-bocra-slate/70">{data.email}</p>
          {data.phone   && <p className="text-sm text-bocra-slate/70">{data.phone}</p>}
          {data.company && <p className="text-sm text-bocra-slate/70">{data.company}</p>}
        </ReviewCard>
      </div>

      <div className="bg-bocra-off-white rounded-xl p-4">
        <p className="text-xs text-bocra-slate/60 leading-relaxed">
          {lang === 'tn'
            ? 'Ka go romela ngongorego eno, o netefatsa gore tshedimosetso e o e fentseng e nepagala mme o dumelana le gore BOCRA e abelane dintlha tse di maleba le motlamedi wa tirelo go batlisisa ngongorego ya gago.'
            : 'By submitting this complaint you confirm that the information provided is accurate and consent to BOCRA sharing relevant details with your service provider to investigate your complaint.'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</p>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          trackWizardEvent('wizard_submit_clicked');
          onSubmit();
        }}
        className="btn-primary w-full justify-center text-lg py-4 disabled:opacity-60"
      >
        {loading
          ? (lang === 'tn' ? 'E a romela...' : 'Submitting...')
          : (lang === 'tn' ? 'Romela Ngongorego' : 'Submit Complaint')}
        <Send size={18} />
      </button>
    </div>
  );
}

// ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
function SuccessScreen({ lang, referenceNumber, hasPhone }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-bocra-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={40} className="text-bocra-green" />
      </div>
      <h3 className="text-2xl font-bold text-bocra-slate mb-3">
        {lang === 'tn' ? 'Ngongorego e Rometse!' : 'Complaint Submitted!'}
      </h3>

      {/* Reference number */}
      {referenceNumber && (
        <div className="bg-bocra-blue/5 border border-bocra-blue/20 rounded-xl px-6 py-4 mb-4 inline-block">
          <p className="text-xs font-semibold text-bocra-blue/60 uppercase tracking-wider mb-1">
            {lang === 'tn' ? 'Nomoro ya Tshupetso' : 'Reference Number'}
          </p>
          <p className="text-2xl font-mono font-bold text-bocra-blue">{referenceNumber}</p>
          <p className="text-xs text-bocra-slate/50 mt-1">
            {lang === 'tn' ? 'Boloka nomoro eno' : 'Save this number'}
          </p>
        </div>
      )}

      <p className="text-bocra-slate/60 mb-2 max-w-sm mx-auto">
        {lang === 'tn'
          ? 'Re a leboga go romela ngongorego ya gago. BOCRA e tla e sekaseka mme e arabe mo malatsing a le 2 a tiriso.'
          : 'Thank you for submitting your complaint. BOCRA will review it and respond within 2 business days.'}
      </p>

      {/* WhatsApp notification note */}
      {hasPhone && (
        <p className="text-sm text-bocra-slate/50 mb-2">
          {lang === 'tn'
            ? 'O tla amogela molaetsa wa WhatsApp wa netefatso mo nomorong ya gago ya mogala.'
            : 'A WhatsApp confirmation message has been sent to your phone number.'}
        </p>
      )}

      <p className="text-sm text-bocra-slate/50 mb-6">
        {lang === 'tn'
          ? 'O tla amogela netefatso le diphetogo ka imeile e o e fileng.'
          : 'You will also receive updates at the email address you provided.'}
      </p>

      {/* Track complaint link */}
      {referenceNumber && (
        <div className="mb-6">
          <Link
            to={`/services/track-complaint?ref=${referenceNumber}`}
            className="text-bocra-blue text-sm font-medium hover:underline"
          >
            {lang === 'tn' ? 'Latela maemo a ngongorego ya gago →' : 'Track your complaint status →'}
          </Link>
        </div>
      )}

      <Link to="/" className="btn-primary inline-flex">
        {lang === 'tn' ? 'Boela Gae' : 'Return to Home'}
      </Link>
    </div>
  );
}

// ─── MAIN WIZARD ──────────────────────────────────────────────────────────────
export default function ComplaintWizard() {
  const { lang } = useLanguage();
  const { executeRecaptcha } = useRecaptcha();

  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    provider: '',
    complaintType: '',
    contactedProvider: null,
    description: '',
    name: '',
    company: '',
    phone: '',
    email: '',
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const update = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const goNext = () => {
    const next = step + 1;
    setStep(next);
    trackWizardEvent('wizard_step_viewed', { step: next });
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');

    const token = await executeRecaptcha('submit_complaint');
    if (!token) {
      setSubmitError(
        lang === 'tn'
          ? 'Netefatso ya tshireletso e paletse. Leka gape.'
          : 'Security verification failed. Please try again.',
      );
      setLoading(false);
      return;
    }

    if (!checkRateLimit('complaint-submit')) {
      setSubmitError(
        lang === 'tn'
          ? 'Dikopo di le dintsi. Emela metsotswana mme o leke gape.'
          : 'Too many submissions. Please wait a moment and try again.',
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${supabaseUrl_}/functions/v1/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey_}`,
          apikey: supabaseAnonKey_,
        },
        body: JSON.stringify({
          form_type: 'complaint',
          recaptcha_token: token,
          fields: {
            name:             sanitizeInput(data.name,          200),
            company:          sanitizeInput(data.company,       200),
            phone:            sanitizeInput(data.phone,          20),
            email:            sanitizeInput(data.email,         200),
            provider:         sanitizeInput(data.provider,      200),
            complaint_type:   sanitizeInput(data.complaintType, 200),
            description:      sanitizeInput(data.description,  5000),
            previous_complaint: data.contactedProvider === true,
            reference_number: '',
          },
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        setSubmitError(
          typeof result.error === 'string'
            ? result.error
            : (lang === 'tn' ? 'Go na le phoso. Tsweetswee leka gape.' : 'Something went wrong. Please try again.'),
        );
        setLoading(false);
        return;
      }

      trackWizardEvent('wizard_submitted', {
        provider: data.provider,
        complaintType: data.complaintType,
      });
      if (result.reference_number) setReferenceNumber(result.reference_number);
      setSubmitted(true);
    } catch {
      setSubmitError(
        lang === 'tn'
          ? 'Sengwe se ile sa fosa. Tsweetswee leka gape kgotsa ikgolaganye le rona ka mogala.'
          : 'Something went wrong. Please try again or contact us by phone.',
      );
    }

    setLoading(false);
  };

  if (submitted) return <SuccessScreen lang={lang} referenceNumber={referenceNumber} hasPhone={!!data.phone} />;

  return (
    <div>
      <ProgressBar step={step} lang={lang} />

      {step === 1 && (
        <StepProvider
          lang={lang}
          selected={data.provider}
          onSelect={(v) => update('provider', v)}
          onNext={goNext}
        />
      )}
      {step === 2 && (
        <StepComplaintType
          lang={lang}
          provider={data.provider}
          selected={data.complaintType}
          onSelect={(v) => update('complaintType', v)}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 3 && (
        <StepContactedProvider
          lang={lang}
          provider={data.provider}
          contacted={data.contactedProvider}
          onAnswer={(v) => update('contactedProvider', v)}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 4 && (
        <StepDescription
          lang={lang}
          description={data.description}
          onChange={(v) => update('description', v)}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 5 && (
        <StepDetails
          lang={lang}
          data={data}
          onChange={update}
          consent={consent}
          onConsentChange={setConsent}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 6 && (
        <StepReview
          lang={lang}
          data={data}
          onGoToStep={setStep}
          onSubmit={handleSubmit}
          loading={loading}
          error={submitError}
          onBack={goBack}
        />
      )}
    </div>
  );
}
