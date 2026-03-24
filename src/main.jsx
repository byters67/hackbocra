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
// Patches both gsap.* static methods AND Timeline.prototype methods,
// since tl.to()/tl.fromTo() bypass gsap.to()/gsap.fromTo() internally.
const isInvalid = (t) => t == null || (t instanceof NodeList && t.length === 0)
  || (t instanceof HTMLCollection && t.length === 0);

// Patch gsap static methods
const _gsapTo = gsap.to.bind(gsap);
const _gsapFrom = gsap.from.bind(gsap);
const _gsapFromTo = gsap.fromTo.bind(gsap);
const _gsapSet = gsap.set.bind(gsap);
gsap.to = (targets, vars) => isInvalid(targets) ? gsap.timeline() : _gsapTo(targets, vars);
gsap.from = (targets, vars) => isInvalid(targets) ? gsap.timeline() : _gsapFrom(targets, vars);
gsap.fromTo = (targets, fromVars, toVars) => isInvalid(targets) ? gsap.timeline() : _gsapFromTo(targets, fromVars, toVars);
gsap.set = (targets, vars) => isInvalid(targets) ? gsap.timeline() : _gsapSet(targets, vars);

// Patch Timeline prototype methods (tl.to, tl.from, tl.fromTo, tl.set)
const TlProto = Object.getPrototypeOf(gsap.timeline());
const _tlTo = TlProto.to;
const _tlFrom = TlProto.from;
const _tlFromTo = TlProto.fromTo;
const _tlSet = TlProto.set;
TlProto.to = function(targets, vars, position) {
  return isInvalid(targets) ? this : _tlTo.call(this, targets, vars, position);
};
TlProto.from = function(targets, vars, position) {
  return isInvalid(targets) ? this : _tlFrom.call(this, targets, vars, position);
};
TlProto.fromTo = function(targets, fromVars, toVars, position) {
  return isInvalid(targets) ? this : _tlFromTo.call(this, targets, fromVars, toVars, position);
};
TlProto.set = function(targets, vars, position) {
  return isInvalid(targets) ? this : _tlSet.call(this, targets, vars, position);
};

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
