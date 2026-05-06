import type * as React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-[#42d9ee]/20 bg-[#42d9ee]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#a8f4fb]',
        className,
      )}
      {...props}
    />
  );
}
