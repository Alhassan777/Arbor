import { Search } from "lucide-react";
import { Input } from "../ui/Input";

interface TreeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TreeSearch({ value, onChange }: TreeSearchProps) {
  return (
    <div className="px-5 py-4 border-b border-border/80 bg-forest-floor">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-9 text-sm bg-undergrowth/60 border-branch/80 placeholder:text-text-muted focus-visible:ring-canopy/40"
        />
      </div>
    </div>
  );
}
