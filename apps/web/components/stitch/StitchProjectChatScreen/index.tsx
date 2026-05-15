// STITCH_MCP_PLACEHOLDER: This component must be regenerated via Stitch MCP before production.
// Stitch prompt: "Three-pane project chat interface for an orchestration platform. Left pane:
// chat/run history list. Middle pane: message composer with run detail cards showing status badges.
// Right pane: orchestration sidebar with live task tree, agent status indicators, and realtime log
// stream. Slate + citric palette. data-testid attributes on each pane root."
// Design tokens: curcitric-orch SaaS orchestration dashboard, slate + citric accent color palette,
// modern minimal UI, dark mode support.

"use client";

interface StitchProjectChatScreenProps {
  orgSlug: string;
  projectId: string;
}

const PLACEHOLDER_HISTORY = [
  { id: "run-101", label: "deploy v2.4.0", status: "completed" },
  { id: "run-100", label: "integration tests", status: "failed" },
  { id: "run-99", label: "lint + typecheck", status: "completed" },
  { id: "run-98", label: "seed staging db", status: "completed" },
];

const PLACEHOLDER_TASKS = [
  { id: "t-1", name: "supabase-middleware", agent: "agent-a", status: "completed" },
  { id: "t-2", name: "stitch-screens", agent: "agent-b", status: "running" },
  { id: "t-3", name: "api-routes", agent: "agent-c", status: "pending" },
  { id: "t-4", name: "e2e-tests", agent: null, status: "pending" },
];

const TASK_STATUS_STYLES: Record<string, string> = {
  completed: "text-[#c8e64c]",
  running: "text-blue-400",
  failed: "text-red-400",
  pending: "text-slate-500",
};

export function StitchProjectChatScreen({
  orgSlug,
  projectId,
}: StitchProjectChatScreenProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-px overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      {/* Left pane: run history */}
      <aside
        data-testid="pane-history"
        className="flex w-64 shrink-0 flex-col border-r border-slate-700 bg-slate-800/50"
      >
        <div className="border-b border-slate-700 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Run History
          </h2>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {PLACEHOLDER_HISTORY.map((run) => (
            <li
              key={run.id}
              className="flex items-center gap-2 border-b border-slate-700/40 px-4 py-3 hover:bg-slate-700/30"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  run.status === "completed" ? "bg-[#c8e64c]" : "bg-red-500"
                }`}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">{run.label}</p>
                <p className="text-xs text-slate-500">{run.id}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Middle pane: chat / messages */}
      <main
        data-testid="pane-chat"
        className="flex flex-1 flex-col bg-slate-950"
      >
        <div className="border-b border-slate-700 px-6 py-3">
          <h2 className="text-sm font-semibold text-slate-200">
            {orgSlug} / {projectId}
          </h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#c8e64c] px-2.5 py-0.5 text-xs font-semibold text-slate-950">
                completed
              </span>
              <span className="text-sm font-medium text-slate-200">deploy v2.4.0</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              All 4 tasks completed successfully. Deployed to production.
            </p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                running
              </span>
              <span className="text-sm font-medium text-slate-200">integration tests</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              2 of 4 tasks complete. Waiting on agent-b.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Send a message or command..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-[#c8e64c]/50"
            />
            <button className="rounded-lg bg-[#c8e64c] px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d4ef5a]">
              Send
            </button>
          </div>
        </div>
      </main>

      {/* Right pane: orchestration sidebar */}
      <aside
        data-testid="pane-orchestration"
        className="flex w-72 shrink-0 flex-col border-l border-slate-700 bg-slate-800/50"
      >
        <div className="border-b border-slate-700 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Task Tree
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-3">
            {PLACEHOLDER_TASKS.map((task) => (
              <li key={task.id} className="rounded-lg bg-slate-900/60 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">{task.name}</span>
                  <span className={`text-xs font-medium ${TASK_STATUS_STYLES[task.status]}`}>
                    {task.status}
                  </span>
                </div>
                {task.agent && (
                  <p className="mt-1 text-xs text-slate-500">{task.agent}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-700 px-4 py-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live Logs
          </h3>
          <div className="h-32 overflow-y-auto rounded-lg bg-slate-950 p-2 font-mono text-xs text-slate-400">
            <p>[15:04:12] agent-b: generating stitch screens...</p>
            <p>[15:04:08] agent-a: middleware committed</p>
            <p>[15:03:55] orchestrator: task graph resolved</p>
            <p className="text-[#c8e64c]">[15:03:50] run started</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
