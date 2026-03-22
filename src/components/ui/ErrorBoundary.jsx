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
    // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
    console.error('ErrorBoundary caught:', error, errorInfo);
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
