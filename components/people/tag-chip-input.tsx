"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTagSuggestions } from "@/hooks/use-tag-suggestions";
import { normalizeTag } from "@/lib/tags";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
};

export function TagChipInput({
  value,
  onChange,
  placeholder = "Type a tag and press Enter",
  id,
}: Props) {
  const [input, setInput] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const suggestions = useTagSuggestions(input, 5, value) ?? [];
  const trimmed = input.trim();
  const showCreate =
    trimmed !== "" &&
    !suggestions.some((t) => t === normalizeTag(trimmed)) &&
    !value.includes(normalizeTag(trimmed));

  const commit = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t || value.includes(t)) {
      setInput("");
      return;
    }
    onChange([...value, t]);
    setInput("");
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      if (input.trim()) {
        e.preventDefault();
        commit(input);
      }
      return;
    }
    if (e.key === "Tab" && input.trim()) {
      e.preventDefault();
      commit(input);
      return;
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      e.preventDefault();
      removeAt(value.length - 1);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-sm",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((tag, idx) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(idx);
                }}
                className="rounded-sm hover:bg-foreground/10"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            id={id}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[8ch] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Tags"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[--radix-popover-anchor-width] p-0"
      >
        <Command shouldFilter={false}>
          <CommandList>
            {suggestions.length === 0 && !showCreate && (
              <CommandEmpty>
                {trimmed
                  ? "No matching tags — press Enter to create"
                  : "Type to search existing tags"}
              </CommandEmpty>
            )}
            {suggestions.length > 0 && (
              <CommandGroup heading="Existing tags">
                {suggestions.map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => {
                      commit(tag);
                      inputRef.current?.focus();
                    }}
                  >
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showCreate && (
              <CommandGroup>
                <CommandItem
                  value={`__create__${trimmed}`}
                  onSelect={() => {
                    commit(trimmed);
                    inputRef.current?.focus();
                  }}
                >
                  Create &quot;{normalizeTag(trimmed)}&quot;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
