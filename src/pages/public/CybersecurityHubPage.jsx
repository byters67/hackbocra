/**
 * Cybersecurity Hub — BOCRA
 * 
 * Bright, accessible, friendly design for ALL ages including older adults.
 * Uses the same visual language as the rest of the BOCRA site.
 * Interactive quiz cards use plain language with large tap targets.
 * Real CVE data from NIST NVD API.
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ConsentCheckbox from '../../components/ui/ConsentCheckbox';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import {
  ChevronRight, Shield, AlertTriangle, Send, CheckCircle, Clock,
  Eye, Lock, Bug, Smartphone, Wifi, CreditCard, Users, FileText,
  ChevronDown, ExternalLink, ArrowRight, Activity, Globe, Server,
  AlertCircle, ShieldCheck, ShieldAlert, Radio, X, ChevronLeft,
  Phone, Mail, RefreshCw, Target, Fingerprint, HelpCircle, Award
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';

import PageHero from '../../components/ui/PageHero';
/* ── NVD API ── */
function cvssToSev(s) { return s >= 9 ? 'CRITICAL' : s >= 7 ? 'HIGH' : s >= 4 ? 'MEDIUM' : 'LOW'; }
function detectSector(d) {
  const l = (d||'').toLowerCase();
  if (/router|wifi|network|dns|tcp/.test(l)) return 'Telecom';
  if (/browser|chrome|firefox/.test(l)) return 'Internet';
  if (/android|ios|mobile|phone/.test(l)) return 'Mobile';
  if (/sql|database|server|cloud/.test(l)) return 'Infrastructure';
  if (/linux|kernel|windows/.test(l)) return 'Operating Systems';
  return 'General';
}
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return m + ' minutes ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' hour' + (h > 1 ? 's' : '') + ' ago';
  const dy = Math.floor(h / 24);
  return dy + ' day' + (dy > 1 ? 's' : '') + ' ago';
}
async function fetchCVEs() {
  try {
    const now = new Date(), ago = new Date(now.getTime() - 7 * 864e5);
    const f = d => d.toISOString().replace('Z', '');
    const res = await fetch('https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=' + f(ago) + '&pubEndDate=' + f(now) + '&resultsPerPage=15');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return (data?.vulnerabilities || []).map(item => {
      const c = item.cve, desc = c.descriptions?.find(d => d.lang === 'en')?.value || '';
      const score = c.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || c.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore || null;
      return { id: c.id, time: timeAgo(c.published), severity: score ? cvssToSev(score) : 'MEDIUM', desc: desc.slice(0, 200), sector: detectSector(desc), cvssScore: score, published: c.published };
    }).sort((a, b) => { const o = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }; return (o[a.severity] || 2) - (o[b.severity] || 2); });
  } catch { return null; }
}

const SEV_STYLE = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Critical' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'High' },
  MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Medium' },
  LOW: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', label: 'Low' },
};

/* ── Incident types ── */
const INCIDENT_TYPES = [
  { id: 'phishing', icon: Mail, label: 'Scam Email or SMS', desc: 'Someone pretending to be your bank, BOCRA, or another company', color: '#C8237B' },
  { id: 'malware', icon: Bug, label: 'Virus or Malware', desc: 'Your computer or phone is acting strangely or has been infected', color: '#DC2626' },
  { id: 'fraud', icon: CreditCard, label: 'Money Stolen Online', desc: 'Unauthorised transactions from your bank or mobile money', color: '#F7B731' },
  { id: 'data-breach', icon: Lock, label: 'Personal Data Leaked', desc: 'Your private information was shared without permission', color: '#7C3AED' },
  { id: 'network', icon: Wifi, label: 'Hacking / Break-in', desc: 'Someone accessed your accounts or network without permission', color: '#00A6CE' },
  { id: 'sim-swap', icon: Smartphone, label: 'SIM Swap Attack', desc: 'Your phone number was taken over by someone else', color: '#EA580C' },
  { id: 'impersonation', icon: Users, label: 'Impersonation / Scam Call', desc: 'Someone pretending to be a government official or company', color: '#059669' },
  { id: 'other', icon: HelpCircle, label: 'Something Else', desc: 'Any other online safety concern you want to report', color: '#64748B' },
];

