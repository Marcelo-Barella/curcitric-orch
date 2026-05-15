import { StitchProjectListScreen } from "@/components/stitch/StitchProjectListScreen";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <StitchProjectListScreen orgSlug={orgSlug} />;
}
