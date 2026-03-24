/**
 * GSAP Animation Hooks
 * 
 * Custom React hooks for scroll-triggered animations using GSAP + ScrollTrigger.
 * Inspired by Lusion.co's smooth scroll reveal patterns.
 * 
 * USAGE:
 *   import { useScrollReveal, useParallax, useStaggerReveal } from '@/hooks/useAnimations';
 * 
 *   // In your component:
 *   const sectionRef = useScrollReveal();
 *   return <div ref={sectionRef} className="gsap-fade-up">Content</div>
 */

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollReveal - Fade up + reveal animation on scroll
 * 
 * Attach this ref to any element with class 'gsap-fade-up' to animate
 * it into view when it enters the viewport.
 * 
 * @param {object} options - GSAP animation options override
 * @returns {React.RefObject} - Attach to the target element
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animation = gsap.fromTo(el, 
      { 
        y: options.y ?? 30, 
        opacity: 0,
        scale: options.scale ?? 1,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: options.duration ?? 0.5,
        ease: options.ease ?? 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: options.start ?? 'top 90%',
          end: options.end ?? 'bottom 20%',
          toggleActions: 'play none none reverse',
          ...options.scrollTrigger,
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return ref;
}

/**
 * useStaggerReveal - Animate children elements one after another
 * 
 * Great for lists, card grids, nav items, etc.
 * 
 * @param {object} options
 * @param {number} options.stagger - Delay between each child (default: 0.1)
 * @returns {React.RefObject} - Attach to the parent container
 */
export function useStaggerReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.children;
    if (!children.length) return;

    const animation = gsap.fromTo(children,
      { y: 25, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: options.duration ?? 0.4,
        stagger: options.stagger ?? 0.06,
        ease: options.ease ?? 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: options.start ?? 'top 90%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return ref;
}

/**
 * useParallax - Parallax scrolling effect for depth
 * 
 * Makes an element scroll at a different speed than the page,
 * creating a sense of depth (Lusion.co style).
 * 
 * @param {number} speed - Parallax speed (-1 to 1, 0 = no effect)
 * @returns {React.RefObject}
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animation = gsap.to(el, {
      yPercent: speed * 50,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [speed]);

  return ref;
}

/**
 * useTextReveal - Split text reveal animation (word by word)
 * 
 * Creates a mask-reveal effect where text slides up into view.
 * Similar to Lusion.co's headline animations.
 * 
 * @returns {React.RefObject}
 */
export function useTextReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Wrap each word in a span for individual animation
    const text = el.textContent;
    const words = text.split(' ');
    el.innerHTML = words.map(word => 
      `<span style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:4px;">
        <span style="display:inline-block;transform:translateY(110%)">${word}</span>
      </span>`
    ).join(' ');

    const innerSpans = el.querySelectorAll('span > span');

    const animation = gsap.to(innerSpans, {
      y: 0,
      duration: 0.8,
      stagger: 0.04,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
      el.textContent = text; // Restore original text
    };
  }, []);

  return ref;
}

/**
 * useCountUp - Animated number counter on scroll
 * 
 * @param {number} target - The number to count up to
 * @param {string} suffix - Optional suffix (e.g., '+', '%', 'M')
 * @returns {React.RefObject}
 */
export function useCountUp(target, suffix = '', compact = false) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: 0 };

    const formatValue = (val) => {
      const rounded = Math.round(val);
      if (compact) {
        if (rounded >= 1000000) return (rounded / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (rounded >= 1000) return Math.round(rounded / 1000) + 'k';
      }
      return rounded.toLocaleString();
    };

    const animation = gsap.to(obj, {
      value: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none', // play once, never reverse
      },
      onUpdate: () => {
        el.textContent = formatValue(obj.value) + suffix;
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [target, suffix, compact]);

  return ref;
}

/**
 * useHorizontalScroll - Horizontal scroll section (pinned)
 * 
 * Pins a section and scrolls its content horizontally.
 * 
 * @returns {{ containerRef: RefObject, wrapperRef: RefObject }}
 */
export function useHorizontalScroll() {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const totalWidth = wrapper.scrollWidth - container.offsetWidth;

    const animation = gsap.to(wrapper, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        end: () => `+=${totalWidth}`,
        anticipatePin: 1,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return { containerRef, wrapperRef };
}

/**
 * Utility: Refresh all ScrollTriggers (call after route changes)
 */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

/**
 * Utility: Kill all ScrollTriggers (call on unmount)
 */
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach(t => t.kill());
}
