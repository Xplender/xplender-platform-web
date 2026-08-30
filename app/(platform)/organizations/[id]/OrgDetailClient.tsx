"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/layout/nav-icons";
import {
  removeMember,
  removeProduct,
  updateStatus,
  updateProductStatus,
} from "../actions";
import { InviteMemberModal } from "./InviteMemberModal";
import { AddProductModal } from "./AddProductModal";

// ── Types ─────────────────────────────────────────────────────────────────────

type MemberRow = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  orgRole: string;
};

type ProductRow = {
  id: string;
  productId: string;
  planId: string | null;
  status: string;
  createdAt: string;
};

type OrgDetail = {
  id: string;
  name: string;
  slug: string;
  status: string;
  members: MemberRow[];
  products: ProductRow[];
  createdAt: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  active:    { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", dot: "#10b981", label: "Activo" },
  trial:     { color: "#3730a3", bg: "#eef2ff", border: "#c7d2fe", dot: "#6366f1", label: "Trial" },
  suspended: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Suspendido" },
};

const ORG_ROLE_MAP: Record<string, { color: string; bg: string; label: string }> = {
  owner:  { color: "#92400e", bg: "#fffbeb", label: "Owner" },
  admin:  { color: "#5b21b6", bg: "#f5f3ff", label: "Admin" },
  member: { color: "#374151", bg: "#f3f4f6", label: "Miembro" },
};

const PRODUCT_STATUS_OPTIONS = [
  { value: "active",    label: "Activo" },
  { value: "trial",     label: "Trial" },
  { value: "suspended", label: "Suspendido" },
];

const AVATAR_COLORS = [
  { bg: "#EEF2FF", color: "#4C63FC" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#ECFDF5", color: "#059669" },
  { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF1F2", color: "#E11D48" },
  { bg: "#F0F9FF", color: "#0284C7" },
];

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: status };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const r = ORG_ROLE_MAP[role] ?? { color: "#374151", bg: "#f3f4f6", label: role };
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: r.color, backgroundColor: r.bg }}
    >
      {r.label}
    </span>
  );
}

// ── Main client ───────────────────────────────────────────────────────────────

