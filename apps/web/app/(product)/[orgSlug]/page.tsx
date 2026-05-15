import { StitchOrgDashboardScreen } from "@/components/stitch/StitchOrgDashboardScreen";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <StitchOrgDashboardScreen orgSlug={orgSlug} />;
}
