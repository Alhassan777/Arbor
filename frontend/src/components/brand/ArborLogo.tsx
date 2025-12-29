import { cn } from '../../lib/utils';

export function ArborLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Arbor logo"
    >
      {/* Outer ring - subtle */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="#2a3530"
        strokeWidth="1.5"
      />
      {/* Middle ring */}
      <circle
        cx="16"
        cy="16"
        r="9"
        stroke="#4a5854"
        strokeWidth="1.5"
      />
      {/* Inner ring - filled with primary color */}
      <circle
        cx="16"
        cy="16"
        r="4"
        fill="#2dd4a7"
      />
      {/* Branch emerging upward - growth metaphor */}
      <path
        d="M16 12V4M16 4L12 8M16 4L20 8"
        stroke="#2dd4a7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArborWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-semibold tracking-tight text-parchment', className)}>
      Arbor
    </span>
  );
}

export function ArborFullLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ArborLogo size={size} />
      <ArborWordmark className="text-xl" />
    </div>
  );
}