/* ── Interactive Safety Tips with quizzes ── */
const SAFETY_TIPS = [
  { icon: Lock, title: 'Create Strong Passwords', color: '#00A6CE',
    tip: 'Use passwords with 12 or more characters — mix letters, numbers, and symbols. Never use the same password for different accounts. A free app called Bitwarden can remember all your passwords for you.',
    quiz: 'Which of these is the safest password?',
    options: ['password123', 'BotswanaSunrise2024!#', 'my name'], answer: 1,
    why: 'A strong password has letters, numbers, AND symbols. "BotswanaSunrise2024!#" is long and complex — very hard to guess.' },
  { icon: Smartphone, title: 'Protect Your Phone Number', color: '#DC2626',
    tip: 'SIM swap fraud is very common in Botswana. Call your mobile operator (Mascom, BTC, or Orange) and ask them to add a SIM lock or PIN to your account. Never give your OTP code to anyone who calls you.',
    quiz: 'Someone calls saying they are from Mascom and need your OTP code. What should you do?',
    options: ['Give them the code — they work for Mascom', 'Hang up and call Mascom yourself on their official number', 'Send the code by SMS'], answer: 1,
    why: 'Mascom, BTC and Orange will NEVER call you to ask for your OTP. If someone does, they are a scammer. Always hang up and call the operator yourself.' },
  { icon: Mail, title: 'Spot Fake Messages', color: '#C8237B',
    tip: 'Scammers send emails and SMS that look real but are fake. BOCRA and your bank will NEVER ask for your PIN or password by message. If you get a suspicious link, do not click it — call the company directly.',
    quiz: 'You get a text: "Your BOCRA licence is expiring. Click here to renew now." What do you do?',
    options: ['Click the link to renew quickly', 'Delete it and call BOCRA on +267 395 7755 to check', 'Forward it to your friends to warn them'], answer: 1,
    why: 'BOCRA will never send you a link to renew by SMS. Always call BOCRA directly to verify. Clicking unknown links can steal your information.' },
  { icon: CreditCard, title: 'Keep Your Money Safe Online', color: '#F7B731',
    tip: 'Check your Orange Money, MyZaka, or Smega transactions every week. Turn on SMS alerts for every transaction. If you see money you did not send, report it to your bank and BOCRA immediately.',
    quiz: 'You receive an SMS saying: "Congratulations! Send P50 to claim your P5,000 prize!" This is:',
    options: ['A real prize you should claim quickly', 'A scam — no real company asks you to pay to win a prize', 'Probably real if it mentions your name'], answer: 1,
    why: 'This is ALWAYS a scam. No legitimate company will ever ask you to send money to receive a prize. Report the number to your mobile operator.' },
  { icon: Wifi, title: 'Use the Internet Safely', color: '#6BBE4E',
    tip: 'Never enter your banking details or passwords when using free WiFi at malls, hotels, or cafes. Use your mobile data instead for banking. Look for the padlock icon in your browser before entering any personal details.',
    quiz: 'Is it safe to check your bank account using free WiFi at a shopping mall?',
    options: ['Yes, if the website looks normal', 'No — always use your own mobile data for banking', 'Yes, free WiFi is always safe'], answer: 1,
    why: 'Free public WiFi can be monitored by criminals. They can see your passwords and banking details. Always use your own mobile data for anything sensitive.' },
  { icon: Eye, title: 'Guard Your Personal Information', color: '#0891B2',
    tip: 'Do not share your Omang number, phone number, or date of birth publicly on Facebook or WhatsApp. This information can be used to steal your identity. Go to your Facebook Settings and check who can see your posts.',
    quiz: 'Which of these should you NEVER share publicly on social media?',
    options: ['A photo of your food', 'Your Omang number and phone number', 'Your favourite football team'], answer: 1,
    why: 'Your Omang number and phone number can be used by criminals to impersonate you, open accounts in your name, or perform SIM swaps.' },
  { icon: Bug, title: 'Keep Your Devices Updated', color: '#059669',
    tip: 'When your phone or computer asks you to update, always say yes. Updates fix security problems that criminals use to break in. Only download apps from Google Play Store or Apple App Store — never from links in messages.',
    quiz: 'Your phone shows "Software update available." What should you do?',
    options: ['Ignore it — updates slow down your phone', 'Install it — updates fix security problems', 'Wait a few months to see if it is safe'], answer: 1,
    why: 'Software updates patch security vulnerabilities. Delaying updates leaves your phone exposed to attacks that have already been fixed.' },
  { icon: Shield, title: 'Protect Against Ransomware', color: '#0D9488',
    tip: 'Ransomware is a virus that locks all your files and demands payment. Protect yourself by saving copies of important files to Google Drive or a USB drive every week. If attacked, you can get your files back without paying.',
    quiz: 'Ransomware locks all your files and demands P10,000. What is your best protection?',
    options: ['Pay the money to get your files back', 'Having backup copies of your files saved somewhere else', 'Turn off the computer and wait'], answer: 1,
    why: 'Paying the ransom does not guarantee you will get your files back. Having regular backups means you can restore everything without paying criminals.' },
  { icon: FileText, title: 'Know Your Rights', color: '#64748B',
    tip: 'Botswana has laws that protect you online. The Data Protection Act 2018 protects your personal data. The Cybersecurity Act 2025 makes cyber attacks a crime. If you are a victim, report it to BOCRA and the Botswana Police.',
    quiz: 'Which Botswana law protects your personal data?',
    options: ['The Companies Act', 'The Data Protection Act 2018', 'The Traffic Act'], answer: 1,
    why: 'The Data Protection Act 2018 gives you the right to control how your personal information is collected, used, and shared by companies and government.' },
];

