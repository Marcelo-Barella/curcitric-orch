// STITCH_MCP_PLACEHOLDER: This component must be regenerated via Stitch MCP before production.
// Stitch prompt: "App shell layout with top navigation bar (org switcher, user avatar menu), left
// sidebar (nav links: Dashboard, Projects, Integrations, Secrets), and main content area. Slate +
// citric palette. Responsive with collapsible sidebar on mobile."
// Design tokens: curcitric-orch SaaS orchestration dashboard, slate + citric accent color palette,
// modern minimal UI, dark mode support.

"use client";

import { useState, type ReactNode } from "react";

interface AppShellLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Integrations", href: "/integrations/github" },
  { label: "Secrets", href: "/me/secrets" },
] as const;

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      {/* Top navigation bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#c8e64c]">Curcitric</span>
          </span>
          {/* Org switcher */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 sm:flex">
            <span>acme-org</span>
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 ring-2 ring-slate-600" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-14 left-0 z-50 w-56 border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:z-auto lg:translate-x-0`}
        >
          <nav className="flex flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-[#c8e64c]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
