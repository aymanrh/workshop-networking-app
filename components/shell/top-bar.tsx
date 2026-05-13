"use client";

import { ThemeToggle } from "@/components/shell/theme-toggle";
import { RouteAwareAddButton } from "./route-aware-triggers";
import { SearchInput } from "@/components/search/search-input";
import { HeaderMenu } from "./header-menu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-8">
      <div className="shrink-0 text-sm font-semibold tracking-tight md:hidden">
        Networking App
      </div>
      <div className="hidden flex-1 md:block">
        <SearchInput />
      </div>
      <div className="flex flex-1 items-center justify-end gap-1 md:hidden">
        <SearchInput />
        <HeaderMenu />
        <ThemeToggle />
      </div>
      <div className="hidden items-center gap-1 md:flex">
        <RouteAwareAddButton />
        <HeaderMenu />
      </div>
    </header>
  );
}
