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
import App from './App';
import './index.css';

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
