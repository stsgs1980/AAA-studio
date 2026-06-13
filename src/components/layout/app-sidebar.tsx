"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Workflow, Layers, Bot, Network,
  GitBranch, Sparkles, BookOpen, Wrench, Shield,
  ScrollText, Settings, PanelLeftClose, PanelLeft, FileText,
  Moon, Sun, Cpu, ClipboardCheck, ListTodo, ArrowLeftRight, RefreshCw,
  FlaskConical,
} from "lucide-react";
import { cn } from "@stsgs/ui";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Flow Editor", href: "/editor", icon: Workflow },
  { title: "Templates", href: "/templates", icon: Layers },
  { title: "Tasks", href: "/tasks", icon: ListTodo },
  { title: "Workflows", href: "/workflows", icon: ArrowLeftRight },
  { title: "Agents", href: "/agents", icon: Bot },
  { title: "Agent Creator", href: "/agent-creator", icon: Cpu },
  { title: "Quality Analyzer", href: "/quality-analyzer", icon: ClipboardCheck },
  { title: "Hierarchy", href: "/hierarchy", icon: Network },
  { title: "Pipelines", href: "/pipelines", icon: GitBranch },
  { title: "Self-Correction", href: "/self-correction", icon: RefreshCw },
  { title: "Prompt Studio", href: "/prompt-studio", icon: Sparkles },
  { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { title: "Skill Forge", href: "/skills-page", icon: Wrench },
  { title: "Standards", href: "/standards", icon: Shield },
  { title: "Testing", href: "/testing", icon: FlaskConical },
  { title: "Audit Log", href: "/audit", icon: ScrollText },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted ? theme === "dark" : true;

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
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">1.5.21</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto rounded-md p-1.5 hover:bg-accent",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const label = t.nav[item.title] ?? item.title;
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
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Wiki Link */}
      <div className="border-t px-2 py-2">
        <Link
          href="/wiki"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
            collapsed && "justify-center"
          )}
          title="Wiki"
        >
          <FileText className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t.nav.Wiki}</span>}
        </Link>
      </div>

      {/* Footer -- Theme toggle */}
      <div className={cn("border-t px-2 py-2", collapsed && "flex flex-col items-center gap-1")}>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={isDark ? t.common['Switch to light'] : t.common['Switch to dark']}
        >
          {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>{isDark ? t.common['Light Mode'] : t.common['Dark Mode']}</span>}
        </button>
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground px-2">
            Artificial. Agentic. Architecture.
          </p>
        )}
      </div>
    </aside>
  );
}
