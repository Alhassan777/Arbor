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
    <div className="bg-forest-floor border-b border-branch px-6 py-4">
      <div className="flex items-center justify-between mb-2">
        {isEditing ? (
          <Input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 text-xl font-semibold"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <h1 className="text-xl font-semibold text-parchment">
              {title}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Pencil className="h-4 w-4 text-lichen opacity-0 group-hover:opacity-100 transition-opacity" />
              </TooltipTrigger>
              <TooltipContent>Edit title</TooltipContent>
            </Tooltip>
          </div>
        )}

        {!isEditing && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-2 hover:bg-undergrowth rounded-organic-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-birch" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-forest-floor border border-branch rounded-organic-lg shadow-dappled p-1 z-50"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-parchment hover:bg-undergrowth rounded-organic cursor-pointer outline-none"
                  onSelect={onExportJSON}
                >
                  <Download className="h-4 w-4" />
                  Export as JSON
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-parchment hover:bg-undergrowth rounded-organic cursor-pointer outline-none"
                  onSelect={onExportMarkdown}
                >
                  <Download className="h-4 w-4" />
                  Export as Markdown
                </DropdownMenu.Item>
                {canDelete && (
                  <>
                    <DropdownMenu.Separator className="h-px bg-branch my-1" />
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-berry hover:bg-berry/10 rounded-organic cursor-pointer outline-none"
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
        <div className="flex items-center gap-2 text-sm text-birch">
          {breadcrumb.map((crumb, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-1">&gt;</span>}
              <span className="hover:text-canopy cursor-pointer transition-colors">
                {crumb}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
