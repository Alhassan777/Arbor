import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch } from 'lucide-react';

interface SelectionBranchButtonProps {
  position: { x: number; y: number };
  onBranch: () => void;
  onClose: () => void;
}

export default function SelectionBranchButton({
  position,
  onBranch,
  onClose,
}: SelectionBranchButtonProps) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.selection-branch-button')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onBranch}
        className="selection-branch-button fixed bg-primary text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg hover:bg-primary-hover transition-all z-50 flex items-center gap-2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <GitBranch className="h-4 w-4" />
        Branch from selection
      </motion.button>
    </AnimatePresence>
  );
}
