import { listOrganizations } from "./actions";
import { OrgsClient, type OrgSummary } from "./OrgsClient";

export default async function OrganizationsPage() {
  const orgs: OrgSummary[] = await listOrganizations().catch(() => []);
  return <OrgsClient orgs={orgs} />;
}
