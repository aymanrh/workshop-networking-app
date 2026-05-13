"use client";

import { cn } from "@/lib/utils";
import type { ClosenessFilter } from "@/lib/search";

const CLOSENESS_OPTIONS: { value: ClosenessFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "close", label: "★ close" },
  { value: "warm", label: "🔥 warm" },
  { value: "cooling", label: "❄ cooling" },
];

type Props = {
  closeness: ClosenessFilter;
  onClosenessChange: (next: ClosenessFilter) => void;
  selectedTags: string[];
  onTagsChange: (next: string[]) => void;
  availableTags: string[];
};

export function SearchFilters({
  closeness,
  onClosenessChange,
  selectedTags,
  onTagsChange,
  availableTags,
}: Props) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-2 border-b p-3">
      <div className="flex flex-wrap gap-1">
        {CLOSENESS_OPTIONS.map((opt) => {
          const active = opt.value === closeness;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onClosenessChange(opt.value)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[12px] transition-colors",
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-input text-muted-foreground hover:bg-muted/60",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableTags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[12px] transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-input text-muted-foreground hover:bg-muted/60",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
