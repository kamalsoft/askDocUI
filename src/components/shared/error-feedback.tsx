import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFeedbackProps {
  /** Human‑readable error message */
  message: string;
  /** Optional callback to retry the failing operation */
  onRetry?: () => void;
}

/**
 * A premium error display used across the app. It features a subtle glassy background,
 * an icon, and an optional retry button. The design follows the app's dark‑mode and
 * glassmorphism aesthetic.
 */
export const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-rose-500/20 shadow-lg">
      <XCircle className="text-rose-600 mb-3" size={48} />
      <p className="text-center text-sm text-rose-700 dark:text-rose-300 mb-4 max-w-xs">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-1"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
