// STITCH_MCP_PLACEHOLDER: This component must be regenerated via Stitch MCP before production.
// Stitch prompt: "Landing page with sign-in for a SaaS orchestration platform called Curcitric.
// Slate background, citric green accents. Hero section with tagline, Supabase OAuth sign-in button
// (GitHub provider), feature highlights."
// Design tokens: curcitric-orch SaaS orchestration dashboard, slate + citric accent color palette,
// modern minimal UI, dark mode support.

"use client";

import { createCurcitricSupabaseBrowser } from "@/lib/supabase/browser-client";

function handleGitHubSignIn() {
  const supabase = createCurcitricSupabaseBrowser();
  supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

const FEATURES = [
  {
    title: "Multi-Agent Orchestration",
    description:
      "Coordinate autonomous agents across repositories with dependency-aware task graphs.",
  },
  {
    title: "Real-Time Observability",
    description:
      "Stream logs, track status badges, and inspect agent decisions as they happen.",
  },
  {
    title: "Secure Secret Profiles",
    description:
      "Encrypted credential vaults injected at runtime, scoped per org and project.",
  },
] as const;

export function StitchLandingSignInScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-[#c8e64c]">Curcitric</span>
        </span>
        <button
          onClick={handleGitHubSignIn}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
        >
          Sign in
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Orchestrate agents.{" "}
          <span className="text-[#c8e64c]">Ship faster.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-slate-400">
          Curcitric is the SaaS platform for multi-agent orchestration. Define
          task graphs, assign autonomous workers, and watch your pipeline
          converge in real time.
        </p>

        <button
          onClick={handleGitHubSignIn}
          className="mt-10 flex items-center gap-3 rounded-xl bg-[#c8e64c] px-6 py-3 text-base font-semibold text-slate-950 transition-colors hover:bg-[#d4ef5a]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.13-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.2.67.79.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z" />
          </svg>
          Continue with GitHub
        </button>
      </main>

      <section className="border-t border-slate-800 bg-slate-900 px-8 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="text-lg font-semibold text-[#c8e64c]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 px-8 py-6 text-center text-xs text-slate-500">
        Curcitric {new Date().getFullYear()}
      </footer>
    </div>
  );
}
