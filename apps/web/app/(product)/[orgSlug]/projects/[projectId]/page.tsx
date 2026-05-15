import { StitchProjectChatScreen } from "@/components/stitch/StitchProjectChatScreen";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = await params;
  return <StitchProjectChatScreen orgSlug={orgSlug} projectId={projectId} />;
}
