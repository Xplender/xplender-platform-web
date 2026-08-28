import { auth } from "@/lib/auth";
import { UsersClient, type UserRow } from "./UsersClient";

const API_URL = process.env.XPLENDER_AUTH_URL ?? "http://localhost:8080";

async function fetchUsers(token: string): Promise<UserRow[]> {
  const res = await fetch(`${API_URL}/api/v1/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function UsersPage() {
  const session = await auth();
  const token = session?.accessToken;
  const callerRole = session?.xplenderRole ?? "";

  const users = token ? await fetchUsers(token) : [];

  return <UsersClient initialUsers={users} callerRole={callerRole} />;
}
