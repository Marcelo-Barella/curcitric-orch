import { z } from "zod";
import { uuid } from "./run.js";

export const OrgMemberRole = z.enum(["owner", "admin", "member"]);
export type OrgMemberRole = z.infer<typeof OrgMemberRole>;

export const OrganizationSchema = z.object({
  id: uuid,
  slug: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
