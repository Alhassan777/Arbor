import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AppLayoutProps {
  leftSidebar: React.ReactNode;
  leftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  rightSidebar: React.ReactNode;
  rightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  children: React.ReactNode;
}

export default function AppLayout({
  leftSidebar,
  leftSidebarOpen,
  onToggleLeftSidebar,
  rightSidebar,
  rightSidebarOpen,
  onToggleRightSidebar,
  children,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <AnimatePresence initial={false}>
        {leftSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="bg-surface border-r border-border overflow-hidden"
          >
            <div className="w-[280px] h-full">{leftSidebar}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button for Left Sidebar (when collapsed) */}
      {!leftSidebarOpen && (
        <div className="w-12 bg-surface border-r border-border flex items-start justify-center pt-4">
          <button
            onClick={onToggleLeftSidebar}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            title="Expand conversation tree"
          >
            <ChevronRight className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>

      {/* Toggle Button for Right Sidebar (when collapsed) */}
      {!rightSidebarOpen && (
        <div className="w-12 bg-surface border-l border-border flex items-start justify-center pt-4">
          <button
            onClick={onToggleRightSidebar}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            title="Expand graph view"
          >
            <ChevronLeft className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
      )}

      {/* Right Sidebar */}
      <AnimatePresence initial={false}>
        {rightSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="bg-surface border-l border-border overflow-hidden"
          >
            <div className="w-[320px] h-full">{rightSidebar}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
