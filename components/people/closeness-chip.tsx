"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Closeness } from "@/lib/db/types";

const OPTIONS: { value: Closeness; label: string }[] = [
  { value: "close", label: "★ close" },
  { value: "warm", label: "🔥 warm" },
  { value: "cooling", label: "❄ cooling" },
];

type Props = {
  value: Closeness;
  onChange: (next: Closeness) => void;
  ariaLabel?: string;
};

export function ClosenessChip({ value, onChange, ariaLabel = "Closeness" }: Props) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % OPTIONS.length;
      refs.current[next]?.focus();
      onChange(OPTIONS[next].value);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + OPTIONS.length) % OPTIONS.length;
      refs.current[prev]?.focus();
      onChange(OPTIONS[prev].value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex h-9 items-center rounded-md border bg-background p-0.5"
    >
      {OPTIONS.map((opt, idx) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={cn(
              "h-8 rounded-sm px-3 text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted/60",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ClosenessBadge({ value }: { value: Closeness }) {
  const opt = OPTIONS.find((o) => o.value === value);
  return (
    <Badge variant="outline" className="font-normal">
      {opt?.label ?? value}
    </Badge>
  );
}
