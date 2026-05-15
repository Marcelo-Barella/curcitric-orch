// STITCH_MCP_PLACEHOLDER: This component must be regenerated via Stitch MCP before production.
// Stitch prompt: "Organization dashboard showing recent orchestration runs, team members count,
// project list summary, and quick-action cards. Slate + citric palette. Responsive grid layout."
// Design tokens: curcitric-orch SaaS orchestration dashboard, slate + citric accent color palette,
// modern minimal UI, dark mode support.

interface StitchOrgDashboardScreenProps {
  orgSlug: string;
}

const PLACEHOLDER_RUNS = [
  { id: "run-1", name: "deploy-pipeline", status: "completed", ts: "2 min ago" },
  { id: "run-2", name: "test-suite-all", status: "running", ts: "8 min ago" },
  { id: "run-3", name: "lint-and-format", status: "failed", ts: "1 hr ago" },
];

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-[#c8e64c] text-slate-950",
  running: "bg-blue-500 text-white",
  failed: "bg-red-500 text-white",
};

export function StitchOrgDashboardScreen({ orgSlug }: StitchOrgDashboardScreenProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          {orgSlug} <span className="text-slate-500 font-normal">Dashboard</span>
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Runs", value: "142" },
          { label: "Active Agents", value: "7" },
          { label: "Projects", value: "5" },
          { label: "Team Members", value: "12" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-5"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-[#c8e64c]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Recent Runs</h2>
          <div className="space-y-3">
            {PLACEHOLDER_RUNS.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-lg bg-slate-900/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-200">{run.name}</p>
                  <p className="text-xs text-slate-500">{run.ts}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_COLORS[run.status] ?? "bg-slate-600 text-slate-300"}`}
                >
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-200">Quick Actions</h2>
            <div className="space-y-2">
              {["New Project", "Invite Member", "View Integrations"].map((action) => (
                <button
                  key={action}
                  className="w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
