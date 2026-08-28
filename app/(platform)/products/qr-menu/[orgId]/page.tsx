import { redirect } from "next/navigation";
import { getAdminSessionUrl } from "../actions";

export default async function QrMenuRestaurantPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const adminUrl = await getAdminSessionUrl(orgId);
  redirect(adminUrl);
}
