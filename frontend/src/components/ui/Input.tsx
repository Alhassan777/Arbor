import { InputHTMLAttributes, forwardRef } from 'react';
import { cn, inputStyles } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputStyles, className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
