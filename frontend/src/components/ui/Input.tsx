import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border-2 border-branch bg-gradient-to-br from-forest-floor to-undergrowth px-4 py-3 text-sm font-medium text-parchment placeholder:text-lichen focus:outline-none focus:ring-2 focus:ring-canopy/30 focus:border-canopy focus:shadow-glow-canopy disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-lichen',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
