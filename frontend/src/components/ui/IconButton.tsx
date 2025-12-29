import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
}

export default function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      className={cn(
        'p-2.5 rounded-organic-lg bg-forest-floor/90 backdrop-blur-sm',
        'shadow-sm hover:shadow-md hover:scale-110',
        'transition-all duration-200',
        'border border-branch text-birch hover:text-parchment hover:bg-undergrowth',
        className
      )}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}

export { IconButton };
