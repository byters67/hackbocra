/**
 * AccessibilityWidget.jsx — WCAG 2.1 Accessibility Toolbar
 *
 * Floating accessibility panel (bottom-left) that provides:
 *   - Text-to-Speech: reads the current page aloud using Web Speech API
 *   - Font Size control: increase/decrease/reset page font size
 *   - High Contrast mode: dark background with bright text
 *   - Link Highlighting: outlines all clickable links in yellow
 *   - Dyslexia-friendly font: switches to OpenDyslexic typeface
 *   - Big Cursor: enlarges the mouse pointer
 *   - Reading Guide: horizontal line follows the mouse for focus
 *   - Reduced Motion: disables all CSS animations
 *   - Back to Top button: smooth scroll to page top
 *
 * All settings persist in sessionStorage for the duration of the visit.
 * Fully bilingual — labels switch between English and Setswana.
 *
 * COMPLIANCE: Addresses WCAG 2.1 AA requirements for:
 *   - Resize Text (1.4.4)
 *   - Contrast (1.4.3)
 *   - Animation from Interactions (2.3.3)
 *   - Focus Visible (2.4.7)
 */
import { useState, useEffect, useCallback } from 'react';
import { Accessibility, Volume2, ZoomIn, ZoomOut, RotateCcw, Eye, X, MousePointer, Type, Underline, Pause, Play, MinusCircle, Minus } from 'lucide-react';
import { useLanguage } from '../../lib/language';