export function OrgDetailClient({ org }: { org: OrgDetail | null }) {
  if (!org) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <p className="text-sm font-semibold text-[#444A60]">Organización no encontrada</p>
        <Link href="/organizations" className="text-sm font-medium text-[#4C63FC] hover:underline">
          ← Volver a organizaciones
        </Link>
      </div>
    );
  }
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [memberModal, setMemberModal] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function mutate(fn: () => Promise<void>, success?: string) {
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
        if (success) showToast(success);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Error inesperado");
      }
    });
  }

  const createdDate = org.createdAt
    ? new Date(org.createdAt).toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    : null;

  const s = STATUS_MAP[org.status];

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-[#E2E4EC] px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#111318] leading-tight">{org.name}</h1>
          <p className="text-sm text-[#7B8099] mt-0.5">
            @{org.slug}{createdDate ? ` · Creada ${createdDate}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={org.status} />
          {org.status === "active" ? (
            <button
              onClick={() => mutate(() => updateStatus(org.id, "suspended"), "Organización suspendida")}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-[#fecaca] text-[#991b1b] rounded-xl hover:bg-[#fef2f2] transition-colors cursor-pointer"
            >
              Suspender
            </button>
          ) : (
            <button
              onClick={() => mutate(() => updateStatus(org.id, "active"), "Organización activada")}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-[#a7f3d0] text-[#065f46] rounded-xl hover:bg-[#ecfdf5] transition-colors cursor-pointer"
            >
              Activar
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-8 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#7B8099]">
          <Link
            href="/organizations"
            className="flex items-center gap-1 hover:text-[#4C63FC] transition-colors"
          >
            <ArrowRightIcon className="w-3 h-3 rotate-180" />
            Organizaciones
          </Link>
          <span className="text-[#E2E4EC]">/</span>
          <span className="text-[#111318]">{org.name}</span>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 gap-6 items-start">

          {/* Members */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest">
                Miembros
              </p>
              <button
                onClick={() => setMemberModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#E2E4EC] text-[#444A60] hover:border-[#4C63FC] hover:text-[#4C63FC] bg-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Añadir
              </button>
            </div>
            <div
              className="bg-white rounded-[14px] border border-[#E2E4EC] divide-y divide-[#F0F1F5]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {org.members.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#7B8099]">Sin miembros</p>
              ) : (
                org.members.map((m, i) => {
                  const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || "—";
                  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                  const av = avatarColor(m.userId);
                  return (
                    <div key={m.userId} className="flex items-center gap-3 px-5 py-3.5 group">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: av.bg, color: av.color }}
                      >
                        {initials || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111318] truncate">{name}</p>
                        <p className="text-xs text-[#7B8099] truncate">{m.email ?? "—"}</p>
                      </div>
                      <RoleBadge role={m.orgRole} />
                      <button
                        onClick={() => mutate(() => removeMember(org.id, m.userId), `${name} eliminado`)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] opacity-0 group-hover:opacity-100 hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-all cursor-pointer"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Products */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest">
                Productos
              </p>
              <button
                onClick={() => setProductModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#E2E4EC] text-[#444A60] hover:border-[#4C63FC] hover:text-[#4C63FC] bg-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Añadir
              </button>
            </div>
            <div
              className="bg-white rounded-[14px] border border-[#E2E4EC] divide-y divide-[#F0F1F5]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {org.products.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#7B8099]">Sin productos asignados</p>
              ) : (
                org.products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 group">
                    <span className="text-xs font-semibold text-[#4C63FC] bg-[#EEF2FF] px-2 py-1 rounded-md font-mono flex-shrink-0">
                      {p.productId}
                    </span>
                    {p.planId && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: "#1e40af", backgroundColor: "#eff6ff" }}>
                        {p.planId}
                      </span>
                    )}
                    <div className="flex-1" />
                    <select
                      value={p.status}
                      onChange={(e) =>
                        mutate(
                          () => updateProductStatus(org.id, p.productId, e.target.value),
                          "Estado actualizado"
                        )
                      }
                      className="text-xs border border-[#E2E4EC] rounded-lg px-2 py-1 bg-white text-[#444A60] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4C63FC] transition-colors"
                    >
                      {PRODUCT_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        mutate(
                          () => removeProduct(org.id, p.productId),
                          "Producto eliminado"
                        )
                      }
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] opacity-0 group-hover:opacity-100 hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-all cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Org info */}
          <section className="col-span-2">
            <p className="text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest mb-3">
              Información
            </p>
            <div
              className="bg-white rounded-[14px] border border-[#E2E4EC] px-6 py-5 flex items-center gap-3 flex-wrap"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B8099] bg-[#F4F5F7] px-2.5 py-1 rounded-full">
                <span className="w-1 h-1 rounded-full bg-[#7B8099]" />
                {org.members.length} {org.members.length === 1 ? "miembro" : "miembros"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B8099] bg-[#F4F5F7] px-2.5 py-1 rounded-full">
                <span className="w-1 h-1 rounded-full bg-[#7B8099]" />
                {org.products.length} {org.products.length === 1 ? "producto" : "productos"}
              </span>
              {createdDate && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B8099] bg-[#F4F5F7] px-2.5 py-1 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-[#7B8099]" />
                  Creada {createdDate}
                </span>
              )}
              <div className="flex-1" />
              <span className="text-xs text-[#7B8099] font-mono">@{org.slug}</span>
            </div>
          </section>

        </div>
      </main>

      {/* Modals */}
      {memberModal && (
        <InviteMemberModal
          orgId={org.id}
          onClose={() => {
            setMemberModal(false);
            router.refresh();
          }}
        />
      )}
      {productModal && (
        <AddProductModal
          orgId={org.id}
          onClose={() => {
            setProductModal(false);
            router.refresh();
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111318] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
          <span className="w-2 h-2 rounded-full bg-[#4C63FC]" />
          {toast}
        </div>
      )}
    </div>
  );
}
