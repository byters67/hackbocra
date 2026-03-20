/**
 * PageTransition Component
 * 
 * Bulletproof scroll-to-top on EVERY route change.
 * 
 * The root cause of "page opens at bottom" was the browser's 
 * automatic scroll restoration. When you navigate, the browser 
 * remembers your scroll position and restores it AFTER React 
 * renders — overriding any scrollTo(0,0) we fire.
 * 
 * Fix: disable history.scrollRestoration + use multiple scroll 
 * calls across layout/paint phases + kill GSAP ScrollTriggers.
 */
import { useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* Disable browser's automatic scroll restoration globally */
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  /* Phase 1: useLayoutEffect — fires synchronously after DOM 
     mutation, before browser paint */
  useLayoutEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    /* Kill GSAP ScrollTriggers so they can't fight scroll position */
    ScrollTrigger.getAll().forEach(t => t.kill());

    /* Scroll to top immediately */
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  /* Phase 2: useEffect — fires after paint, catches any 
     async layout shifts from images/fonts/lazy content */
  useEffect(() => {
    /* Immediate */
    window.scrollTo(0, 0);

    /* After first paint frame */
    const raf1 = requestAnimationFrame(() => {
      window.scrollTo(0, 0);

      /* After second paint frame — catches all edge cases */
      const raf2 = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
      });

      return () => cancelAnimationFrame(raf2);
    });

    /* Final safety net — 100ms timeout for slow mobile browsers */
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 120);

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(timeout);
    };
  }, [pathname]);

  return <div>{children}</div>;
}