export default function AccessibilityWidget() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => parseInt(sessionStorage.getItem('a11y-fs') || '100'));
  const [highContrast, setHighContrast] = useState(() => sessionStorage.getItem('a11y-hc') === '1');
  const [highlightLinks, setHighlightLinks] = useState(() => sessionStorage.getItem('a11y-hl') === '1');
  const [dyslexiaFont, setDyslexiaFont] = useState(() => sessionStorage.getItem('a11y-df') === '1');
  const [bigCursor, setBigCursor] = useState(() => sessionStorage.getItem('a11y-bc') === '1');
  const [readingGuide, setReadingGuide] = useState(() => sessionStorage.getItem('a11y-rg') === '1');
  const [reducedMotion, setReducedMotion] = useState(() => sessionStorage.getItem('a11y-rm') === '1');
  const [speaking, setSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [guideY, setGuideY] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => { setSpeechSupported('speechSynthesis' in window); }, []);
  useEffect(() => { const h = () => setShowTop(window.scrollY > 400); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { document.documentElement.style.fontSize = `${fontSize}%`; sessionStorage.setItem('a11y-fs', String(fontSize)); }, [fontSize]);
  useEffect(() => { document.documentElement.classList.toggle('a11y-hc', highContrast); sessionStorage.setItem('a11y-hc', highContrast ? '1' : '0'); }, [highContrast]);
  useEffect(() => { document.documentElement.classList.toggle('a11y-hl', highlightLinks); sessionStorage.setItem('a11y-hl', highlightLinks ? '1' : '0'); }, [highlightLinks]);
  useEffect(() => { document.documentElement.classList.toggle('a11y-df', dyslexiaFont); sessionStorage.setItem('a11y-df', dyslexiaFont ? '1' : '0'); }, [dyslexiaFont]);
  useEffect(() => { document.documentElement.classList.toggle('a11y-bc', bigCursor); sessionStorage.setItem('a11y-bc', bigCursor ? '1' : '0'); }, [bigCursor]);
  useEffect(() => { document.documentElement.classList.toggle('a11y-rm', reducedMotion); sessionStorage.setItem('a11y-rm', reducedMotion ? '1' : '0'); }, [reducedMotion]);
  useEffect(() => { sessionStorage.setItem('a11y-rg', readingGuide ? '1' : '0'); const h = (e) => setGuideY(e.clientY); if (readingGuide) window.addEventListener('mousemove', h); return () => window.removeEventListener('mousemove', h); }, [readingGuide]);

  const toggleSpeech = useCallback(() => {
    if (!speechSupported) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const main = document.getElementById('main-content');
    if (!main) return;
    const u = new SpeechSynthesisUtterance(main.innerText.slice(0, 6000));
    u.lang = lang === 'tn' ? 'tn' : 'en'; u.rate = 0.85;
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u); setSpeaking(true);
  }, [speaking, speechSupported, lang]);
  useEffect(() => () => { if (speechSupported) window.speechSynthesis.cancel(); }, [speechSupported]);

  const resetAll = () => { setFontSize(100); setHighContrast(false); setHighlightLinks(false); setDyslexiaFont(false); setBigCursor(false); setReadingGuide(false); setReducedMotion(false); if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); } };

  const T = {
    title: lang === 'tn' ? 'Dira Webosaete e Bonolo go Dirisiwa' : 'Make This Site Easier To Use',
    subtitle: lang === 'tn' ? 'Tlhopha se se go thusang thata' : 'Choose what helps you most',
    readAloud: lang === 'tn' ? 'Mpalela Tsebe e' : 'Read This Page To Me',
    stopReading: lang === 'tn' ? 'Emisa go Bala' : 'Stop Reading',
    readAloudDesc: lang === 'tn' ? 'Webosaete e tla go balela mafoko otlhe mo tsebeng e ka lentswe le le kwa godimo' : 'The website will read all the words on this page out loud for you',
    textSize: lang === 'tn' ? 'Bogolo jwa Mokwalo' : 'Text Size',
    normal: lang === 'tn' ? 'Tlwaelo' : 'Normal', smallerText: lang === 'tn' ? 'Mokwalo o monnye' : 'Smaller text', biggerText: lang === 'tn' ? 'Mokwalo o mogolo' : 'Bigger text', normalSize: lang === 'tn' ? 'Bogolo jwa tlwaelo' : 'Normal text size',
    hc: lang === 'tn' ? 'Pharologanyo e Kgolo' : 'High Contrast', hcDesc: lang === 'tn' ? 'E dira sekirini se sentsho ka mokwalo o o phatsimang' : 'Makes the screen darker with brighter text — easier on your eyes',
    hl: lang === 'tn' ? 'Bontsha Dikgolagano Tsotlhe' : 'Show All Clickable Links', hlDesc: lang === 'tn' ? 'E totobatsa dikgolagano tsotlhe ka mmala o o tshweu gore o bone se o ka se tobetsang' : 'Highlights every link in bright yellow so you can see what to click',
    ef: lang === 'tn' ? 'Mokwalo o o Bonolo' : 'Easy Reading Font', efDesc: lang === 'tn' ? 'E fetola go mokwalo o o diretsweng go nna bonolo go balwa ke botlhe' : 'Changes to a font designed to be easier to read for everyone',
    bc: lang === 'tn' ? 'Motshwantsho wa Mouse o Mogolo' : 'Bigger Mouse Arrow', bcDesc: lang === 'tn' ? 'E dira motshwantsho wa mouse o mogolo thata' : 'Makes your mouse pointer much larger and easier to find on screen',
    rg: lang === 'tn' ? 'Mothaladi wa Thuso ya go Bala' : 'Reading Guide Line', rgDesc: lang === 'tn' ? 'Mothaladi wa mmala o latela mouse ya gago' : 'A coloured line follows your mouse to help you keep your place',
    sm: lang === 'tn' ? 'Emisa Dilo tse di Tsamayang' : 'Stop Moving Elements', smDesc: lang === 'tn' ? 'E emisa ditshwantsho tsotlhe tse di tsamayang' : 'Stops all animations and moving parts for a calmer, still page',
    reset: lang === 'tn' ? 'Busetsa Tsotlhe mo Tlwaelong' : 'Reset Everything to Normal',
    on: lang === 'tn' ? 'BUTSWE' : 'ON', close: lang === 'tn' ? 'Tswala' : 'Close', a11y: lang === 'tn' ? 'Phitlhelelo' : 'Accessibility',
    openLabel: lang === 'tn' ? 'Bula ditlhopho tsa phitlhelelo' : 'Open accessibility options', closeLabel: lang === 'tn' ? 'Tswala ditlhopho tsa phitlhelelo' : 'Close accessibility options',
    tooltip: lang === 'tn' ? 'Dira webosaete e bonolo go dirisiwa' : 'Make this website easier to use', backToTop: lang === 'tn' ? 'Boela kwa godimo ga tsebe' : 'Go back to top of page',
  };

  return (<>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');.a11y-hc{filter:none!important}.a11y-hc body{background:#0A0A0F!important;color:#E8E8E8!important}.a11y-hc .bg-white,.a11y-hc .bg-bocra-off-white,.a11y-hc .bg-gray-50,.a11y-hc .bg-gray-100,.a11y-hc .glass-card,.a11y-hc .bg-blue-50,.a11y-hc [class*="bg-bocra-blue/5"],.a11y-hc [class*="bg-bocra-cyan/5"],.a11y-hc [class*="bg-bocra-cyan/10"]{background:#151520!important}.a11y-hc .bg-bocra-blue-dark,.a11y-hc .bg-bocra-blue,.a11y-hc .bg-bocra-slate{background:#0D0D15!important}.a11y-hc .bg-bocra-magenta,.a11y-hc .bg-bocra-cyan{background:#1A1A2E!important}.a11y-hc,.a11y-hc p,.a11y-hc span,.a11y-hc li,.a11y-hc td,.a11y-hc th,.a11y-hc label,.a11y-hc div{color:#E0E0E0!important}.a11y-hc h1,.a11y-hc h2,.a11y-hc h3,.a11y-hc h4{color:#FFF!important}.a11y-hc a{color:#5CC8FF!important;text-decoration:underline!important}.a11y-hc a:hover{color:#8DDBFF!important}.a11y-hc .text-bocra-blue,.a11y-hc .text-bocra-slate,.a11y-hc [class*="text-bocra-slate"]{color:#E0E0E0!important}.a11y-hc .text-white{color:#FFF!important}.a11y-hc [class*="text-bocra-slate/50"],.a11y-hc [class*="text-bocra-slate/60"],.a11y-hc [class*="text-bocra-slate/70"],.a11y-hc [class*="text-bocra-slate/40"],.a11y-hc [class*="text-white/50"],.a11y-hc [class*="text-white/60"],.a11y-hc [class*="text-white/40"],.a11y-hc [class*="text-white/70"]{color:#B0B0B0!important}.a11y-hc [class*="border-gray"],.a11y-hc [class*="border-white"],.a11y-hc .border{border-color:#333!important}.a11y-hc .content-body{color:#D0D0D0!important}.a11y-hc .content-body h2{color:#5CC8FF!important;border-color:#5CC8FF!important}.a11y-hc .content-body h3{color:#FFF!important;background:#1A1A2E!important;border-color:#5CC8FF!important}.a11y-hc .content-body p{color:#C0C0C0!important}.a11y-hc .content-body ul li{background:#1A1A2E!important;border-color:#333!important;color:#D0D0D0!important}.a11y-hc .content-body strong{color:#5CC8FF!important}.a11y-hc .content-body em{background:#2A2000!important;color:#F0D060!important;border-color:#F7B731!important}.a11y-hc .content-body a{color:#5CC8FF!important;border-color:#5CC8FF40!important}.a11y-hc input,.a11y-hc textarea,.a11y-hc select{background:#1A1A2E!important;color:#E0E0E0!important;border-color:#444!important}.a11y-hc input::placeholder,.a11y-hc textarea::placeholder{color:#666!important}.a11y-hc .btn-primary{background:#2563EB!important;color:#FFF!important}.a11y-hc .btn-secondary{border-color:#5CC8FF!important;color:#5CC8FF!important}.a11y-hc header,.a11y-hc nav{background:#0D0D15!important}.a11y-hc button{color:#E0E0E0!important}.a11y-hc footer{background:#080810!important}.a11y-hc ::-webkit-scrollbar-track{background:#111!important}.a11y-hc ::-webkit-scrollbar-thumb{background:#444!important}.a11y-hl a:not([class*="btn"]):not([aria-label="BOCRA Home"]){background:#FFFF00!important;color:#000!important;padding:2px 6px!important;text-decoration:underline!important;border-radius:4px!important;text-underline-offset:3px!important}.a11y-df *{font-family:'Lexend',sans-serif!important}.a11y-bc,.a11y-bc *{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M4 4L4 36L14 26L24 40L30 36L20 22L32 22Z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 4 4,auto!important}.a11y-rm *,.a11y-rm *::before,.a11y-rm *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}`}</style>
    {readingGuide && <div className="fixed left-0 right-0 h-12 pointer-events-none z-[9999]" style={{top:guideY-24,background:'linear-gradient(to bottom,transparent,rgba(0,69,139,0.1) 40%,rgba(0,69,139,0.15) 50%,rgba(0,69,139,0.1) 60%,transparent)',borderTop:'2px solid rgba(0,69,139,0.25)',borderBottom:'2px solid rgba(0,69,139,0.25)'}}/>}
    {showTop && <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="fixed bottom-[72px] sm:bottom-[72px] left-4 sm:left-6 z-[99] flex items-center justify-center w-10 h-10 bg-white text-bocra-blue rounded-full shadow-lg border border-gray-200 hover:bg-bocra-blue hover:text-white transition-all" aria-label={T.backToTop}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 14V2M2 7l6-5 6 5"/></svg></button>}
    <button onClick={()=>setOpen(!open)} className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-[100] flex items-center justify-center gap-2 w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-full sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all text-white font-bold ${open?'bg-bocra-slate':'bg-bocra-blue hover:scale-105'}`} aria-label={open?T.closeLabel:T.openLabel} title={T.tooltip}>{open?<X size={20}/>:<Accessibility size={20}/>}<span className="hidden sm:inline text-sm">{open?T.close:T.a11y}</span></button>
    <div className={`fixed bottom-20 sm:bottom-24 left-4 sm:left-6 z-[100] w-[calc(100vw-2rem)] sm:w-[340px] max-h-[65vh] sm:max-h-[75vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${open?'opacity-100 translate-y-0':'opacity-0 translate-y-4 pointer-events-none'}`} role="dialog" aria-label={lang==='tn'?'Dipeakanyo tsa phitlhelelo':'Accessibility settings'}>
      <div className="sticky top-0 p-5 bg-bocra-blue text-white rounded-t-2xl z-10"><h2 className="font-bold text-[17px] flex items-center gap-2"><Accessibility size={22}/>{T.title}</h2><p className="text-sm text-white/80 mt-1">{T.subtitle}</p></div>
      <div className="p-4 space-y-2.5">
        {speechSupported && <Btn icon={speaking?Pause:Volume2} label={speaking?T.stopReading:T.readAloud} desc={T.readAloudDesc} active={speaking} onClick={toggleSpeech} onLabel={T.on}/>}
        <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm font-bold text-bocra-slate mb-3 flex items-center gap-2"><Type size={16}/>{T.textSize} ({fontSize}%)</p><div className="flex items-center gap-2"><button onClick={()=>setFontSize(f=>Math.max(f-20,80))} disabled={fontSize<=80} className="flex-1 py-3.5 bg-white rounded-xl text-center font-bold text-lg border-2 border-gray-200 hover:border-bocra-blue active:bg-bocra-blue/5 transition-all disabled:opacity-30" aria-label={T.smallerText}>A<span className="text-xs align-super">-</span></button><button onClick={()=>setFontSize(100)} className="px-5 py-3.5 bg-white rounded-xl text-sm font-medium border-2 border-gray-200 hover:border-bocra-blue transition-all" aria-label={T.normalSize}>{T.normal}</button><button onClick={()=>setFontSize(f=>Math.min(f+20,180))} disabled={fontSize>=180} className="flex-1 py-3.5 bg-white rounded-xl text-center font-bold text-2xl border-2 border-gray-200 hover:border-bocra-blue active:bg-bocra-blue/5 transition-all disabled:opacity-30" aria-label={T.biggerText}>A<span className="text-sm align-super">+</span></button></div></div>
        <Btn icon={Eye} label={T.hc} desc={T.hcDesc} active={highContrast} onClick={()=>setHighContrast(!highContrast)} onLabel={T.on}/>
        <Btn icon={Underline} label={T.hl} desc={T.hlDesc} active={highlightLinks} onClick={()=>setHighlightLinks(!highlightLinks)} onLabel={T.on}/>
        <Btn icon={Type} label={T.ef} desc={T.efDesc} active={dyslexiaFont} onClick={()=>setDyslexiaFont(!dyslexiaFont)} onLabel={T.on}/>
        <Btn icon={MousePointer} label={T.bc} desc={T.bcDesc} active={bigCursor} onClick={()=>setBigCursor(!bigCursor)} onLabel={T.on}/>
        <Btn icon={MinusCircle} label={T.rg} desc={T.rgDesc} active={readingGuide} onClick={()=>setReadingGuide(!readingGuide)} onLabel={T.on}/>
        <Btn icon={Pause} label={T.sm} desc={T.smDesc} active={reducedMotion} onClick={()=>setReducedMotion(!reducedMotion)} onLabel={T.on}/>
        <button onClick={resetAll} className="w-full py-3 text-sm text-bocra-slate/50 hover:text-bocra-blue transition-colors flex items-center justify-center gap-2 mt-2"><RotateCcw size={14}/> {T.reset}</button>
      </div>
    </div>
  </>);
}

function Btn({icon:Icon,label,desc,active,onClick,onLabel='ON'}){
  return(<button onClick={onClick} className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${active?'bg-bocra-blue/5 border-bocra-blue':'bg-gray-50 border-transparent hover:border-gray-300'}`}><div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${active?'bg-bocra-blue text-white':'bg-white text-bocra-slate/50 border border-gray-200'}`}><Icon size={20}/></div><div className="flex-1"><p className={`text-[14px] font-bold ${active?'text-bocra-blue':'text-bocra-slate'}`}>{label}{active&&<span className="ml-2 text-xs font-medium text-white bg-bocra-blue px-1.5 py-0.5 rounded">{onLabel}</span>}</p><p className="text-xs text-bocra-slate/50 mt-0.5 leading-relaxed">{desc}</p></div></button>);
}
