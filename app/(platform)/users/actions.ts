"use server";

import { auth, signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const API_URL = process.env.XPLENDER_AUTH_URL ?? "http://localhost:8080";

async function getToken() {
  const session = await auth();
  const token = session?.accessToken;
  if (!token) await signOut({ redirectTo: "/login" });
  return token as string;
}

async function handleError(res: Response, fallback: string): Promise<never> {
  if (res.status === 401) await signOut({ redirectTo: "/login" });
  const err = (await res.json().catch(() => ({}))) as { message?: string };
  throw new Error(err.message ?? fallback);
}

export async function setUserEnabled(userId: string, enabled: boolean) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/users/${userId}/enabled`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) await handleError(res, "Error al actualizar usuario");
  revalidatePath("/users");
}

export async function createUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}): Promise<{ userId: string; invitationSent: boolean }> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleError(res, "Error al crear usuario");
  const body = (await res.json()) as { user: { id: string }; invitationSent: boolean };
  revalidatePath("/users");
  return { userId: body.user.id, invitationSent: body.invitationSent };
}

export async function resendInvitation(userId: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/users/${userId}/resend-invitation`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await handleError(res, "Error al reenviar la invitación");
}

export async function changeUserRole(userId: string, roleId: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roleId }),
  });
  if (!res.ok) await handleError(res, "Error al cambiar rol");
  revalidatePath("/users");
}
