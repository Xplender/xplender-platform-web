"use client";

import { useState, useMemo } from "react";
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


function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── OrgCard ───────────────────────────────────────────────────────────────────

function OrgCard({ org }: { org: OrgSummary }) {
  const ac = avatarColor(org.name);

  return (
    <Link
      href={`/organizations/${org.id}`}
      className="bg-white rounded-[14px] border border-[#E2E4EC] px-4 sm:px-6 py-4 sm:py-5 flex flex-col hover:shadow-lg hover:-translate-y-0.5 hover:border-[#C8CDE0] transition-all duration-200 group"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
          style={{ backgroundColor: ac.bg, color: ac.color }}
        >
          {org.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#111318] truncate">{org.name}</p>
          <p className="text-xs text-[#7B8099] mt-0.5 font-mono truncate">@{org.slug}</p>
        </div>
        <span className="text-xs font-semibold text-[#4C63FC] hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          Ver detalle <ArrowRightIcon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F0F1F5]">
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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orgs.filter((o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q));
  }, [orgs, query]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E4EC] px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#111318] leading-tight">Organizaciones</h1>
          <p className="text-sm text-[#7B8099] mt-0.5 hidden sm:block">Clientes registrados en la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#4C63FC] bg-[#EEF2FF] px-2.5 sm:px-3 py-1.5 rounded-full">
            {orgs.length} total
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer shadow-sm"
            style={{ backgroundColor: "#4C63FC" }}
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva organización</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-8">
        <div className="max-w-[780px] mx-auto">

          {/* Search */}
          <div className="relative mb-5">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8099]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar organización…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E2E4EC] rounded-xl text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all"
            />
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            orgs.length === 0 ? (
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
              <div className="text-center py-16 text-[#7B8099]">
                <p className="text-sm font-medium">Sin resultados</p>
                <p className="text-xs mt-1">Prueba con otro término o cambia el filtro.</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {filtered.map((org) => <OrgCard key={org.id} org={org} />)}
            </div>
          )}
        </div>
      </main>

      {modalOpen && <CreateOrganizationModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
