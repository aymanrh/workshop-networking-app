"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/db/types";

const OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "interested", label: "🤔 interested" },
  { value: "going", label: "📅 going" },
  { value: "attended", label: "✓ attended" },
];

type Props = {
  value: EventStatus;
  onChange: (next: EventStatus) => void;
  ariaLabel?: string;
};

export function StatusChip({ value, onChange, ariaLabel = "Status" }: Props) {
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

export function StatusBadge({ value }: { value: EventStatus }) {
  const opt = OPTIONS.find((o) => o.value === value);
  return (
    <Badge variant="outline" className="font-normal">
      {opt?.label ?? value}
    </Badge>
  );
}
