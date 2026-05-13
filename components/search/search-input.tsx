"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { SearchFilters } from "./search-filters";
import { SearchResultRow } from "./search-result-row";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSearchPeople } from "@/hooks/use-search-people";
import { db } from "@/lib/db/db";
import { topTags, type ClosenessFilter } from "@/lib/search";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 8;

export function SearchInput() {
  const [query, setQuery] = React.useState("");
  const [closeness, setCloseness] = React.useState<ClosenessFilter>("all");
  const [tags, setTags] = React.useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const debouncedQuery = useDebouncedValue(query, 250);
  const results = useSearchPeople(debouncedQuery, closeness, tags);

  const allPeople = useLiveQuery(() => db.people.toArray(), []);
  const tagOptions = React.useMemo(
    () => (allPeople ? topTags(allPeople, 8) : []),
    [allPeople],
  );

  const visible = results?.slice(0, MAX_RESULTS) ?? [];
  const overflow = (results?.length ?? 0) - visible.length;

  const popoverOpen =
    focused &&
    (debouncedQuery.trim() !== "" || closeness !== "all" || tags.length > 0);

  const handleSelect = () => {
    setMobileOpen(false);
    setFocused(false);
    setQuery("");
  };

  const inputEl = (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search people"
        aria-label="Search people"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        className="pl-8"
      />
    </div>
  );

  return (
    <>
      {/* Mobile trigger: icon button toggles an expanded input below the TopBar */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open search"
        onClick={() => setMobileOpen((o) => !o)}
        className="md:hidden"
      >
        {mobileOpen ? <X className="size-5" /> : <Search className="size-5" />}
      </Button>

      {/* Desktop persistent input */}
      <div className="hidden flex-1 md:block">
        <Popover open={popoverOpen}>
          <PopoverAnchor asChild>
            <div className="max-w-md">{inputEl}</div>
          </PopoverAnchor>
          <PopoverContent
            align="start"
            sideOffset={6}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="w-[min(28rem,90vw)] p-0"
          >
            <SearchFilters
              closeness={closeness}
              onClosenessChange={setCloseness}
              selectedTags={tags}
              onTagsChange={setTags}
              availableTags={tagOptions}
            />
            <SearchResults
              results={visible}
              overflow={overflow}
              loading={results === undefined}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile expanded input */}
      <div
        className={cn(
          "absolute left-0 right-0 top-14 z-30 border-b bg-background px-4 py-2 transition-all md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        {inputEl}
        {(debouncedQuery.trim() !== "" ||
          closeness !== "all" ||
          tags.length > 0) && (
          <div className="mt-2 max-h-[60vh] overflow-y-auto rounded-md border bg-popover">
            <SearchFilters
              closeness={closeness}
              onClosenessChange={setCloseness}
              selectedTags={tags}
              onTagsChange={setTags}
              availableTags={tagOptions}
            />
            <SearchResults
              results={visible}
              overflow={overflow}
              loading={results === undefined}
              onSelect={handleSelect}
            />
          </div>
        )}
      </div>
    </>
  );
}

function SearchResults({
  results,
  overflow,
  loading,
  onSelect,
}: {
  results: ReturnType<typeof useSearchPeople> extends infer R
    ? R extends undefined
      ? never
      : Exclude<R, undefined>
    : never;
  overflow: number;
  loading: boolean;
  onSelect: () => void;
}) {
  if (loading) {
    return (
      <p className="px-3 py-4 text-[13px] text-muted-foreground">Searching…</p>
    );
  }
  if (!results || results.length === 0) {
    return (
      <p
        aria-live="polite"
        className="px-3 py-4 text-[13px] text-muted-foreground"
      >
        No matches. Try a shorter query or drop a tag.
      </p>
    );
  }
  return (
    <div className="max-h-80 overflow-y-auto py-1">
      <p className="px-3 pt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        Results ({results.length})
      </p>
      {results.map((person) => (
        <SearchResultRow
          key={person.id}
          person={person}
          onSelect={onSelect}
        />
      ))}
      {overflow > 0 && (
        <p className="px-3 py-2 text-[12px] text-muted-foreground">
          +{overflow} more — refine your query
        </p>
      )}
    </div>
  );
}
