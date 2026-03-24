/**
 * SplashScreen.jsx — Animated Intro Screen
 *
 * Plays a GSAP-animated splash screen on the user's first visit.
 * Displays the BOCRA logo with entrance animation and a bilingual tagline.
 * After the animation completes, it calls onComplete() to reveal the app.
 *
 * The splash only plays once per session — controlled by sessionStorage key
 * 'bocra-splash'. Subsequent visits skip directly to the main content.
 *
 * Bilingual: tagline switches between English and Setswana.
 */
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '../../lib/language';

export default function SplashScreen({ onComplete }) {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const hasRun = useRef(false);
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('bocra-splash'));

  useEffect(() => {
    if (!visible || hasRun.current) { onComplete?.(); return; }
    hasRun.current = true;
    const tl = gsap.timeline({
      onComplete: () => { sessionStorage.setItem('bocra-splash', '1'); setVisible(false); onComplete?.(); },
    });
    gsap.set('.sp-dot', { scale: 0 });
    gsap.set('.sp-letter', { y: 60, opacity: 0 });
    gsap.set('.sp-sub', { opacity: 0, y: 15 });
    gsap.set('.sp-line', { scaleX: 0 });
    tl.to('.sp-dot-1', { scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0.3)
      .to('.sp-dot-2', { scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0.45)
      .to('.sp-dot-3', { scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0.6)
      .to('.sp-dot-4', { scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0.75)
      .to('.sp-line', { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, 1.0)
      .to('.sp-letter', { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' }, 1.2)
      .to('.sp-sub', { opacity: 1, y: 0, duration: 0.4 }, 2.0);
    if (ref.current) tl.to(ref.current, { opacity: 0, scale: 1.05, duration: 0.6, ease: 'power2.in' }, 2.8);
    return () => tl.kill();
  }, []);

  if (!visible) return null;
  return (
    <div ref={ref} className="fixed inset-0 z-[10000] bg-[#002D5C] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="flex overflow-hidden">
          {'BOCRA'.split('').map((l, i) => (
            <span key={i} className="sp-letter text-5xl md:text-7xl font-extrabold text-white tracking-[0.12em]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{l}</span>
          ))}
        </div>
        <p className="sp-sub text-white/40 text-xs md:text-sm tracking-[0.25em] uppercase mt-3 mb-5">
          {lang === 'tn' ? 'Bothati jwa Taolo ya Dikgokagano' : 'Communications Regulatory Authority'}
        </p>
        <div className="sp-line w-28 h-[1px] bg-white/20 mb-5 origin-left" />
        <div className="flex items-center gap-3">
          <div className="sp-dot sp-dot-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#00A6CE]" />
          <div className="sp-dot sp-dot-2 w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#C8237B]" />
          <div className="sp-dot sp-dot-3 w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#F7B731]" />
          <div className="sp-dot sp-dot-4 w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#6BBE4E]" />
        </div>
      </div>
    </div>
  );
}
