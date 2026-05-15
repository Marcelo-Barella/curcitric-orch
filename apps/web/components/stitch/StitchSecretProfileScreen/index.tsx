// STITCH_MCP_PLACEHOLDER: This component must be regenerated via Stitch MCP before production.
// Stitch prompt: "User secrets management page with list of encrypted secret profiles (label,
// created date), add-new button, and delete confirmation modal. Slate + citric palette."
// Design tokens: curcitric-orch SaaS orchestration dashboard, slate + citric accent color palette,
// modern minimal UI, dark mode support.

"use client";

import { useState } from "react";

interface SecretProfile {
  id: string;
  label: string;
  createdAt: string;
}

const PLACEHOLDER_SECRETS: SecretProfile[] = [
  { id: "sp-1", label: "Production API Keys", createdAt: "2026-04-12" },
  { id: "sp-2", label: "Staging Credentials", createdAt: "2026-03-28" },
  { id: "sp-3", label: "CI/CD Tokens", createdAt: "2026-05-01" },
];

export function StitchSecretProfileScreen() {
  const [secrets] = useState<SecretProfile[]>(PLACEHOLDER_SECRETS);
  const [deleteTarget, setDeleteTarget] = useState<SecretProfile | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Secret Profiles</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage encrypted credential vaults for your orchestration runs.
          </p>
        </div>
        <button className="rounded-xl bg-[#c8e64c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d4ef5a]">
          Add Secret Profile
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50">
        <ul className="divide-y divide-slate-700/50">
          {secrets.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-slate-200">{s.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Created {s.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#c8e64c]/10 px-3 py-0.5 text-xs font-medium text-[#c8e64c]">
                  Encrypted
                </span>
                <button
                  onClick={() => setDeleteTarget(s)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {secrets.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-slate-500">
              No secret profiles yet. Click &quot;Add Secret Profile&quot; to create one.
            </li>
          )}
        </ul>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100">Delete Secret Profile</h2>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-200">{deleteTarget.label}</span>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
