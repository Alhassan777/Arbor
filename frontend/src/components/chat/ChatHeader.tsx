import { useState } from 'react';
import { Pencil, Download, Trash2, MoreVertical } from 'lucide-react';
import { Input } from '../ui/Input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface ChatHeaderProps {
  title: string;
  breadcrumb: string[];
  onTitleUpdate: (newTitle: string) => void;
  onExportJSON: () => void;
  onExportMarkdown: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export default function ChatHeader({
  title,
  breadcrumb,
  onTitleUpdate,
  onExportJSON,
  onExportMarkdown,
  onDelete,
  canDelete,
}: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onTitleUpdate(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-forest-floor to-midnight-soil border-b border-branch px-6 py-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <Input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 text-xl font-bold"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <h1 className="text-2xl font-bold text-parchment tracking-tight">
              {title}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1.5 bg-canopy/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Pencil className="h-4 w-4 text-canopy" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Edit title</TooltipContent>
            </Tooltip>
          </div>
        )}

        {!isEditing && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-2.5 hover:bg-undergrowth rounded-xl transition-all duration-300 active:scale-95 group">
                <MoreVertical className="h-5 w-5 text-birch group-hover:text-canopy transition-colors" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-gradient-to-br from-forest-floor to-undergrowth border-2 border-branch rounded-2xl shadow-dappled p-2 z-50 animate-slide-up"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-parchment hover:bg-canopy/10 rounded-xl cursor-pointer outline-none transition-all duration-300"
                  onSelect={onExportJSON}
                >
                  <Download className="h-4 w-4 text-canopy" />
                  Export as JSON
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-parchment hover:bg-canopy/10 rounded-xl cursor-pointer outline-none transition-all duration-300"
                  onSelect={onExportMarkdown}
                >
                  <Download className="h-4 w-4 text-canopy" />
                  Export as Markdown
                </DropdownMenu.Item>
                {canDelete && (
                  <>
                    <DropdownMenu.Separator className="h-px bg-branch my-2" />
                    <DropdownMenu.Item
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-berry hover:bg-berry/10 rounded-xl cursor-pointer outline-none transition-all duration-300"
                      onSelect={onDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete conversation
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-birch">
          {breadcrumb.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-lichen">/</span>}
              <span className="hover:text-canopy cursor-pointer transition-colors px-2 py-1 hover:bg-canopy/10 rounded-lg">
                {crumb}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
