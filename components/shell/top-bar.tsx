"use client";

import { ThemeToggle } from "@/components/shell/theme-toggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-8">
      <div className="text-sm font-semibold tracking-tight md:hidden">
        Networking App
      </div>
      <div className="hidden md:block" aria-hidden="true" />
      <div className="md:hidden">
        <ThemeToggle />
      </div>
      <div className="hidden md:block">
        {/* Slot reserved for header menu items (export/import in Phase 4). */}
      </div>
    </header>
  );
}
