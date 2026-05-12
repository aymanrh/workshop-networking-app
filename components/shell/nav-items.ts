import { Calendar, Home, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/", label: "Home", icon: Home },
  { href: "/people", label: "People", icon: Users },
  { href: "/events", label: "Events", icon: Calendar },
];

export function isActive(itemHref: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (itemHref === "/") return pathname === "/" || pathname === "";
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}
