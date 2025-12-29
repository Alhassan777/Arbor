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
        'p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
        'shadow-md hover:shadow-lg hover:scale-110',
        'transition-all duration-200',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
