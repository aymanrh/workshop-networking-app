"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";
import { AddPersonProvider } from "@/components/people/add-person-context";
import { AddPersonSheet } from "@/components/people/add-person-sheet";
import { AddEventProvider } from "@/components/events/add-event-context";
import { AddEventSheet } from "@/components/events/add-event-sheet";
import { RouteAwareFab } from "./route-aware-triggers";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AddPersonProvider>
      <AddEventProvider>
        <div className="flex min-h-dvh bg-background text-foreground">
          <Sidebar />
          <div className="flex w-full flex-1 flex-col md:pl-64">
            <TopBar />
            <main
              className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8"
              id="main"
            >
              {children}
            </main>
            <BottomNav />
          </div>
        </div>
        <RouteAwareFab />
        <AddPersonSheet />
        <AddEventSheet />
      </AddEventProvider>
    </AddPersonProvider>
  );
}
