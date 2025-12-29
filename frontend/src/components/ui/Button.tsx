import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-canopy text-midnight-soil font-medium hover:bg-canopy-light shadow-sm hover:shadow-md',
        secondary:
          'bg-undergrowth border border-branch text-parchment hover:bg-branch',
        ghost: 'bg-transparent text-birch hover:bg-undergrowth hover:text-parchment',
        link: 'text-canopy hover:text-canopy-light underline-offset-4 hover:underline',
        danger: 'bg-berry/10 text-berry border border-berry/30 hover:bg-berry/20',
      },
      size: {
        default: 'h-11 px-6 py-2.5 rounded-organic-lg',
        sm: 'h-9 px-3 text-xs rounded-organic',
        lg: 'h-12 px-8 rounded-organic-lg',
        icon: 'h-10 w-10 rounded-organic',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
