"use server";

const API_URL = process.env.XPLENDER_AUTH_URL ?? "http://localhost:8080";

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error("Error al procesar la solicitud");
  }
}
