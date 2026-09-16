import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface dark:bg-[#0d1117] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="w-16 h-16 rounded-full bg-error-container/20 dark:bg-red-900/30 text-error dark:text-red-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">gpp_bad</span>
            </div>
            <h1 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-100">Something went wrong.</h1>
            <p className="text-body-md text-on-surface-variant dark:text-gray-400">
              A critical error occurred while rendering this component. For security reasons, the current operation has been aborted safely.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto bg-primary dark:bg-indigo-600 text-on-primary dark:text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all"
              >
                Try again
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto bg-surface-container-high dark:bg-gray-800 text-on-surface dark:text-gray-200 px-6 py-2.5 rounded-xl font-medium border border-outline-variant/30 dark:border-gray-700 hover:bg-surface-container-highest transition-all"
              >
                Return to SecureVault
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
