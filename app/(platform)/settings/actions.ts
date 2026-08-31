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

export async function listRegisteredProducts() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/product-registry`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) await handleError(res, "Error al cargar productos registrados");
  return res.json();
}

export async function registerProduct(url: string, internalApiKey: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/product-registry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, internalApiKey }),
  });
  if (!res.ok) await handleError(res, "Error al registrar el producto");
  revalidatePath("/settings");
  return res.json();
}

export async function syncProduct(id: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/product-registry/${id}/sync`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await handleError(res, "Error al sincronizar el producto");
  revalidatePath("/settings");
  return res.json();
}

export async function deleteRegisteredProduct(id: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/product-registry/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await handleError(res, "Error al eliminar el producto");
  revalidatePath("/settings");
}
