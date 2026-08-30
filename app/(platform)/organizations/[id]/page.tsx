import { getOrganization } from "../actions";
import { OrgDetailClient } from "./OrgDetailClient";

async function safeGet<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    const digest = (err as { digest?: string })?.digest ?? "";
    if (digest.startsWith("NEXT_")) throw err;
    return null;
  }
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await safeGet(() => getOrganization(id));
  return <OrgDetailClient org={org} />;
}
