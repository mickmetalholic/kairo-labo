import type * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-white/10 bg-[#0b1620]/72 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}
