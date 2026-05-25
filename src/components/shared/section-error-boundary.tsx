'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Custom Error Boundary to catch errors in specific dashboard sections
 * prevents a single component failure from breaking the entire page.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in dashboard section [${this.props.name || 'Unknown'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full min-h-[200px] p-6 border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-100 text-sm">Section Unvailable</h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1 uppercase tracking-tight font-medium">
              Failed to load {this.props.name || 'component'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-md text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
          >
            <RotateCcw size={14} />
            RETRY SECTION
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}