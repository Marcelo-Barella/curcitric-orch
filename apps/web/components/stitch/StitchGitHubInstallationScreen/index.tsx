// STITCH_MCP_PLACEHOLDER: This component must be regenerated via Stitch MCP before production.
// Stitch prompt: "GitHub App installation screen showing connected repositories list, install button
// linking to GitHub App install flow, and status indicators per repo. Slate + citric palette."
// Design tokens: curcitric-orch SaaS orchestration dashboard, slate + citric accent color palette,
// modern minimal UI, dark mode support.

interface StitchGitHubInstallationScreenProps {
  orgSlug: string;
}

const PLACEHOLDER_REPOS = [
  { name: "acme/web-app", connected: true, lastSync: "3 min ago" },
  { name: "acme/api-server", connected: true, lastSync: "12 min ago" },
  { name: "acme/shared-lib", connected: false, lastSync: null },
];

export function StitchGitHubInstallationScreen({
  orgSlug,
}: StitchGitHubInstallationScreenProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">GitHub Integration</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage connected repositories for <span className="text-slate-200">{orgSlug}</span>
          </p>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8e64c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d4ef5a]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.13-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.2.67.79.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z" />
          </svg>
          Install GitHub App
        </a>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50">
        <div className="border-b border-slate-700 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Connected Repositories
          </h2>
        </div>
        <ul className="divide-y divide-slate-700/50">
          {PLACEHOLDER_REPOS.map((repo) => (
            <li key={repo.name} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${repo.connected ? "bg-[#c8e64c]" : "bg-slate-600"}`}
                />
                <span className="font-medium text-slate-200">{repo.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {repo.lastSync && (
                  <span className="text-xs text-slate-500">Synced {repo.lastSync}</span>
                )}
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                    repo.connected
                      ? "bg-[#c8e64c]/10 text-[#c8e64c]"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {repo.connected ? "Connected" : "Not connected"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
