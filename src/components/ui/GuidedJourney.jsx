/**
 * GuidedJourney.jsx — Reusable step-by-step decision-tree wizard.
 *
 * Phase 6: Renders one step at a time from a journey definition (src/data/journeys.js).
 * Supports three step types: 'cards' (visual grid), 'list' (vertical rows), 'info' (text + CTA).
 * Tracks history for back navigation. Outcome screen redirects or shows info.
 *
 * Props:
 *   journey  — full journey object from journeys.js
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ChevronRight, RotateCcw,
  Phone, Mail, HelpCircle, Wifi, Globe, Shield, Radio,
  FileText, Search, MessageSquare, Plus, Settings, BookOpen,
} from 'lucide-react';
import { useLanguage } from '../../lib/language';

// Map string icon names from journey data → Lucide components
const ICON_MAP = {
  Phone, Mail, HelpCircle, Wifi, Globe, Shield, Radio,
  FileText, Search, MessageSquare, Plus, Settings, BookOpen,
  ArrowRight,
};

function resolveIcon(name) {
  return ICON_MAP[name] || HelpCircle;
}

export default function GuidedJourney({ journey }) {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const tn = lang === 'tn';
  const questionRef = useRef(null);

  // State: current step ID, selection history for back nav, current outcome
  const [currentStepId, setCurrentStepId] = useState(journey.steps[0].id);
  const [history, setHistory] = useState([]); // [{stepId, selectedIndex}]
  const [outcome, setOutcome] = useState(null);

  const currentStep = journey.steps.find(s => s.id === currentStepId);
  const stepIndex = journey.steps.findIndex(s => s.id === currentStepId);
  const totalSteps = journey.steps.length;

  // Focus question heading on step change for accessibility
  useEffect(() => {
    if (questionRef.current) questionRef.current.focus();
  }, [currentStepId, outcome]);

  function handleSelect(option) {
    // Record in history
    setHistory(prev => [...prev, { stepId: currentStepId, selectedIndex: null }]);

    if (option.outcome) {
      setOutcome(journey.outcomes[option.outcome]);
    } else if (option.next) {
      setCurrentStepId(option.next);
    }
  }

  function handleBack() {
    if (outcome) {
      // Go back from outcome to last step
      setOutcome(null);
      return;
    }
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentStepId(prev.stepId);
  }

  function handleStartOver() {
    setCurrentStepId(journey.steps[0].id);
    setHistory([]);
    setOutcome(null);
  }

  const txt = (en, tnVal) => tn && tnVal ? tnVal : en;
  const progressPercent = outcome ? 100 : totalSteps > 1 ? ((stepIndex) / totalSteps) * 100 : 50;

  // ─── Outcome screen ─────────────────────────────────────────
  if (outcome) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: '100%', background: journey.color }} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-7 sm:p-10">
          {/* Back + Start Over */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={16} /> {tn ? 'Morago' : 'Back'}
            </button>
            <button onClick={handleStartOver} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              <RotateCcw size={14} /> {tn ? 'Simolola Gape' : 'Start Over'}
            </button>
          </div>

          {/* Checkmark */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `${journey.color}15` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: journey.color }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>

          <h2 ref={questionRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-bocra-slate text-center outline-none">
            {txt(outcome.title, outcome.title_tn)}
          </h2>
          <p className="text-sm text-gray-500 text-center mt-3 leading-relaxed max-w-lg mx-auto">
            {txt(outcome.description, outcome.description_tn)}
          </p>

          {/* Provider contacts (for info-type outcomes) */}
          {outcome.contacts && (
            <div className="mt-6 space-y-3">
              {outcome.contacts.map(c => (
                <div key={c.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${journey.color}15` }}>
                    <Phone size={18} style={{ color: journey.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bocra-slate">{c.name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                      <a href={`tel:${c.phone}`} className="text-xs text-gray-500 hover:text-bocra-blue flex items-center gap-1">
                        <Phone size={10} /> {c.phone}
                      </a>
                      <a href={`mailto:${c.email}`} className="text-xs text-gray-500 hover:text-bocra-blue flex items-center gap-1">
                        <Mail size={10} /> {c.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Follow-up text */}
          {outcome.followUp && (
            <p className="text-xs text-gray-400 text-center mt-4 italic">
              {txt(outcome.followUp, outcome.followUp_tn)}
            </p>
          )}

          {/* Primary CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(outcome.route)}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl hover:shadow-lg hover:gap-3 transition-all"
              style={{ background: journey.color }}
            >
              {txt(outcome.buttonText, outcome.buttonText_tn)} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step screen ────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: journey.color }} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-gray-400">
          {tn ? 'Kgato' : 'Step'} {stepIndex + 1} {tn ? 'ya' : 'of'} {totalSteps}
        </span>
        {history.length > 0 && (
          <button onClick={handleBack} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={14} /> {tn ? 'Morago' : 'Back'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-7 sm:p-10">
        {/* Question */}
        <h2 ref={questionRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-bocra-slate outline-none">
          {txt(currentStep.question, currentStep.question_tn)}
        </h2>

        {/* Help text */}
        {currentStep.helpText && (
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            {txt(currentStep.helpText, currentStep.helpText_tn)}
          </p>
        )}

        {/* Info text (for 'info' type steps) */}
        {currentStep.type === 'info' && currentStep.infoText && (
          <div className="mt-4 p-5 rounded-xl" style={{ background: `${journey.color}08` }}>
            <p className="text-sm text-gray-600 leading-relaxed">
              {txt(currentStep.infoText, currentStep.infoText_tn)}
            </p>
          </div>
        )}

        {/* Options — Cards layout */}
        {currentStep.type === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {currentStep.options.map((opt, i) => {
              const Icon = resolveIcon(opt.icon);
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className="group flex items-center gap-4 p-5 bg-gray-50 border-2 border-transparent rounded-xl text-left hover:border-current hover:shadow-md transition-all"
                  style={{ '--tw-border-opacity': 1 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = journey.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${opt.color || journey.color}15` }}>
                    <Icon size={20} style={{ color: opt.color || journey.color }} />
                  </div>
                  <span className="text-sm font-semibold text-bocra-slate group-hover:text-[#00458B] transition-colors">
                    {txt(opt.label, opt.label_tn)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Options — List layout */}
        {currentStep.type === 'list' && (
          <div className="space-y-2 mt-6">
            {currentStep.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="group flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-bocra-slate group-hover:text-[#00458B] transition-colors">
                    {txt(opt.label, opt.label_tn)}
                  </span>
                  {opt.detail && (
                    <p className="text-xs text-gray-400 mt-0.5">{txt(opt.detail, opt.detail_tn)}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#00A6CE] group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
              </button>
            ))}
          </div>
        )}

        {/* Options — Info layout (single CTA) */}
        {currentStep.type === 'info' && (
          <div className="mt-6">
            {currentStep.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl hover:shadow-lg hover:gap-3 transition-all"
                style={{ background: journey.color }}
              >
                {txt(opt.label, opt.label_tn)} <ArrowRight size={16} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
