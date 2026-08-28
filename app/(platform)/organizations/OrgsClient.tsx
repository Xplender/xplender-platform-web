"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon, ArrowRightIcon } from "@/components/layout/nav-icons";
import { CreateOrganizationModal } from "./CreateOrganizationModal";

export type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  memberCount: number;
  productCount: number;
  createdAt: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: "#EEF2FF", color: "#4C63FC" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#ECFDF5", color: "#059669" },
  { bg: "#FFF1F2", color: "#E11D48" },
  { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#F0F9FF", color: "#0284C7" },
];

const STATUS_MAP: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  active:    { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", dot: "#10b981", label: "Activo" },
  trial:     { color: "#3730a3", bg: "#eef2ff", border: "#c7d2fe", dot: "#6366f1", label: "Trial" },
  suspended: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Suspendido" },
};

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── OrgCard ───────────────────────────────────────────────────────────────────

function OrgCard({ org }: { org: OrgSummary }) {
  const ac = avatarColor(org.name);
  const s = STATUS_MAP[org.status] ?? { color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: org.status };

  return (
    <Link
      href={`/organizations/${org.id}`}
      className="bg-white rounded-[14px] border border-[#E2E4EC] px-6 py-5 flex flex-col hover:shadow-lg hover:-translate-y-0.5 hover:border-[#C8CDE0] transition-all duration-200 group"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
          style={{ backgroundColor: ac.bg, color: ac.color }}
        >
          {org.name[0].toUpperCase()}
        </div>

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#111318]">{org.name}</p>
          <p className="text-xs text-[#7B8099] mt-0.5 font-mono">@{org.slug}</p>
        </div>

        {/* Status + hover link */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
            {s.label}
          </span>
          <span className="text-xs font-semibold text-[#4C63FC] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalle
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Bottom pills */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#F0F1F5]">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B8099] bg-[#F4F5F7] px-2.5 py-1 rounded-full">
          <span className="w-1 h-1 rounded-full bg-[#7B8099]" />
          {org.memberCount} {org.memberCount === 1 ? "miembro" : "miembros"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B8099] bg-[#F4F5F7] px-2.5 py-1 rounded-full">
          <span className="w-1 h-1 rounded-full bg-[#7B8099]" />
          {org.productCount} {org.productCount === 1 ? "producto" : "productos"}
        </span>
      </div>
    </Link>
  );
}

// ── Page client ───────────────────────────────────────────────────────────────

export function OrgsClient({ orgs }: { orgs: OrgSummary[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E4EC] px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#111318] leading-tight">Organizaciones</h1>
          <p className="text-sm text-[#7B8099] mt-0.5">Clientes registrados en la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#4C63FC] bg-[#EEF2FF] px-3 py-1.5 rounded-full">
            {orgs.length} total
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer shadow-sm"
            style={{ backgroundColor: "#4C63FC" }}
          >
            <PlusIcon className="w-4 h-4" />
            Nueva organización
          </button>
        </div>
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[780px] mx-auto space-y-3">
          {orgs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E2E4EC] bg-white py-16 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <p className="text-sm font-semibold text-[#444A60]">Sin organizaciones</p>
              <p className="mt-1 text-xs text-[#7B8099] max-w-xs">
                Crea la primera organización para empezar a gestionar clientes y productos.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "#4C63FC" }}
              >
                <PlusIcon className="w-4 h-4" />
                Crear organización
              </button>
            </div>
          ) : (
            orgs.map((org) => <OrgCard key={org.id} org={org} />)
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <CreateOrganizationModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
