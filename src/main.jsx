/**
 * main.jsx — Application Entry Point
 *
 * Mounts the React application to the DOM root element (#root in index.html).
 * Imports global CSS (Tailwind utilities + custom BOCRA design tokens).
 *
 * ACCESSIBILITY:
 *   In development mode, @axe-core/react is loaded to automatically audit
 *   the rendered DOM for WCAG violations and log them to the console.
 *   This is stripped from production builds by Vite's tree-shaking.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { gsap } from 'gsap';
import App from './App';
import './index.css';

// Safety net: prevent GSAP from crashing when a component passes a
// null/undefined ref (e.g. after an early return for auth redirects
// or loading states where the animated DOM node never mounts).
const _gsapTo = gsap.to.bind(gsap);
const _gsapFrom = gsap.from.bind(gsap);
const _gsapFromTo = gsap.fromTo.bind(gsap);
const _gsapSet = gsap.set.bind(gsap);

const isInvalid = (t) => t == null || (t instanceof NodeList && t.length === 0)
  || (t instanceof HTMLCollection && t.length === 0);

gsap.to = (targets, vars) => isInvalid(targets) ? gsap.timeline() : _gsapTo(targets, vars);
gsap.from = (targets, vars) => isInvalid(targets) ? gsap.timeline() : _gsapFrom(targets, vars);
gsap.fromTo = (targets, fromVars, toVars) => isInvalid(targets) ? gsap.timeline() : _gsapFromTo(targets, fromVars, toVars);
gsap.set = (targets, vars) => isInvalid(targets) ? gsap.timeline() : _gsapSet(targets, vars);

// Development-only: run axe-core accessibility audits on every render
// Results appear in the browser console — helps catch WCAG issues early
if (import.meta.env.DEV) {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
