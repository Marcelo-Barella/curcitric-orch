// STITCH_MCP_PLACEHOLDER: This component must be regenerated via Stitch MCP before production.
// Stitch prompt: "Project list page with cards showing project name, last run status, and creation
// date. New project button. Slate + citric palette."
// Design tokens: curcitric-orch SaaS orchestration dashboard, slate + citric accent color palette,
// modern minimal UI, dark mode support.

interface StitchProjectListScreenProps {
  orgSlug: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-[#c8e64c]/10 text-[#c8e64c]",
  running: "bg-blue-500/10 text-blue-400",
  failed: "bg-red-500/10 text-red-400",
};

const PLACEHOLDER_PROJECTS = [
  { id: "proj-1", name: "web-platform", lastRunStatus: "completed", createdAt: "2026-03-15" },
  { id: "proj-2", name: "api-services", lastRunStatus: "running", createdAt: "2026-04-02" },
  { id: "proj-3", name: "mobile-app", lastRunStatus: "failed", createdAt: "2026-04-20" },
  { id: "proj-4", name: "shared-packages", lastRunStatus: "completed", createdAt: "2026-05-01" },
];

export function StitchProjectListScreen({ orgSlug }: StitchProjectListScreenProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="mt-1 text-sm text-slate-400">
            All projects in <span className="text-slate-200">{orgSlug}</span>
          </p>
        </div>
        <button className="rounded-xl bg-[#c8e64c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d4ef5a]">
          New Project
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_PROJECTS.map((project) => (
          <a
            key={project.id}
            href={`/${orgSlug}/projects/${project.id}`}
            className="group rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-colors hover:border-[#c8e64c]/30 hover:bg-slate-800"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-slate-200 group-hover:text-[#c8e64c]">
                {project.name}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[project.lastRunStatus] ?? "bg-slate-700 text-slate-400"}`}
              >
                {project.lastRunStatus}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Created {project.createdAt}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
