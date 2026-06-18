import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Simple skeleton placeholder with optional width, height, variant, and lines.
 * Uses Tailwind's animate-pulse for a subtle loading effect.
 */
export const Skeleton = ({
  className = '',
  width = 'full',
  height = 'h-4',
  variant = 'default', // 'default' | 'card' | 'text'
  lines = 1,
}: {
  className?: string;
  width?: string; // Tailwind width class e.g., 'w-32' or 'w-full'
  height?: string; // Tailwind height class e.g., 'h-4', 'h-6'
  variant?: 'default' | 'card' | 'text';
  lines?: number;
}) => {
  if (variant === 'card') {
    // Card variant: a single rectangular block
    return (
      <div
        className={cn(
          'bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
          width,
          height,
          className,
        )}
      />
    );
  }

  if (variant === 'text') {
    // Text variant: render multiple line skeletons stacked vertically
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
              width,
              'h-4',
            )}
          />
        ))}
      </div>
    );
  }

  // Default simple skeleton
  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-700 rounded',
        width,
        height,
        'animate-pulse',
        className,
      )}
    />
  );
};

/**
 * Skeleton variant for a text line (deprecated, kept for backward compatibility).
 */
export const SkeletonText = ({
  className = '',
  width = 'w-3/4',
  height = 'h-4',
}: {
  className?: string;
  width?: string;
  height?: string;
}) => {
  return <Skeleton className={className} width={width} height={height} />;
};

/**
 * Skeleton variant for rectangular cards (deprecated, kept for backward compatibility).
 */
export const SkeletonCard = ({
  className = '',
  width = 'w-full',
  height = 'h-32',
}: {
  className?: string;
  width?: string;
  height?: string;
}) => {
  return <Skeleton className={className} width={width} height={height} variant="card" />;
};
