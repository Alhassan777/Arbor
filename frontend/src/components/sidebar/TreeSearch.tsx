import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface TreeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TreeSearch({ value, onChange }: TreeSearchProps) {
  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-9 text-sm"
        />
      </div>
    </div>
  );
}
