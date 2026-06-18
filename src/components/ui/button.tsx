import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * A reusable button component following the app's premium design language.
 * Supports variants and sizes, with smooth hover and focus animations.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'default',
    size = 'default',
    className,
    ...props
  }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variantClasses: Record<ButtonVariant, string> = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus-visible:ring-blue-500',
      secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-500',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
      link: 'bg-transparent underline-offset-4 hover:underline text-blue-600 hover:bg-transparent focus-visible:ring-blue-500',
    };
    const sizeClasses: Record<ButtonSize, string> = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-11 px-6 text-lg',
      icon: 'h-10 w-10',
    };
    const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
    return (
      <button className={classes} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';
