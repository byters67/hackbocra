import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConsentCheckbox from '../../components/ui/ConsentCheckbox';
import { MapPin, Phone, Mail, Clock, Send, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useScrollReveal } from '../../hooks/useAnimations';
import PageHero from '../../components/ui/PageHero';
import { useLanguage } from '../../lib/language';

export default function ContactPage() {
  const { lang } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const heroRef = useScrollReveal();
  const formRef = useScrollReveal({ y: 40 });
  const u = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const T = {
    home: lang === 'tn' ? 'Gae' : 'Home',
    contactUs: lang === 'tn' ? 'Ikgolaganye le Rona' : 'Contact Us',
    contactInfo: lang === 'tn' ? 'Tshedimosetso ya Kgolagano' : 'Contact Information',
    address: lang === 'tn' ? 'Aterese' : 'Address',
    telephone: lang === 'tn' ? 'Mogala' : 'Telephone',
    fax: lang === 'tn' ? 'Fekese' : 'Fax',
    email: lang === 'tn' ? 'Imeile' : 'Email',
    officeHours: lang === 'tn' ? 'Dinako tsa Ofisi' : 'Office Hours',
    officeHoursVal: lang === 'tn' ? 'Mosupologo – Labotlhano: 07:30 – 16:30 CAT' : 'Monday – Friday: 07:30 – 16:30 CAT',
    messageSent: lang === 'tn' ? 'Molaetsa o Rometse!' : 'Message Sent!',
    thankYou: lang === 'tn' ? 'Re a leboga go ikgolaganya le BOCRA. Re tla araba mo malatsing a le 2 a tiriso.' : 'Thank you for contacting BOCRA. We will respond within 2 business days.',
    sendMessage: lang === 'tn' ? 'Re Romelele Molaetsa' : 'Send us a Message',
    fullName: lang === 'tn' ? 'Leina ka Botlalo' : 'Full Name',
    fullNamePh: lang === 'tn' ? 'Leina la gago ka botlalo' : 'Your full name',
    emailAddress: lang === 'tn' ? 'Aterese ya Imeile' : 'Email Address',
    phoneNumber: lang === 'tn' ? 'Nomoro ya Mogala' : 'Phone Number',
    subject: lang === 'tn' ? 'Setlhogo' : 'Subject',
    subjectPh: lang === 'tn' ? 'E ka ga eng?' : 'What is this about?',
    message: lang === 'tn' ? 'Molaetsa' : 'Message',
    messagePh: lang === 'tn' ? 'Tsweetswee tlhalosa potso ya gago ka botlalo...' : 'Please describe your enquiry in detail...',
    sending: lang === 'tn' ? 'E a romela...' : 'Sending...',
    sendBtn: lang === 'tn' ? 'Romela Molaetsa' : 'Send Message',
    nameReq: lang === 'tn' ? 'Leina le a tlhokega' : 'Name is required',
    emailReq: lang === 'tn' ? 'Imeile e a tlhokega' : 'Email is required',
    invalidEmail: lang === 'tn' ? 'Mofuta wa imeile o o fosagetseng' : 'Invalid email format',
    invalidPhone: lang === 'tn' ? 'Nomoro ya mogala e fosagetseng' : 'Invalid phone number',
    subjectReq: lang === 'tn' ? 'Setlhogo se a tlhokega' : 'Subject is required',
    messageReq: lang === 'tn' ? 'Molaetsa o a tlhokega' : 'Message is required',
    moreDetail: lang === 'tn' ? 'Tsweetswee fana ka dintlha tse di oketsegileng' : 'Please provide more detail',
    formErr: lang === 'tn' ? 'Go na le phoso. Tsweetswee leka gape kgotsa ikgolaganye le rona ka mogala.' : 'Something went wrong. Please try again or contact us by phone.',
    mapTitle: lang === 'tn' ? 'Lefelo la BOCRA' : 'BOCRA Location',
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = T.nameReq;
    if (!form.email.trim()) e.email = T.emailReq;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = T.invalidEmail;
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = T.invalidPhone;
    if (!form.subject.trim()) e.subject = T.subjectReq;
    if (!form.message.trim()) e.message = T.messageReq;
    else if (form.message.trim().length < 10) e.message = T.moreDetail;
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return; setLoading(true);
    try {
      const { error: insertErr } = await supabase.from('contact_submissions').insert([{ name: form.name, email: form.email, phone: form.phone, subject: form.subject, message: form.message, consent_given_at: new Date().toISOString() }]);
      if (insertErr) throw insertErr; setSubmitted(true);
    } catch (err) { setErrors(prev => ({ ...prev, form: T.formErr })); }
    setLoading(false);
  };

  return (
    <div>
      <div className="bg-bocra-off-white border-b border-gray-100"><div className="section-wrapper py-4"><nav className="text-sm text-bocra-slate/50 flex items-center gap-2"><Link to="/" className="hover:text-bocra-blue transition-colors">{T.home}</Link><ChevronRight size={14} /><span className="text-bocra-slate">{T.contactUs}</span></nav></div></div>
      <PageHero category="CONTACT" categoryTn="IKGOLAGANYE" title="Get in Touch" titleTn="Ikgolaganye le Rona" description="Reach out to BOCRA for enquiries, feedback, or assistance with communications regulatory matters in Botswana." descriptionTn="Ikgolaganye le BOCRA ka dipotso, maikutlo, kgotsa thuso ka merero ya taolo ya dikgolagano mo Botswana." color="blue" />
      <section className="py-10 md:py-14 bg-white"><div className="section-wrapper"><div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-display text-bocra-slate mb-6">{T.contactInfo}</h2>
            <div className="space-y-5">
              <CI icon={MapPin} title={T.address} content={<>Plot 50671 Independence Avenue<br/>Private Bag 00495<br/>Gaborone, Botswana</>} />
              <CI icon={Phone} title={T.telephone} content={<a href="tel:+2673957755" className="hover:text-bocra-blue transition-colors">+267 395 7755</a>} />
              <CI icon={Phone} title={T.fax} content="+267 395 7976" />
              <CI icon={Mail} title={T.email} content={<a href="mailto:info@bocra.org.bw" className="hover:text-bocra-blue transition-colors">info@bocra.org.bw</a>} />
              <CI icon={Clock} title={T.officeHours} content={T.officeHoursVal} />
            </div>
          </div>
          <div className="bg-bocra-off-white rounded-2xl overflow-hidden h-64 border border-gray-100">
            <iframe title={T.mapTitle} src="https://www.openstreetmap.org/export/embed.html?bbox=25.91%2C-24.66%2C25.94%2C-24.64&layer=mapnik&marker=-24.6528%2C25.9231" width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
          </div>
        </div>
        <div ref={formRef} className="lg:col-span-3">
          {submitted ? (
            <div className="bg-bocra-green/5 border border-bocra-green/20 rounded-2xl p-12 text-center">
              <CheckCircle size={48} className="text-bocra-green mx-auto mb-4" />
              <h3 className="text-2xl font-display text-bocra-slate mb-2">{T.messageSent}</h3>
              <p className="text-bocra-slate/60">{T.thankYou}</p>
            </div>
          ) : (
            <div className="bg-bocra-off-white rounded-2xl p-8 md:p-10">
              <h2 className="text-2xl font-display text-bocra-slate mb-6">{T.sendMessage}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><FF label={T.fullName} value={form.name} onChange={(v) => u('name', v)} required placeholder={T.fullNamePh} />{errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}</div>
                  <div><FF label={T.emailAddress} type="email" value={form.email} onChange={(v) => u('email', v)} required placeholder="your@email.com" />{errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><FF label={T.phoneNumber} type="tel" value={form.phone} onChange={(v) => u('phone', v)} placeholder="+267 ..." />{errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}</div>
                  <div><FF label={T.subject} value={form.subject} onChange={(v) => u('subject', v)} required placeholder={T.subjectPh} />{errors.subject && <p className="text-[10px] text-red-500 mt-0.5">{errors.subject}</p>}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bocra-slate mb-1.5">{T.message}</label>
                  <textarea value={form.message} onChange={(e) => u('message', e.target.value)} rows={5} placeholder={T.messagePh}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all resize-none ${errors.message ? 'border-red-300' : 'border-gray-200'}`} />
                  {errors.message && <p className="text-[10px] text-red-500 mt-0.5">{errors.message}</p>}
                </div>
                <ConsentCheckbox checked={consent} onChange={setConsent} purpose="responding to your enquiry and improving BOCRA's services" purposeTn="go araba potso ya gago le go tokafatsa ditirelo tsa BOCRA" />
                {errors.form && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.form}</p>}
                <button type="submit" disabled={loading || !consent} className="btn-primary w-full justify-center disabled:opacity-60">
                  {loading ? T.sending : T.sendBtn}<Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div></div></section>
    </div>
  );
}
function CI({ icon: Icon, title, content }) {
  return (<div className="flex items-start gap-4"><div className="w-10 h-10 bg-bocra-blue/5 rounded-xl flex items-center justify-center flex-shrink-0"><Icon size={18} className="text-bocra-blue" /></div><div><p className="text-sm font-medium text-bocra-slate">{title}</p><p className="text-sm text-bocra-slate/60 mt-0.5">{content}</p></div></div>);
}
function FF({ label, type = 'text', value, onChange, required, placeholder }) {
  return (<div><label className="block text-sm font-medium text-bocra-slate mb-1.5">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all" /></div>);
}
