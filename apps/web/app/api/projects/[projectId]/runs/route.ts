import { NextResponse } from "next/server";
import { createCurcitricSupabaseServer } from "@/lib/supabase/server-client";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const supabase = await createCurcitricSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("unauthorized", { status: 401 });

  const { data: project } = await supabase
    .from("projects")
    .select("org_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return new NextResponse("project not found", { status: 404 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", project.org_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return new NextResponse("forbidden", { status: 403 });

  const { data: inserted, error } = await supabase
    .from("orchestration_runs")
    .insert({
      project_id: projectId,
      initiating_user: user.id,
      org_id: project.org_id,
      status: "queued",
      config_snapshot: {},
    })
    .select("id")
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  if (!inserted)
    return NextResponse.json({ error: "run insert returned no row" }, { status: 500 });

  const { error: jobError } = await supabase.from("orchestration_jobs").insert({
    run_id: inserted.id,
    status: "pending",
  });

  if (jobError) {
    const { error: rollbackError } = await supabase
      .from("orchestration_runs")
      .delete()
      .eq("id", inserted.id);
    const message = rollbackError
      ? `${jobError.message}; rollback failed: ${rollbackError.message}`
      : jobError.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ runId: inserted.id });
}
