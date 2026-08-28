import { getOrganization, listPlatformUsers } from "../actions";
import { OrgDetailClient } from "./OrgDetailClient";

// Re-throws Next.js internal errors (redirects, etc.), returns null for real API errors
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

  const [org, allUsers] = await Promise.all([
    safeGet(() => getOrganization(id)),
    safeGet(() => listPlatformUsers()).then((r) => r ?? []),
  ]);

  return <OrgDetailClient org={org} allUsers={allUsers} />;
}
