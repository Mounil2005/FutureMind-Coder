import {
  LayoutDashboard,
  CalendarRange,
  Target,
  NotebookPen,
  Boxes,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  hint?: string;
}

export const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/activity", label: "Activity", icon: CalendarRange, hint: "Heatmap" },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/platforms", label: "Platforms", icon: Boxes },
];

export const secondaryNav: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];
