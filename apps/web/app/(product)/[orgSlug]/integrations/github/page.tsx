import { StitchGitHubInstallationScreen } from "@/components/stitch/StitchGitHubInstallationScreen";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <StitchGitHubInstallationScreen orgSlug={orgSlug} />;
}
