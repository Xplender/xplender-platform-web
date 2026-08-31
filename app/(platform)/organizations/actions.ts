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

export async function listOrganizations() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) await handleError(res, "Error al cargar organizaciones");
  return res.json();
}

export async function createOrganization(name: string, slug: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/organizations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, slug }),
  });
  if (!res.ok) await handleError(res, "Error al crear organización");
  revalidatePath("/organizations");
  return res.json();
}

export async function getOrganization(id: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/organizations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) await handleError(res, "Error al cargar organización");
  return res.json();
}

export async function inviteOrgMember(
  orgId: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    orgRole: string;
  }
): Promise<{ success: true } | { success: false; error: string }> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/organizations/${orgId}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || undefined,
      orgRole: data.orgRole,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return { success: false, error: err.message ?? "Error al invitar miembro" };
  }
  revalidatePath(`/organizations/${orgId}`);
  return { success: true };
}

export async function addMember(orgId: string, userId: string, role: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/organizations/${orgId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, role }),
  });
  if (!res.ok) await handleError(res, "Error al añadir miembro");
  revalidatePath(`/organizations/${orgId}`);
}

export async function removeMember(orgId: string, userId: string) {
  const token = await getToken();
  const res = await fetch(
    `${API_URL}/api/v1/organizations/${orgId}/members/${userId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) await handleError(res, "Error al eliminar miembro");
  revalidatePath(`/organizations/${orgId}`);
}

export async function listPlatformUsers() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) await handleError(res, "Error al cargar usuarios");
  return res.json();
}

export async function getDashboardStats() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/organizations/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) await handleError(res, "Error al cargar estadísticas");
  return res.json() as Promise<{ totalOrgs: number; activeOrgs: number; totalUsers: number }>;
}

export async function addProduct(
  orgId: string,
  productId: string,
  planId: string | null,
  trialDays: number | null
) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1/organizations/${orgId}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      planId: planId || null,
      trialDays: trialDays || null,
    }),
  });
  if (!res.ok) await handleError(res, "Error al añadir producto");
  revalidatePath(`/organizations/${orgId}`);
  return res.json();
}

export async function removeProduct(orgId: string, productId: string) {
  const token = await getToken();
  const res = await fetch(
    `${API_URL}/api/v1/organizations/${orgId}/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) await handleError(res, "Error al eliminar producto");
  revalidatePath(`/organizations/${orgId}`);
}

export async function listAllOrgProducts() {
  const token = await getToken();
  const orgsRes = await fetch(`${API_URL}/api/v1/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!orgsRes.ok) await handleError(orgsRes, "Error al cargar organizaciones");
  const orgs: { id: string; name: string }[] = await orgsRes.json();

  const details = await Promise.all(
    orgs.map((org) =>
      fetch(`${API_URL}/api/v1/organizations/${org.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  );

  return details.filter(Boolean) as Array<{
    id: string;
    name: string;
    slug: string;
    products: Array<{ id: string; productId: string; planId: string | null; status: string }>;
  }>;
}

export async function updateProductStatus(orgId: string, productId: string, status: string) {
  const token = await getToken();
  const res = await fetch(
    `${API_URL}/api/v1/organizations/${orgId}/products/${encodeURIComponent(productId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) await handleError(res, "Error al actualizar estado del producto");
  revalidatePath(`/organizations/${orgId}`);
}

export async function updateStatus(orgId: string, status: string) {
  const token = await getToken();
  const res = await fetch(
    `${API_URL}/api/v1/organizations/${orgId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) await handleError(res, "Error al actualizar estado");
  revalidatePath(`/organizations/${orgId}`);
}
