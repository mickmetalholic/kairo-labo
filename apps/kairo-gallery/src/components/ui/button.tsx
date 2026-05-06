import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42d9ee] disabled:pointer-events-none disabled:cursor-default disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#42d9ee] text-[#041016] shadow-[0_0_34px_rgba(66,217,238,0.32)] hover:bg-[#83f0f8]',
        ghost:
          'border border-white/12 bg-white/[0.04] text-slate-100 hover:border-[#42d9ee]/60 hover:bg-[#42d9ee]/10',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: ButtonProps): React.ReactNode {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}
