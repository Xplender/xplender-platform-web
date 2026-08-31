"use server";

import { listAllOrgProducts } from "@/app/(platform)/organizations/actions";

const QRMENU_API_URL = process.env.QRMENU_API_URL ?? "";
const QRMENU_PLATFORM_API_KEY = process.env.QRMENU_PLATFORM_API_KEY ?? "";

export type QrMenuRestaurant = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  planId: string | null;
  status: string;
};

export async function listQrMenuRestaurants(): Promise<QrMenuRestaurant[]> {
  const orgs = await listAllOrgProducts();
  const restaurants: QrMenuRestaurant[] = [];

  for (const org of orgs) {
    const product = org.products.find((p) => p.productId === "qr-menu");
    if (product) {
      restaurants.push({
        orgId: org.id,
        orgName: org.name,
        orgSlug: org.slug,
        planId: product.planId,
        status: product.status,
      });
    }
  }

  return restaurants.sort((a, b) => {
    const order = { active: 0, trial: 1, suspended: 2 };
    return (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3);
  });
}

export async function getAdminSessionUrl(orgId: string): Promise<string> {
  if (!QRMENU_API_URL) {
    throw new Error("QR Menu API no está configurada.");
  }

  const res = await fetch(
    `${QRMENU_API_URL}/platform/restaurants/${orgId}/session`,
    {
      method: "POST",
      headers: {
        "Platform-Api-Key": QRMENU_PLATFORM_API_KEY,
      },
    }
  );

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "Error al generar sesión de administrador.");
  }

  const data = (await res.json()) as { adminUrl: string };

  // Validar que la URL de redirect pertenezca al mismo host que QRMENU_API_URL
  // para evitar open redirect si el backend fuera comprometido.
  const allowedHost = new URL(QRMENU_API_URL).hostname;
  const returnedHost = new URL(data.adminUrl).hostname;
  if (returnedHost !== allowedHost) {
    throw new Error("URL de sesión inválida.");
  }

  return data.adminUrl;
}