/* ── Quiz Card Component — large, friendly, accessible ── */
function QuizCard({ tip, index }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const Icon = tip.icon;
  const correct = selected === tip.answer;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
      <div className="h-1.5" style={{ backgroundColor: tip.color }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tip.color + '15' }}>
            <Icon size={20} style={{ color: tip.color }} />
          </div>
          <div>
            <h3 className="font-bold text-base text-bocra-slate">{tip.title}</h3>
            <span className="text-xs text-bocra-slate/30">Safety Tip #{index + 1}</span>
          </div>
        </div>

        {!showQuiz ? (
          <>
            <p className="text-sm text-bocra-slate/60 leading-relaxed mb-4">{tip.tip}</p>
            <button onClick={() => setShowQuiz(true)}
              className="w-full py-3 bg-bocra-off-white hover:bg-bocra-blue/5 border border-gray-200 hover:border-bocra-blue/30 rounded-xl text-sm font-semibold text-bocra-blue transition-all flex items-center justify-center gap-2">
              <Target size={16} /> Test What You Learned
            </button>
          </>
        ) : (
          <>
            <div className="bg-bocra-off-white rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-bocra-slate mb-1">Quick Quiz:</p>
              <p className="text-sm text-bocra-slate/70">{tip.quiz}</p>
            </div>
            <div className="space-y-2 mb-4">
              {tip.options.map((opt, i) => {
                const isCorrect = i === tip.answer;
                const isSelected = selected === i;
                let cls = 'bg-white border-gray-200 text-bocra-slate/70 hover:border-bocra-blue hover:bg-bocra-blue/5';
                if (answered && isSelected && isCorrect) cls = 'bg-green-50 border-green-300 text-green-700';
                if (answered && isSelected && !isCorrect) cls = 'bg-red-50 border-red-300 text-red-700';
                if (answered && !isSelected && isCorrect) cls = 'bg-green-50 border-green-200 text-green-600';
                return (
                  <button key={i} onClick={() => { if (!answered) { setSelected(i); setAnswered(true); } }} disabled={answered}
                    className={'w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ' + cls}>
                    {answered && isCorrect && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
                    {answered && isSelected && !isCorrect && <X size={18} className="text-red-500 flex-shrink-0" />}
                    {!answered && <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-bocra-slate/40 flex-shrink-0">{String.fromCharCode(65 + i)}</span>}
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className={'rounded-xl p-4 text-sm leading-relaxed ' + (correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200')}>
                <p className="font-bold mb-1">{correct ? 'Correct!' : 'Not quite — here is the answer:'}</p>
                <p>{tip.why}</p>
              </div>
            )}
            <button onClick={() => { setShowQuiz(false); setSelected(null); setAnswered(false); }}
              className="mt-3 w-full py-2.5 text-sm text-bocra-slate/40 hover:text-bocra-blue transition-colors flex items-center justify-center gap-1">
              <ChevronLeft size={14} /> Back to tip
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CybersecurityHubPage() {
  const heroRef = useScrollReveal();
  const statsRef = useStaggerReveal({ stagger: 0.1 });

  const [formStep, setFormStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({ description: '', date: '', urgency: 'medium', name: '', email: '', phone: '', anonymous: false });
  const [incidentConsent, setIncidentConsent] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState('ALL');
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showAllTips, setShowAllTips] = useState(false);
  const [incidentError, setIncidentError] = useState('');
  const [submittedRef, setSubmittedRef] = useState('');

  useEffect(() => { (async () => { setAlertsLoading(true); const d = await fetchCVEs(); if (d?.length) { setAlerts(d); setLastRefresh(new Date()); } setAlertsLoading(false); })(); }, []);
  const refresh = async () => { setAlertsLoading(true); const d = await fetchCVEs(); if (d?.length) { setAlerts(d); setLastRefresh(new Date()); } setAlertsLoading(false); };
  const filtered = alertFilter === 'ALL' ? alerts : alerts.filter(a => a.severity === alertFilter);
  const visible = showAllAlerts ? filtered : filtered.slice(0, 5);
  const visibleTips = showAllTips ? SAFETY_TIPS : SAFETY_TIPS.slice(0, 4);
  const sevCounts = useMemo(() => { const c = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }; alerts.forEach(a => { if (c[a.severity] !== undefined) c[a.severity]++; }); return c; }, [alerts]);

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-bocra-off-white border-b border-gray-100">
        <div className="section-wrapper py-4">
          <nav className="text-sm text-bocra-slate/50 flex items-center gap-2">
            <Link to="/" className="hover:text-bocra-blue transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-bocra-slate">Cybersecurity Hub</span>
          </nav>
        </div>
      </div>

      {/* ═══ HERO — bright, accessible, consistent with site ═══ */}
      {/* Hero */}
      <PageHero category="CYBERSECURITY" title="Cybersecurity Hub" description="Stay safe online. Report cyber threats, learn how to protect yourself, and access the latest security alerts." color="magenta" />


      {/* ═══ STATS — real data ═══ */}
      <section className="py-8">
        <div className="section-wrapper">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '49.17', label: 'Botswana Cyber Security Score', sub: 'NCSI 2025 (out of 100)', icon: Shield, color: '#00A6CE' },
              { value: '74th', label: 'Global Ranking', sub: 'Out of 176 countries', icon: Globe, color: '#C8237B' },
              { value: '80%', label: 'Policy Development', sub: 'Laws and regulations', icon: CheckCircle, color: '#6BBE4E' },
              { value: alertsLoading ? '...' : String(alerts.length), label: 'Active Alerts', sub: 'From NIST NVD (7 days)', icon: Activity, color: '#F7B731' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                      <Icon size={20} style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-bocra-slate">{stat.value}</p>
                      <p className="text-xs text-bocra-slate/50 leading-tight">{stat.label}</p>
                      <p className="text-[10px] text-bocra-slate/30">{stat.sub}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ REPORT AN INCIDENT ═══ */}
      <section id="report" className="py-8 bg-bocra-off-white">
        <div className="section-wrapper max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#C8237B15] flex items-center justify-center">
              <Fingerprint size={22} className="text-[#C8237B]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-bocra-slate">Report a Cyber Incident</h2>
              <p className="text-sm text-bocra-slate/50">Your report is confidential and will be reviewed by the National CSIRT.</p>
            </div>
          </div>
          {/* Steps */}
          <div className="flex items-center gap-1 sm:gap-2 mb-6">
            {['What happened?', 'Tell us more', 'Your details', 'Done'].map((step, i) => (
              <div key={step} className="flex items-center gap-1 sm:gap-2">
                <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ' + (i < formStep ? 'bg-[#6BBE4E] text-white' : i === formStep ? 'bg-bocra-blue text-white' : 'bg-gray-200 text-bocra-slate/30')}>
                  {i < formStep ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={'text-xs hidden sm:inline ' + (i === formStep ? 'text-bocra-blue font-medium' : 'text-bocra-slate/30')}>{step}</span>
                {i < 3 && <div className={'w-6 sm:w-10 h-0.5 rounded-full ' + (i < formStep ? 'bg-[#6BBE4E]' : 'bg-gray-200')} />}
              </div>
            ))}
          </div>
          {/* Step 0 */}
          {formStep === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INCIDENT_TYPES.map(t => { const Icon = t.icon; return (
                <button key={t.id} onClick={() => { setSelectedType(t.id); setFormStep(1); }}
                  className="bg-white p-4 rounded-xl border-2 border-gray-100 text-left hover:border-bocra-blue/30 hover:shadow-md transition-all flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color + '15' }}>
                    <Icon size={20} style={{ color: t.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-bocra-slate">{t.label}</p>
                    <p className="text-xs text-bocra-slate/40 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ); })}
            </div>
          )}
          {/* Step 1 */}
          {formStep === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-bocra-slate mb-2 block">What happened? Please describe in your own words:</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="For example: I received an SMS that looked like it was from my bank asking me to click a link and enter my PIN..." className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-bocra-slate mb-1.5 block">When did it happen?</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none" /></div>
                <div><label className="text-sm font-medium text-bocra-slate mb-1.5 block">How urgent is this?</label>
                  <select value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })} className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none">
                    <option value="low">Not urgent — just want to report it</option><option value="medium">Somewhat urgent — I need help soon</option><option value="high">Very urgent — I am losing money or data</option><option value="critical">Emergency — attack is happening right now</option>
                  </select></div>
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setFormStep(0)} className="text-sm text-bocra-slate/40 hover:text-bocra-slate">Back</button>
                <button onClick={() => setFormStep(2)} disabled={!formData.description} className="px-6 py-2.5 bg-bocra-blue text-white font-medium text-sm rounded-xl hover:bg-bocra-blue/90 disabled:opacity-30 flex items-center gap-2">Next <ArrowRight size={14} /></button>
              </div>
            </div>
          )}
          {/* Step 2 */}
          {formStep === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <label className="flex items-center gap-3 p-4 bg-bocra-off-white rounded-xl cursor-pointer border border-gray-100">
                <input type="checkbox" checked={formData.anonymous} onChange={e => setFormData({ ...formData, anonymous: e.target.checked })} className="w-5 h-5 rounded" />
                <div><p className="text-sm font-semibold text-bocra-slate">I want to report anonymously</p><p className="text-xs text-bocra-slate/40">We will not be able to contact you with updates</p></div>
              </label>
              {!formData.anonymous && <div className="space-y-3">
                <div><label className="text-sm font-medium text-bocra-slate mb-1.5 block">Your Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-bocra-slate mb-1.5 block">Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none" /></div>
                  <div><label className="text-sm font-medium text-bocra-slate mb-1.5 block">Phone Number</label><input type="tel" placeholder="+267" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-sm focus:border-bocra-blue outline-none" /></div>
                </div>
              </div>}
              <ConsentCheckbox
                checked={incidentConsent}
                onChange={setIncidentConsent}
                purpose="investigating and responding to your cybersecurity incident report under the Cybersecurity Act, 2025"
              />
              <div className="flex justify-between pt-2">
                <button onClick={() => setFormStep(1)} className="text-sm text-bocra-slate/40 hover:text-bocra-slate">Back</button>
                {incidentError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{incidentError}</p>}
                <button disabled={!incidentConsent} onClick={async () => {
                  setIncidentError('');
                  const ref = 'CSIRT-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8).toUpperCase();
                  try {
                    const { error: insertErr } = await supabase.from('cyber_incidents').insert([{
                      incident_type: selectedType,
                      description: formData.description,
                      incident_date: formData.date || null,
                      urgency: formData.urgency,
                      reporter_name: formData.anonymous ? null : formData.name,
                      reporter_email: formData.anonymous ? null : formData.email,
                      reporter_phone: formData.anonymous ? null : formData.phone,
                      is_anonymous: formData.anonymous,
                      reference_number: ref,
                      status: 'received',
                      consent_given_at: new Date().toISOString(),
                    }]);
                    if (insertErr) throw insertErr;
                    setSubmittedRef(ref);
                    setFormStep(3);
                  } catch (err) { setIncidentError('Something went wrong. Please try again or call +267 395 7755.'); }
                }} className="px-6 py-2.5 bg-[#C8237B] text-white font-bold text-sm rounded-xl flex items-center gap-2"><Send size={14} /> Submit Report</button>
              </div>
            </div>
          )}
          {/* Step 3 */}
          {formStep === 3 && (
            <div className="bg-white rounded-xl border border-green-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-[#6BBE4E]" /></div>
              <h3 className="text-xl font-bold text-bocra-slate mb-2">Thank You — Your Report Was Submitted</h3>
              <p className="text-sm text-bocra-slate/50 max-w-md mx-auto mb-3">The Botswana National CSIRT team has received your report and will review it. Here is your reference number:</p>
              <div className="inline-block px-5 py-2.5 bg-bocra-off-white rounded-lg text-lg font-mono font-bold text-bocra-blue mb-4">{submittedRef}</div>
              <p className="text-xs text-bocra-slate/30 mb-6">Keep this number. For urgent incidents, expect a response within 4 hours.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => { setFormStep(0); setSelectedType(null); setFormData({ description: '', date: '', urgency: 'medium', name: '', email: '', phone: '', anonymous: false }); setIncidentConsent(false); setSubmittedRef(''); setIncidentError(''); }}
                  className="px-5 py-2.5 border border-gray-200 text-bocra-slate text-sm rounded-xl hover:border-gray-300">Report Another Incident</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ SAFETY ACADEMY — Interactive quiz cards ═══ */}
      <section id="learn" className="py-8">
        <div className="section-wrapper">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-[#6BBE4E15] flex items-center justify-center">
              <Award size={22} className="text-[#6BBE4E]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-bocra-slate">Cyber Safety Academy</h2>
              <p className="text-sm text-bocra-slate/50">Read each tip, then test what you learned with a quick quiz</p>
            </div>
          </div>
          <p className="text-xs text-bocra-slate/30 mb-6 ml-14">Tap "Test What You Learned" on any card to try the quiz</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleTips.map((tip, i) => <QuizCard key={i} tip={tip} index={i} />)}
          </div>
          {SAFETY_TIPS.length > 4 && (
            <button onClick={() => setShowAllTips(!showAllTips)}
              className="mt-6 w-full py-3 text-sm text-bocra-blue font-medium hover:bg-bocra-blue/5 border border-gray-200 hover:border-bocra-blue/30 rounded-xl transition-all flex items-center justify-center gap-2">
              {showAllTips ? 'Show Less' : 'View All ' + SAFETY_TIPS.length + ' Safety Tips & Quizzes'}
              <ChevronDown size={14} className={'transition-transform ' + (showAllTips ? 'rotate-180' : '')} />
            </button>
          )}
        </div>
      </section>

      {/* ═══ LIVE ALERTS ═══ */}
      <section id="alerts" className="py-8 bg-bocra-off-white">
        <div className="section-wrapper">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#EA580C15] flex items-center justify-center">
                <Activity size={22} className="text-[#EA580C]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-bocra-slate">Live Security Alerts</h2>
                <p className="text-sm text-bocra-slate/50">Real vulnerabilities from the NIST National Vulnerability Database{lastRefresh && <span className="text-bocra-slate/30"> · Updated {lastRefresh.toLocaleTimeString()}</span>}</p>
              </div>
            </div>
            <button onClick={refresh} disabled={alertsLoading} className={'p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all ' + (alertsLoading ? 'animate-spin' : '')} title="Refresh">
              <RefreshCw size={16} className="text-bocra-slate/40" />
            </button>
          </div>
          {/* Severity summary */}
          {!alertsLoading && alerts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setAlertFilter('ALL')} className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ' + (alertFilter === 'ALL' ? 'bg-bocra-blue text-white border-bocra-blue' : 'bg-white text-bocra-slate/50 border-gray-200')}>All ({alerts.length})</button>
              {Object.entries(sevCounts).filter(([, c]) => c > 0).map(([sev, count]) => {
                const s = SEV_STYLE[sev]; return (
                <button key={sev} onClick={() => setAlertFilter(sev)} className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ' + (alertFilter === sev ? s.bg + ' ' + s.text + ' ' + s.border : 'bg-white text-bocra-slate/40 border-gray-200')}>
                  {s.label} ({count})
                </button>);
              })}
            </div>
          )}
          {alertsLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse"><div className="flex gap-3"><div className="w-3 h-3 mt-1 rounded-full bg-gray-200" /><div className="flex-1 space-y-2"><div className="w-1/3 h-4 bg-gray-100 rounded" /><div className="w-full h-3 bg-gray-50 rounded" /></div></div></div>
            ))}<p className="text-center text-xs text-bocra-slate/30 py-2">Loading live vulnerability data...</p></div>
          ) : (
            <div className="space-y-2">
              {visible.map(alert => { const s = SEV_STYLE[alert.severity] || SEV_STYLE.MEDIUM; return (
                <a key={alert.id} href={'https://nvd.nist.gov/vuln/detail/' + alert.id} target="_blank" rel="noopener noreferrer"
                  className="block bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className={'w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ' + (s.text.replace('text-', 'bg-'))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border ' + s.bg + ' ' + s.text + ' ' + s.border}>{s.label}</span>
                        <span className="text-xs font-mono text-bocra-blue group-hover:underline">{alert.id}</span>
                        {alert.cvssScore && <span className="text-[10px] font-mono text-bocra-slate/30">CVSS {alert.cvssScore}</span>}
                        <span className="text-[10px] text-bocra-slate/25">{alert.time}</span>
                      </div>
                      <p className="text-sm text-bocra-slate/60 leading-relaxed line-clamp-2 group-hover:text-bocra-slate/80">{alert.desc}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-bocra-slate/25 bg-gray-50 px-2 py-0.5 rounded">{alert.sector}</span>
                        <span className="text-[10px] text-bocra-blue/50 flex items-center gap-1">View on NVD <ExternalLink size={8} /></span>
                      </div>
                    </div>
                  </div>
                </a>
              ); })}
            </div>
          )}
          {filtered.length > 5 && <button onClick={() => setShowAllAlerts(!showAllAlerts)} className="mt-4 w-full py-3 text-sm text-bocra-blue font-medium hover:bg-white border border-gray-200 rounded-xl transition-all flex items-center justify-center gap-2">
            {showAllAlerts ? 'Show Less' : 'View All ' + filtered.length + ' Alerts'} <ChevronDown size={14} className={'transition-transform ' + (showAllAlerts ? 'rotate-180' : '')} />
          </button>}
        </div>
      </section>

      {/* ═══ PARTNERS ═══ */}
      <section className="py-8">
        <div className="section-wrapper max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-bocra-slate text-center mb-1">Cybersecurity Partners</h2>
          <p className="text-sm text-bocra-slate/40 text-center mb-6">BOCRA works with international partners to protect Botswana online</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[{ name: 'Cyble Inc.', desc: 'AI-powered threat intelligence. Partnership signed November 2025.', icon: Globe, color: '#00A6CE' },
              { name: 'Group-IB', desc: 'Cybercrime investigation and digital forensics. Partnership signed September 2025.', icon: Shield, color: '#C8237B' },
              { name: 'Botswana CSIRT', desc: 'National Computer Security Incident Response Team — first responders to cyber attacks.', icon: Server, color: '#F7B731' },
            ].map(p => (<div key={p.name} className="bg-white border border-gray-100 rounded-xl p-5 text-center hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: p.color + '10' }}><p.icon size={22} style={{ color: p.color }} /></div>
              <h3 className="font-bold text-sm text-bocra-slate">{p.name}</h3>
              <p className="text-xs text-bocra-slate/40 mt-1 leading-relaxed">{p.desc}</p>
            </div>))}
          </div>
          {/* Legislation */}
          <div className="bg-bocra-off-white rounded-xl p-5">
            <h3 className="text-sm font-bold text-bocra-slate/50 mb-3 flex items-center gap-2"><FileText size={16} /> Laws That Protect You Online</h3>
            <div className="space-y-2">{['Cybersecurity Act, 2025 — Makes cyber attacks a crime in Botswana', 'Data Protection Act, 2018 — Protects your personal information', 'Cybercrime Act, 2018 — Defines computer crimes and penalties', 'Electronic Communications Act, 2014 — Regulates digital transactions'].map((law, i) => (
              <Link key={i} to="/documents/drafts" className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-all group">
                <span className="text-sm text-bocra-slate/60 group-hover:text-bocra-blue">{law}</span>
                <ArrowRight size={14} className="text-bocra-slate/20 group-hover:text-bocra-blue flex-shrink-0" />
              </Link>))}</div>
          </div>
        </div>
      </section>

      {/* Emergency contact — slim, not a footer duplicate */}
      <section className="bg-[#00458B] py-5">
        <div className="section-wrapper flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Phone size={20} className="text-white/60 hidden sm:block" />
            <div>
              <p className="text-sm font-bold text-white">Are you experiencing a cyber attack right now?</p>
              <p className="text-xs text-white/40">Call the BOCRA National CSIRT team directly for immediate help</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+2673957755" className="px-5 py-2.5 bg-white text-[#00458B] font-bold text-sm rounded-xl flex items-center gap-2"><Phone size={14} /> +267 395 7755</a>
            <a href="mailto:csirt@bocra.org.bw" className="px-5 py-2.5 border border-white/30 text-white font-medium text-sm rounded-xl flex items-center gap-2"><Mail size={14} /> csirt@bocra.org.bw</a>
          </div>
        </div>
      </section>

      {/* Colour bar */}
      <div className="flex h-1"><div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" /></div>
    </div>
  );
}
