/**
 * Footer.jsx — Site Footer with Quick Links, Contact Info & Social Media
 *
 * Fully bilingual (English / Setswana). Includes:
 *   - BOCRA mission statement and logo
 *   - Quick Links to key pages (About, Licensing, Documents, etc.)
 *   - Online Services links (QoS Monitoring, Type Approval, Register .BW, etc.)
 *   - Physical address, phone, and email contact details
 *   - Social media links (Facebook, X/Twitter, YouTube, LinkedIn)
 *   - Privacy Notice link and copyright
 *   - Security verification badge
 */
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import BocraLogo from '../ui/BocraLogo';
import { useLanguage } from '../../lib/language';

const SOCIAL = [
  { label: 'Facebook', url: 'https://www.facebook.com/share/1ZYhhzVuRK/', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { label: 'X', url: 'https://x.com/BOCRAbw', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'YouTube', url: 'https://youtube.com/@bocra7629', d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/bta_3/', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z' },
];

export default function Footer() {
  const { lang } = useLanguage();
  const tn = lang === 'tn';

  const QUICK_LINKS = [
    { label: tn ? 'Ka ga Rona' : 'About', path: '/about/profile' },
    { label: tn ? 'Lekgotla' : 'Board', path: '/about/board' },
    { label: tn ? 'Dilaesense' : 'Licensing', path: '/licensing' },
    { label: tn ? 'Tlhagisa Ngongorego' : 'File a Complaint', path: '/services/file-complaint' },
    { label: tn ? 'Dipalopalo' : 'Telecom Stats', path: '/telecom-statistics' },
    { label: tn ? 'Dikwalo' : 'Documents', path: '/documents/drafts' },
    { label: tn ? 'Dikgang' : 'News', path: '/media/news' },
    { label: tn ? 'Ditendara' : 'Tenders', path: '/tenders' },
    { label: tn ? 'Dipotso' : 'FAQs', path: '/faqs' },
    { label: tn ? 'Ditiro' : 'Careers', path: '/about/careers' },
    { label: tn ? 'Ikgolaganye' : 'Contact', path: '/contact' },
    { label: tn ? 'Ingodisa go Fumana Diphetogo' : 'Subscribe to Updates', path: '/subscribe' },
  ];

  const EXTERNAL_LINKS = [
    { label: tn ? 'Kgoro ya BOCRA' : 'BOCRA Portal', path: '/admin' },
    { label: tn ? 'Tlhokomelo ya Boleng' : 'QoS Monitoring', path: '/services/qos-monitoring' },
    { label: 'ASMS-WebCP', path: '/services/asms-webcp' },
    { label: tn ? 'Kwadisa .BW' : 'Register .BW', path: '/services/register-bw' },
    { label: tn ? 'Netefatsa Laesense' : 'Licence Verification', path: '/services/licence-verification' },
  ];

  return (
    <footer className="bg-[#0A1628] text-white/80 relative overflow-hidden">
      <div className="flex h-1">
        <div className="flex-1 bg-[#00A6CE]" /><div className="flex-1 bg-[#C8237B]" /><div className="flex-1 bg-[#F7B731]" /><div className="flex-1 bg-[#6BBE4E]" />
      </div>
      <div className="section-wrapper py-10 sm:py-12">
        <div className="text-center">
          <div className="flex justify-center"><BocraLogo white height={36} /></div>
          <p className="mt-3 text-white/40 text-sm leading-relaxed max-w-md mx-auto">
            {tn ? 'Go laola dikgolagano go rotloetsa kgaisano, boitlhamedi, tshireletso ya badirisi le phitlhelelo ya botlhe mo Botswana.' : 'Regulating communications for competition, innovation, consumer protection and universal access in Botswana.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 mt-5 text-sm">
            <a href="tel:+2673957755" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"><Phone size={14} className="text-[#00A6CE]" /> +267 395 7755</a>
            <span className="w-px h-4 bg-white/10 hidden sm:block" />
            <a href="mailto:info@bocra.org.bw" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"><Mail size={14} className="text-[#00A6CE]" /> info@bocra.org.bw</a>
            <span className="w-px h-4 bg-white/10 hidden sm:block" />
            <a href="https://maps.google.com/?q=Plot+50671+Independence+Avenue+Gaborone+Botswana" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"><MapPin size={14} className="text-[#00A6CE]" /> Plot 50671, Gaborone</a>
          </div>
          <div className="flex items-center justify-center gap-2 mt-5">
            {SOCIAL.map(s => (<a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg></a>))}
          </div>
        </div>
        <div className="h-px bg-white/[0.06] my-8" />
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{tn ? 'Dikgolagano tse di Bonako' : 'Quick Links'}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map(l => (<Link key={l.path} to={l.path} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">{l.label}</Link>))}
          </div>
        </div>
        <div className="text-center mt-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{tn ? 'Ditirelo tsa mo Inthaneteng' : 'Online Services'}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXTERNAL_LINKS.map(l => l.path ? (<Link key={l.path} to={l.path} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00A6CE]/70 bg-[#00A6CE]/5 hover:bg-[#00A6CE]/10 hover:text-[#00A6CE] transition-all whitespace-nowrap">{l.label}</Link>) : (<a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00A6CE]/70 bg-[#00A6CE]/5 hover:bg-[#00A6CE]/10 hover:text-[#00A6CE] transition-all whitespace-nowrap">{l.label}<ArrowUpRight size={10} /></a>))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="section-wrapper py-4 flex flex-col items-center gap-1 text-center">
          <p className="text-[11px] text-white/30">© {new Date().getFullYear()} {tn ? 'Botswana Communications Regulatory Authority. Ditshwanelo Tsotlhe di Tsentswe.' : 'Botswana Communications Regulatory Authority. All Rights Reserved.'}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <ShieldCheck size={12} className="text-white/20" />
            <p className="text-[10px] text-white/20">{tn ? 'E sireletswa ke reCAPTCHA' : 'Protected by reCAPTCHA'} &mdash; <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/40">{tn ? 'Sephiri' : 'Privacy'}</a> · <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/40">{tn ? 'Melawana' : 'Terms'}</a></p>
          </div>
          <Link to="/privacy-notice" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">{tn ? 'Kitsiso ya Sephiri' : 'Privacy Notice'}</Link>
        </div>
      </div>
    </footer>
  );
}
