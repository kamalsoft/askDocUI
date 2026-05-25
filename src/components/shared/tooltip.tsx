'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  className,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          className={cn(
            "z-50 overflow-hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-50 shadow-md animate-in fade-in zoom-in-95 dark:bg-slate-50 dark:text-slate-900",
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-slate-900 dark:fill-slate-50" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}