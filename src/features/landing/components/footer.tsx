import { Cpu } from "lucide-react";

const footerLinks = [
  { label: "Documentation", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Discord", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-midnight-border/40 bg-midnight-base py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-4 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent">
            <Cpu className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary">3A Studio</span>
        </div>

        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-text-muted">
          &copy; 2025 3A Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
