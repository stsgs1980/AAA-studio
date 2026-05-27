"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  Layers,
  Bot,
  Network,
  GitBranch,
  Sparkles,
  BookOpen,
  Wrench,
  Shield,
  ScrollText,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@stsgs/ui";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Flow Editor", href: "/editor", icon: Workflow },
  { title: "Templates", href: "/templates", icon: Layers },
  { title: "Agents", href: "/agents", icon: Bot },
  { title: "Hierarchy", href: "/hierarchy", icon: Network },
  { title: "Pipelines", href: "/pipelines", icon: GitBranch },
  { title: "Prompt Studio", href: "/prompt-studio", icon: Sparkles },
  { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { title: "Skill Forge", href: "/skills-page", icon: Wrench },
  { title: "Standards", href: "/standards", icon: Shield },
  { title: "Audit Log", href: "/audit", icon: ScrollText },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-3">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              3A
            </div>
            <span className="font-semibold tracking-tight">Studio</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto rounded-md p-1.5 hover:bg-accent",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t px-3 py-2">
          <p className="text-[10px] text-muted-foreground">
            Artificial. Agentic. Architecture.
          </p>
          <p className="text-[10px] text-muted-foreground">v0.1.0-alpha</p>
        </div>
      )}
    </aside>
  );
}
