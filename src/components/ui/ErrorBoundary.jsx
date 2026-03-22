/**
 * ErrorBoundary.jsx — React Error Boundary for Graceful Failure Recovery
 *
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a user-friendly fallback UI instead of crashing the entire page.
 *
 * Used throughout the app to wrap:
 *   - The main content area (Layout.jsx)
 *   - Individual widgets (ChatWidget, AccessibilityWidget)
 *   - Each admin page section
 *
 * This addresses OWASP A06 (Vulnerable and Outdated Components) by ensuring
 * that a crash in one component doesn't take down the entire application.
 */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Log to error_logs table (fire-and-forget — never crash on error logging)
    try {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/error_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          error_type: 'react_crash',
          message: error?.message || 'Unknown error',
          stack: error?.stack?.substring(0, 2000),
          component: errorInfo?.componentStack?.substring(0, 1000),
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        }),
      }).catch(() => {}); // Silent — error reporting must never cause errors
    } catch (_) {
      // Silently fail
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
            <h2 className="text-xl font-display text-red-800 mb-3">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-6">
              This section encountered an error. Your data is safe.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-bocra-blue text-white rounded-xl
                         hover:bg-blue-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
