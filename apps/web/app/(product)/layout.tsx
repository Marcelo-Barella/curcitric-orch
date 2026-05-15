import { AppShellLayout } from "@/components/stitch/AppShellLayout";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
