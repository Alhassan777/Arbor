import { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, MessageSquare, Plus, Settings, Sparkles } from 'lucide-react';
import { useConversationStore } from '../store/conversationStore';
import { cn } from '../lib/utils';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export default function CommandPalette({
  open,
  onOpenChange,
  onNewChat,
  onOpenSettings,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { tree, setCurrentNode } = useConversationStore();

  // Build commands
  const commands: Command[] = useMemo(() => {
    const baseCommands: Command[] = [
      {
        id: 'new-chat',
        label: 'New Conversation',
        icon: <Plus className="h-4 w-4" />,
        action: () => {
          onNewChat();
          onOpenChange(false);
        },
        keywords: ['new', 'create', 'chat', 'conversation'],
      },
      {
        id: 'settings',
        label: 'Open Settings',
        icon: <Settings className="h-4 w-4" />,
        action: () => {
          onOpenSettings();
          onOpenChange(false);
        },
        keywords: ['settings', 'preferences', 'config'],
      },
    ];

    // Add conversation nodes as commands
    if (tree) {
      const nodeCommands: Command[] = Object.values(tree.nodes).map((node) => ({
        id: `node-${node.id}`,
        label: node.title,
        icon: node.id === tree.rootNodeId ? <Sparkles className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />,
        action: () => {
          setCurrentNode(node.id);
          onOpenChange(false);
        },
        keywords: [node.title.toLowerCase(), 'go to', 'navigate', 'open'],
      }));
      return [...baseCommands, ...nodeCommands];
    }

    return baseCommands;
  }, [tree, onNewChat, onOpenSettings, setCurrentNode, onOpenChange]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(searchLower);
      const keywordMatch = cmd.keywords?.some((kw) => kw.includes(searchLower));
      return labelMatch || keywordMatch;
    });
  }, [commands, search]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-midnight-soil/80 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-slide-up">
          <div className="bg-gradient-to-br from-forest-floor/95 to-undergrowth/95 backdrop-blur-2xl border-2 border-canopy/30 rounded-2xl shadow-glow-canopy overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-branch">
              <Search className="h-5 w-5 text-canopy" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands or conversations..."
                className="flex-1 bg-transparent text-parchment placeholder:text-lichen outline-none text-lg font-medium"
                autoFocus
              />
              <kbd className="px-2 py-1 bg-undergrowth border border-branch rounded-lg text-xs font-mono text-birch">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-birch">
                  <p className="text-sm">No commands found</p>
                </div>
              ) : (
                filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
                      index === selectedIndex
                        ? 'bg-canopy/20 text-parchment shadow-sm'
                        : 'text-birch hover:bg-undergrowth hover:text-parchment'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 p-2 rounded-lg transition-colors',
                        index === selectedIndex ? 'bg-canopy/30 text-canopy' : 'bg-undergrowth text-lichen'
                      )}
                    >
                      {cmd.icon}
                    </div>
                    <span className="flex-1 font-medium">{cmd.label}</span>
                    {index === selectedIndex && (
                      <kbd className="px-2 py-1 bg-canopy/20 border border-canopy/30 rounded-lg text-xs font-mono text-canopy">
                        ↵
                      </kbd>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-branch bg-undergrowth/30">
              <div className="flex items-center gap-4 text-xs text-birch">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-forest-floor border border-branch rounded text-xs">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-forest-floor border border-branch rounded text-xs">↵</kbd>
                  Select
                </span>
              </div>
              <span className="text-xs text-lichen">
                {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'}
              </span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
