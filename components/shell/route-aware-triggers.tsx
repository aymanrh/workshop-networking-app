"use client";

import { usePathname } from "next/navigation";
import { AddPersonFab } from "@/components/people/add-person-fab";
import { AddPersonButton } from "@/components/people/add-person-button";
import { AddEventFab } from "@/components/events/add-event-fab";
import { AddEventButton } from "@/components/events/add-event-button";

function isEventsRoute(pathname: string | null): boolean {
  return pathname?.startsWith("/events") ?? false;
}

export function RouteAwareFab() {
  const pathname = usePathname();
  if (pathname == null) return null;
  return isEventsRoute(pathname) ? <AddEventFab /> : <AddPersonFab />;
}

export function RouteAwareAddButton() {
  const pathname = usePathname();
  if (pathname == null) return null;
  return isEventsRoute(pathname) ? <AddEventButton /> : <AddPersonButton />;
}
