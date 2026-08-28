"use server";

const API_URL = process.env.XPLENDER_AUTH_URL ?? "http://localhost:8080";

export async function acceptInvitation(token: string, password: string) {
  const res = await fetch(`${API_URL}/auth/accept-invitation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "Error al activar la cuenta");
  }
}
