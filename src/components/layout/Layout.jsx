/**
 * Layout Component
 * 
 * Wraps all pages with the Header and Footer.
 * Handles smooth page transitions and scroll-to-top on route change.
 * 
 * Also includes:
 * - Skip-to-content link for accessibility
 * - Scroll-to-top on navigation
 * - Page transition animation
 */

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PageTransition from '../animations/PageTransition';
import AccessibilityWidget from '../ui/AccessibilityWidget';
import CookieConsent from '../ui/CookieConsent';
import ChatWidget from '../ui/ChatWidget';
import RecaptchaBadge from '../ui/RecaptchaBadge';
import ErrorBoundary from '../ui/ErrorBoundary';
import PageLoader from '../ui/PageLoader';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col grain-overlay">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-bocra-blue focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1 pt-16 lg:pt-[120px]">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <ErrorBoundary>
        <AccessibilityWidget />
      </ErrorBoundary>
      <ErrorBoundary>
        <ChatWidget />
      </ErrorBoundary>
      <RecaptchaBadge />
      <CookieConsent />
    </div>
  );
}
