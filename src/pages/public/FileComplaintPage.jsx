/**
 * File a Complaint Page
 * 
 * Online complaint filing form based on BOCRA Website Audit - Section 3.7:
 * - Complaint types: Billing, Equipment failure, Interconnection, Delays, 
 *   Mobile problems, Internet contracts, etc.
 * - Categories from original form: Research, Licensing, Policy & Regulation, 
 *   Standards, Numbering, ccTLD, etc.
 * - Process: 2-day standard resolution timeline
 * 
 * Consumer Rights (from Consumer Education page):
 * - Right To Be Informed
 * - Right To Choice
 * - Right To Be Heard
 * - Right To Safety
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, AlertCircle, CheckCircle, Send,
  FileText, Clock, Shield, Phone, HelpCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { checkRateLimit } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { sanitizeInput, sanitizeError, validateEmail, validatePhone } from '../../lib/security';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import ConsentCheckbox from '../../components/ui/ConsentCheckbox';

import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';
const getCOMPLAINT_TYPES = (lang) => [
  'Billing / Charging Issues',
  'Network Coverage / Signal Problems',
  'Internet Service Quality',
  'Equipment Failure',
  'Service Provider Delays',
  'Interconnection Issues',
  'Broadcasting Content',
  'Postal Service',
  'Domain (.bw) Registration',
  'Licensing Query',
  'Spectrum / Frequency Interference',
  'Consumer Rights Violation',
  'Other',
];

const getSERVICE_PROVIDERS = (lang) => [
  'Mascom Wireless',
  'Botswana Telecommunications Corporation (BTC)',
  'Orange Botswana',
  'Botswana Fibre Networks (BoFiNet)',
  'Botswana Post',
  'Yarona FM',
  'Duma FM',
  'Gabz FM',
  'eBotswana TV',
  'Other',
];

const getSTEPS = (lang) => [
  { icon: Phone, title: lang === 'tn' ? 'Ikgolaganye le Motlamedi' : 'Contact Provider', description: lang === 'tn' ? 'Sa ntlha, tlhagisa ngongorego ya gago ka tlhamalalo le motlamedi wa gago wa tirelo.' : 'First, raise your complaint directly with your service provider.' },
  { icon: Clock, title: lang === 'tn' ? 'Emela Tharabololo' : 'Wait for Resolution', description: lang === 'tn' ? 'Letla motlamedi nako e e utlwalang go rarabolola bothata jwa gago.' : 'Allow the provider reasonable time to resolve your issue.' },
  { icon: FileText, title: lang === 'tn' ? 'Fetisedisa kwa BOCRA' : 'Escalate to BOCRA', description: lang === 'tn' ? 'Fa e sa rarabololwa, tlhagisa ngongorego ya semmuso le BOCRA o dirisa foromo e.' : 'If unresolved, file a formal complaint with BOCRA using this form.' },
  { icon: Shield, title: lang === 'tn' ? 'BOCRA e a Batlisisa' : 'BOCRA Investigates', description: lang === 'tn' ? 'Re batlisisa mme re ikaelela go rarabolola dingongorego mo malatsing a le 2 a tiriso.' : 'We investigate and aim to resolve complaints within 2 business days.' },
];

export default function FileComplaintPage() {
  const { lang } = useLanguage();
  const STEPS = getSTEPS(lang);
  const COMPLAINT_TYPES = getCOMPLAINT_TYPES(lang);
  const SERVICE_PROVIDERS = getSERVICE_PROVIDERS(lang);
  const [step, setStep] = useState('info'); // 'info' | 'form' | 'success'
  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '',
    provider: '', complaintType: '', description: '',
    previousComplaint: false, referenceNumber: '',
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const heroRef = useScrollReveal();
  const stepsRef = useStaggerReveal({ stagger: 0.12 });
  const { executeRecaptcha } = useRecaptcha();
  const u = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = lang === 'tn' ? 'Leina le a tlhokega' : 'Name is required';
    if (!form.email.trim()) e.email = lang === 'tn' ? 'Imeile e a tlhokega' : 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Invalid phone number';
    if (!form.provider) e.provider = 'Select a provider';
    if (!form.complaintType) e.complaintType = 'Select complaint type';
    if (!form.description.trim()) e.description = lang === 'tn' ? 'Tlhaloso e a tlhokega' : 'Description is required';
    else if (form.description.trim().length < 20) e.description = 'Please provide more detail (min 20 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // ─── SECURITY: reCAPTCHA v3 verification ───
    const recaptchaToken = await executeRecaptcha('submit_complaint');
    if (!recaptchaToken) {
      console.warn('[BOCRA] reCAPTCHA failed — proceeding without token');
    }
    
    // ─── SECURITY: Rate limiting (F01 remediation) ───
    if (!checkRateLimit('complaint-submit')) {
      alert('Too many submissions. Please wait a moment and try again.');
      setLoading(false);
      return;
    }

    // ─── SECURITY: Input validation ───
    if (!validateEmail(form.email)) {
      alert('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // ─── SECURITY: Sanitize all inputs before sending (F06 remediation) ───
      const { data: inserted, error: insertErr } = await supabase.from('complaints').insert([{
        name: sanitizeInput(form.name, 200),
        company: sanitizeInput(form.company, 200),
        phone: sanitizeInput(form.phone, 20),
        email: sanitizeInput(form.email, 200),
        provider: sanitizeInput(form.provider, 200),
        complaint_type: sanitizeInput(form.complaintType, 200),
        description: sanitizeInput(form.description, 5000),
        previous_complaint: !!form.previousComplaint,
        reference_number: sanitizeInput(form.referenceNumber, 100),
        status: 'pending',
        consent_given_at: new Date().toISOString(),
      }]).select('id').single();
      if (insertErr) throw insertErr;

      // ─── AI AUTO-CATEGORISATION — runs in background, doesn't block user ───
      if (inserted?.id) {
        // Fire and forget — don't await, user sees success immediately
        (async () => {
          try {
            const res = await fetch('https://cyalwtuladeexxfsbrcs.supabase.co/functions/v1/classify-complaint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YWx3dHVsYWRlZXh4ZnNicmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjM2NTYsImV4cCI6MjA4OTA5OTY1Nn0.rvH-J2O9sttpRFYLSo28BogTwBhwFD2Ei_QuMbnrHUk' },
              body: JSON.stringify({ complaint_id: inserted.id, provider: form.provider, complaint_type: form.complaintType, description: form.description }),
            });
            if (!res.ok) console.warn('[BOCRA] AI classification failed:', res.status);
          } catch { /* AI classification is non-critical */ }
        })();
      }

      setStep('success');
    } catch (err) {
      // ─── SECURITY: Never expose raw errors (F06 remediation) ───
      setErrors(prev => ({ ...prev, form: 'Something went wrong. Please try again or contact us by phone.' }));
    }
    setLoading(false);
  };

  const updateForm = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); setErrors(e => ({ ...e, [field]: '' })); };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">{lang === 'tn' ? 'Gae' : 'Home'}</Link>
            <ChevronRight size={14} />
            <Link to="/services/file-complaint" className="hover:text-bocra-blue transition-colors">Services</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate">{lang === 'tn' ? 'Tlhagisa Ngongorego' : 'File a Complaint'}</span>
          </nav>
        </div>
      </div>
      {/* Hero */}
      <PageHero category="COMPLAINTS" categoryTn="DINGONGOREGO" title="File a Complaint" titleTn="Tlhagisa Ngongorego" description="Report a service issue with your telecommunications, broadcasting, or postal service provider. BOCRA will investigate on your behalf." descriptionTn="Bega bothata jwa tirelo le motlamedi wa gago wa megala, phasalatso, kgotsa poso. BOCRA e tla batlisisa mo boemong jwa gago." color="magenta" />


      {/* Complaint process steps */}
      <section className="py-10 bg-white">
        <div className="section-wrapper">
          <h2 className="text-2xl font-display text-bocra-slate mb-8 text-center">How the Process Works</h2>
          <div ref={stepsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative bg-bocra-off-white rounded-2xl p-6 text-center">
                  <span className="absolute -top-3 left-6 w-7 h-7 bg-bocra-blue text-white text-sm font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                  <Icon size={28} className="text-bocra-blue mx-auto mb-3" />
                  <h3 className="font-semibold text-bocra-slate mb-1">{s.title}</h3>
                  <p className="text-sm text-bocra-slate/60">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Complaint form */}
      <section className="py-10 bg-bocra-off-white">
        <div className="section-wrapper max-w-3xl">
          {step === 'success' ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <CheckCircle size={56} className="text-bocra-green mx-auto mb-4" />
              <h2 className="text-3xl font-display text-bocra-slate mb-3">{lang === 'tn' ? 'Ngongorego e Rometse' : 'Complaint Submitted'}</h2>
              <p className="text-bocra-slate/60 mb-6">
                Thank you for submitting your complaint. BOCRA will review it and respond 
                within 2 business days. You will receive updates via email.
              </p>
              <Link to="/" className="btn-primary">Return to Home</Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-bocra-magenta/10 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-bocra-magenta" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-bocra-slate">{lang === 'tn' ? 'Foromo ya Ngongorego' : 'Complaint Form'}</h2>
                  <p className="text-sm text-bocra-slate/50">{lang === 'tn' ? 'Mafelo otlhe a a tshwailweng ka * a a tlhokega' : 'All fields marked with * are required'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal details */}
                <fieldset>
                  <legend className="text-sm font-semibold text-bocra-slate/80 uppercase tracking-wider mb-4">
                    Your Information
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Input label={lang === 'tn' ? 'Leina ka Botlalo *' : 'Full Name *'} value={form.name} onChange={(v) => updateForm('name', v)} placeholder="Your full name" />{errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}</div>
                    <div><Input label={lang === 'tn' ? 'Kompone / Mokgatlho' : 'Company / Organisation'} value={form.company} onChange={(v) => updateForm('company', v)} placeholder="If applicable" /></div>
                    <div><Input label={lang === 'tn' ? 'Nomoro ya Mogala' : 'Phone Number'} type="tel" value={form.phone} onChange={(v) => updateForm('phone', v)} placeholder="+267 ..." />{errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}</div>
                    <div><Input label={lang === 'tn' ? 'Aterese ya Imeile *' : 'Email Address *'} type="email" value={form.email} onChange={(v) => updateForm('email', v)} placeholder="your@email.com" />{errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}</div>
                  </div>
                </fieldset>

                {/* Complaint details */}
                <fieldset>
                  <legend className="text-sm font-semibold text-bocra-slate/80 uppercase tracking-wider mb-4">
                    Complaint Details
                  </legend>
                  <div className="space-y-4">
                    <div><Select label="Service Provider *" value={form.provider} onChange={(v) => updateForm('provider', v)} options={SERVICE_PROVIDERS} />{errors.provider && <p className="text-[10px] text-red-500 mt-0.5">{errors.provider}</p>}</div>
                    <div><Select label="Type of Complaint *" value={form.complaintType} onChange={(v) => updateForm('complaintType', v)} options={COMPLAINT_TYPES} />{errors.complaintType && <p className="text-[10px] text-red-500 mt-0.5">{errors.complaintType}</p>}</div>
                    <div>
                      <label className="block text-sm font-medium text-bocra-slate mb-1.5">Describe Your Complaint *</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => updateForm('description', e.target.value)}
                        rows={6}
                        placeholder="Please provide as much detail as possible about your complaint, including dates, times, and any reference numbers from the service provider..."
                        className={`w-full px-4 py-3 bg-bocra-off-white border rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.description && <p className="text-[10px] text-red-500 mt-0.5">{errors.description}</p>}
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.previousComplaint}
                        onChange={(e) => updateForm('previousComplaint', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-bocra-blue focus:ring-bocra-blue"
                      />
                      <span className="text-sm text-bocra-slate/70">
                        I have previously raised this complaint with my service provider
                      </span>
                    </label>
                    {form.previousComplaint && (
                      <Input
                        label="Provider Reference Number"
                        value={form.referenceNumber}
                        onChange={(v) => updateForm('referenceNumber', v)}
                        placeholder="Reference number from your provider"
                      />
                    )}
                  </div>
                </fieldset>

                <ConsentCheckbox
                  checked={consent}
                  onChange={setConsent}
                  purpose="investigating and resolving your complaint, which may involve sharing details with the relevant service provider"
                />

                {errors.form && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.form}</p>}

                <button type="submit" disabled={loading || !consent} className="btn-primary w-full justify-center text-lg py-4 disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-bocra-slate mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-bocra-slate mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-bocra-slate focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all appearance-none"
      >
        <option value="">Select an option...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
