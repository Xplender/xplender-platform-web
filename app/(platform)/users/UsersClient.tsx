"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, XIcon } from "@/components/layout/nav-icons";
import {
  setUserEnabled,
  resendInvitation,
  createUser,
  changeUserRole,
  type OrgMemberRow,
  type AvailableRole,
} from "./actions";

export type UserRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  enabled: boolean;
  createdAt: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: "#EEF2FF", color: "#4C63FC" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#ECFDF5", color: "#059669" },
  { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF1F2", color: "#E11D48" },
  { bg: "#F0F9FF", color: "#0284C7" },
];

const XPLENDER_ROLE_MAP: Record<string, { color: string; bg: string; label: string }> = {
  "xplender:owner":   { color: "#92400e", bg: "#fffbeb", label: "Owner" },
  "xplender:admin":   { color: "#5b21b6", bg: "#f5f3ff", label: "Admin" },
  "xplender:support": { color: "#374151", bg: "#f3f4f6", label: "Soporte" },
};

const ORG_ROLE_MAP: Record<string, { color: string; bg: string; label: string }> = {
  owner:  { color: "#92400e", bg: "#fffbeb", label: "Owner" },
  admin:  { color: "#5b21b6", bg: "#f5f3ff", label: "Admin" },
  member: { color: "#374151", bg: "#f3f4f6", label: "Miembro" },
};

const ROLE_LABEL: Record<string, string> = {
  "xplender:admin":   "Admin",
  "xplender:support": "Soporte",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function fullName(first: string | null, last: string | null, email: string | null) {
  const parts = [first, last].filter(Boolean).join(" ");
  return parts || email || "—";
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ role, map }: { role: string; map: Record<string, { color: string; bg: string; label: string }> }) {
  const r = map[role] ?? { color: "#374151", bg: "#f3f4f6", label: role };
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: r.color, backgroundColor: r.bg }}
    >
      {r.label}
    </span>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ color: "#065f46", backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#10b981" }} />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ color: "#991b1b", backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#ef4444" }} />
      Suspendido
    </span>
  );
}

// ── Internal user row (desktop) ───────────────────────────────────────────────

function InternalUserRow({
  user, index, callerRole, availableRoles, onToast,
}: {
  user: UserRow; index: number; callerRole: string;
  availableRoles: AvailableRole[]; onToast: (msg: string) => void;
}) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const name = fullName(user.firstName, user.lastName, user.email);
  const av = avatarColor(user.id);
  const isOwner = user.role === "xplender:owner";
  const canManage = !isOwner && (callerRole === "xplender:owner" || callerRole === "xplender:admin");

  function handleToggle() {
    startTransition(async () => {
      try {
        await setUserEnabled(user.id, !user.enabled);
        onToast(user.enabled ? "Usuario desactivado" : "Usuario activado");
      } catch { onToast("Error al actualizar usuario"); }
    });
  }

  function handleRoleChange(roleId: string, roleName: string) {
    setRoleOpen(false);
    startTransition(async () => {
      try {
        await changeUserRole(user.id, roleId);
        onToast(`Rol cambiado a ${ROLE_LABEL[roleName] ?? roleName}`);
      } catch { onToast("Error al cambiar rol"); }
    });
  }

  function handleResend() {
    startTransition(async () => {
      try {
        await resendInvitation(user.id);
        onToast(`Invitación reenviada a ${name}`);
      } catch { onToast("Error al reenviar invitación"); }
    });
  }

  return (
    <tr className={`border-b border-[#F0F1F5] last:border-0 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"} hover:bg-[#F4F5FF]`}>
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.color }}>
            {initials(name)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-[#111318]">{name}</p>
              {isOwner && <span className="text-[10px] font-bold text-[#4C63FC] bg-[#EEF2FF] px-1.5 py-0.5 rounded-md">Propietario</span>}
            </div>
            <p className="text-xs text-[#7B8099] mt-0.5">{user.email ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <RoleBadge role={user.role ?? ""} map={XPLENDER_ROLE_MAP} />
      </td>
      <td className="py-4 px-4">
        <StatusBadge enabled={user.enabled} />
      </td>
      <td className="py-4 px-4 pr-6">
        {isOwner ? (
          <span className="text-xs text-[#C0C4D6] italic">Sin acciones</span>
        ) : canManage ? (
          <div className="flex items-center gap-3 flex-wrap">
            {callerRole === "xplender:owner" && availableRoles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setRoleOpen((o) => !o)}
                  disabled={pending}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#444A60] border border-[#E2E4EC] rounded-lg px-2.5 py-1.5 hover:border-[#4C63FC] hover:text-[#4C63FC] transition-colors bg-white cursor-pointer disabled:opacity-50"
                >
                  Cambiar rol
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {roleOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E4EC] rounded-xl shadow-lg z-20 min-w-[170px] overflow-hidden" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                    {availableRoles.map((r) => (
                      <button
                        key={r.id}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${user.role === r.name ? "text-[#4C63FC] bg-[#EEF2FF]" : "text-[#444A60] hover:bg-[#F4F5F7]"}`}
                        onClick={() => handleRoleChange(r.id, r.name)}
                      >
                        {ROLE_LABEL[r.name] ?? r.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleToggle}
              disabled={pending}
              className={`text-xs font-medium border rounded-lg px-2.5 py-1.5 transition-colors bg-white cursor-pointer disabled:opacity-50 ${
                user.enabled
                  ? "text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50"
                  : "text-green-700 border-green-200 hover:border-green-400 hover:bg-green-50"
              }`}
            >
              {user.enabled ? "Desactivar" : "Activar"}
            </button>
            <button
              onClick={handleResend}
              disabled={pending}
              className="flex items-center gap-1.5 text-xs font-medium text-[#7B8099] hover:text-[#4C63FC] transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Reenviar
            </button>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

// ── Internal user card (mobile) ───────────────────────────────────────────────

function InternalUserCard({ user, index, onResend }: { user: UserRow; index: number; onResend: () => void }) {
  const name = fullName(user.firstName, user.lastName, user.email);
  const av = avatarColor(user.id);
  const isOwner = user.role === "xplender:owner";
  return (
    <div className="bg-white rounded-[14px] border border-[#E2E4EC] px-4 py-4 space-y-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.color }}>
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-[#111318] truncate">{name}</p>
            {isOwner && <span className="text-[10px] font-bold text-[#4C63FC] bg-[#EEF2FF] px-1.5 py-0.5 rounded-md">Propietario</span>}
          </div>
          <p className="text-xs text-[#7B8099] truncate">{user.email ?? "—"}</p>
        </div>
        <StatusBadge enabled={user.enabled} />
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-[#F0F1F5]">
        <RoleBadge role={user.role ?? ""} map={XPLENDER_ROLE_MAP} />
        {!isOwner && (
          <button onClick={onResend} className="flex items-center gap-1 text-xs font-medium text-[#7B8099] hover:text-[#4C63FC] transition-colors cursor-pointer">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Reenviar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Org user row (desktop) ────────────────────────────────────────────────────

function OrgUserRow({ user, index, onNavigate }: { user: OrgMemberRow; index: number; onNavigate: (id: string) => void }) {
  const name = fullName(user.firstName, user.lastName, user.email);
  const av = avatarColor(user.userId);
  return (
    <tr className={`border-b border-[#F0F1F5] last:border-0 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"} hover:bg-[#F4F5FF]`}>
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.color }}>
            {initials(name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111318]">{name}</p>
            <p className="text-xs text-[#7B8099] mt-0.5">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <button onClick={() => onNavigate(user.orgId)} className="text-xs font-semibold text-[#4C63FC] hover:underline cursor-pointer">
          {user.orgName}
        </button>
      </td>
      <td className="py-4 px-4">
        <RoleBadge role={user.orgRole} map={ORG_ROLE_MAP} />
      </td>
      <td className="py-4 px-4 pr-6">
        <StatusBadge enabled={user.enabled} />
      </td>
    </tr>
  );
}

// ── Org user card (mobile) ────────────────────────────────────────────────────

function OrgUserCard({ user, index, onNavigate }: { user: OrgMemberRow; index: number; onNavigate: (id: string) => void }) {
  const name = fullName(user.firstName, user.lastName, user.email);
  const av = avatarColor(user.userId);
  return (
    <div className="bg-white rounded-[14px] border border-[#E2E4EC] px-4 py-4 space-y-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.color }}>
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111318] truncate">{name}</p>
          <p className="text-xs text-[#7B8099] truncate">{user.email}</p>
        </div>
        <StatusBadge enabled={user.enabled} />
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-[#F0F1F5]">
        <div className="flex items-center gap-2 min-w-0">
          <RoleBadge role={user.orgRole} map={ORG_ROLE_MAP} />
          <span className="text-[10px] text-[#7B8099]">en</span>
          <button onClick={() => onNavigate(user.orgId)} className="text-xs font-semibold text-[#4C63FC] hover:underline truncate cursor-pointer">
            {user.orgName}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create User Modal ─────────────────────────────────────────────────────────

const CALLER_ROLE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  "xplender:owner": [
    { value: "xplender:admin",   label: "Admin" },
    { value: "xplender:support", label: "Soporte" },
  ],
  "xplender:admin": [
    { value: "xplender:support", label: "Soporte" },
  ],
};

function CreateUserModal({ isOpen, onClose, callerRole, onToast }: {
  isOpen: boolean; onClose: () => void; callerRole: string; onToast: (msg: string) => void;
}) {
  const roleOptions = CALLER_ROLE_OPTIONS[callerRole] ?? [{ value: "xplender:support", label: "Soporte" }];
  const [fields, setFields] = useState({ firstName: "", lastName: "", email: "", phone: "", role: roleOptions[0]?.value ?? "xplender:support" });
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"form" | "invitationFailed">("form");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isOpen) return null;

  function reset() {
    setFields({ firstName: "", lastName: "", email: "", phone: "", role: roleOptions[0]?.value ?? "xplender:support" });
    setError(null); setMode("form"); setCreatedUserId(null);
  }

  function close() { if (pending) return; reset(); onClose(); }
  function set(key: keyof typeof fields) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFields((f) => ({ ...f, [key]: e.target.value })); }

  function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    startTransition(async () => {
      try {
        const result = await createUser({ email: fields.email, firstName: fields.firstName, lastName: fields.lastName, phone: fields.phone || undefined, role: fields.role });
        if (result.invitationSent) { onToast(`Usuario ${fields.firstName} creado`); close(); }
        else { setCreatedUserId(result.userId); setMode("invitationFailed"); }
      } catch (err) { setError(err instanceof Error ? err.message : "Error desconocido"); }
    });
  }

  function retry() {
    if (!createdUserId) return; setError(null);
    startTransition(async () => {
      try { await resendInvitation(createdUserId); onToast("Invitación reenviada"); close(); }
      catch (err) { setError(err instanceof Error ? err.message : "Error al reenviar la invitación"); }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={close} />
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E4EC]">
          <div>
            <h2 className="text-base font-bold text-[#111318]">Nuevo usuario Xplender</h2>
            <p className="text-xs text-[#7B8099] mt-0.5">Acceso a la plataforma administrativa</p>
          </div>
          <button onClick={close} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] hover:bg-[#F4F5F7] hover:text-[#111318] transition-colors cursor-pointer">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {mode === "invitationFailed" ? (
          <div className="px-6 py-5 space-y-4">
            <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] px-4 py-3">
              <p className="text-sm font-semibold text-[#991b1b]">La invitación no se envió</p>
              <p className="text-xs text-[#b91c1c] mt-0.5">El usuario fue creado pero no recibirá el correo. Puedes reintentar ahora.</p>
            </div>
            {error && <p className="text-sm text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2">{error}</p>}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F1F5]">
              <button type="button" onClick={close} disabled={pending} className="px-4 py-2 text-sm font-medium text-[#444A60] bg-[#F4F5F7] hover:bg-[#E8E9EF] rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cerrar</button>
              <button type="button" onClick={retry} disabled={pending} className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer disabled:opacity-60" style={{ backgroundColor: "#4C63FC" }}>{pending ? "Enviando…" : "Reintentar"}</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(["firstName", "lastName"] as const).map((k, i) => (
                <div key={k} className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#111318]">{i === 0 ? "Nombre *" : "Apellido *"}</label>
                  <input required value={fields[k]} onChange={set(k)} placeholder={i === 0 ? "Xavier" : "García"} className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all" />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Correo *</label>
              <input required type="email" value={fields.email} onChange={set("email")} placeholder="usuario@xplender.com" className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Teléfono</label>
              <input type="tel" value={fields.phone} onChange={set("phone")} placeholder="+52 55 1234 5678" className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Rol *</label>
              {roleOptions.length > 1 ? (
                <select value={fields.role} onChange={set("role")} className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all cursor-pointer">
                  {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <div className="px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-[#F4F5F7] text-[#7B8099]">{roleOptions[0]?.label ?? "Soporte"}</div>
              )}
            </div>
            {error && <p className="text-sm text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2">{error}</p>}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F1F5]">
              <button type="button" onClick={close} disabled={pending} className="px-4 py-2 text-sm font-medium text-[#444A60] bg-[#F4F5F7] hover:bg-[#E8E9EF] rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer disabled:opacity-60" style={{ backgroundColor: "#4C63FC" }}>{pending ? "Enviando…" : "Enviar invitación"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = "internal" | "orgs";

export function UsersClient({
  initialUsers,
  callerRole,
  orgMembers,
  availableRoles,
}: {
  initialUsers: UserRow[];
  callerRole: string;
  orgMembers: OrgMemberRow[];
  availableRoles: AvailableRole[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("internal");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  const q = query.toLowerCase();

  const internalUsers = useMemo(
    () => initialUsers.filter((u) => u.role !== null),
    [initialUsers]
  );

  const filteredInternal = useMemo(
    () => internalUsers.filter((u) => {
      const name = fullName(u.firstName, u.lastName, u.email).toLowerCase();
      return name.includes(q) || (u.email ?? "").toLowerCase().includes(q);
    }),
    [internalUsers, q]
  );

  const filteredOrg = useMemo(
    () => orgMembers.filter((u) => {
      const name = fullName(u.firstName, u.lastName, u.email).toLowerCase();
      return name.includes(q) || u.email.toLowerCase().includes(q) || u.orgName.toLowerCase().includes(q);
    }),
    [orgMembers, q]
  );

  const showingInternal = tab === "internal";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E4EC] px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#111318] leading-tight">Usuarios</h1>
          <p className="text-sm text-[#7B8099] mt-0.5 hidden sm:block">Usuarios de la plataforma</p>
        </div>
        {showingInternal && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer shadow-sm"
            style={{ backgroundColor: "#4C63FC" }}
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo usuario</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-8">
        <div className="max-w-[900px] mx-auto">

          {/* Tabs + search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-6 items-start sm:items-center">
            <div className="flex items-center bg-[#F0F1F5] rounded-xl p-1 flex-shrink-0">
              {([["internal", "Xplender", internalUsers.length], ["orgs", "Organizaciones", orgMembers.length]] as [Tab, string, number][]).map(([t, label, count]) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setQuery(""); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${tab === t ? "bg-white text-[#111318] shadow-sm" : "text-[#7B8099] hover:text-[#444A60]"}`}
                >
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t ? "bg-[#EEF2FF] text-[#4C63FC]" : "bg-[#E2E4EC] text-[#7B8099]"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative flex-1 w-full sm:w-auto">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8099]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder={showingInternal ? "Buscar por nombre o email…" : "Buscar por nombre, email u organización…"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E2E4EC] rounded-xl text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all"
              />
            </div>
          </div>

          {/* Internal tab */}
          {showingInternal && (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-3 sm:hidden">
                {filteredInternal.length === 0
                  ? <p className="text-sm text-[#7B8099] text-center py-8">Sin resultados</p>
                  : filteredInternal.map((u, i) => (
                    <InternalUserCard key={u.id} user={u} index={i} onResend={() => resendInvitation(u.id).then(() => showToast(`Invitación reenviada`)).catch(() => showToast("Error"))} />
                  ))
                }
              </div>
              {/* Desktop table */}
              <div className="hidden sm:block bg-white rounded-[14px] border border-[#E2E4EC] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[620px]">
                    <thead>
                      <tr className="border-b border-[#E2E4EC]">
                        {["Usuario Xplender", "Rol Xplender", "Estado", "Acciones"].map((h, i) => (
                          <th key={h} className={`text-[10px] font-semibold uppercase tracking-wider text-[#7B8099] py-3 px-4 ${i === 0 ? "pl-6" : ""} ${i === 3 ? "pr-6" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInternal.length === 0
                        ? <tr><td colSpan={4} className="py-10 text-center text-sm text-[#7B8099]">Sin resultados</td></tr>
                        : filteredInternal.map((u, i) => (
                          <InternalUserRow key={u.id} user={u} index={i} callerRole={callerRole} availableRoles={availableRoles} onToast={showToast} />
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Org tab */}
          {!showingInternal && (
            <>
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4C63FC] flex-shrink-0" />
                <p className="text-xs text-[#7B8099]">
                  Los roles mostrados corresponden al rol de cada usuario <strong className="text-[#444A60]">dentro de su organización</strong>, no a roles de Xplender.
                </p>
              </div>
              {/* Mobile cards */}
              <div className="flex flex-col gap-3 sm:hidden">
                {filteredOrg.length === 0
                  ? <p className="text-sm text-[#7B8099] text-center py-8">Sin resultados</p>
                  : filteredOrg.map((u, i) => (
                    <OrgUserCard key={`${u.userId}-${u.orgId}`} user={u} index={i} onNavigate={(id) => router.push(`/organizations/${id}`)} />
                  ))
                }
              </div>
              {/* Desktop table */}
              <div className="hidden sm:block bg-white rounded-[14px] border border-[#E2E4EC] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[560px]">
                    <thead>
                      <tr className="border-b border-[#E2E4EC]">
                        {["Usuario", "Organización", "Rol en org.", "Estado"].map((h, i) => (
                          <th key={h} className={`text-[10px] font-semibold uppercase tracking-wider text-[#7B8099] py-3 px-4 ${i === 0 ? "pl-6" : ""} ${i === 3 ? "pr-6" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrg.length === 0
                        ? <tr><td colSpan={4} className="py-10 text-center text-sm text-[#7B8099]">Sin resultados</td></tr>
                        : filteredOrg.map((u, i) => (
                          <OrgUserRow key={`${u.userId}-${u.orgId}`} user={u} index={i} onNavigate={(id) => router.push(`/organizations/${id}`)} />
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <CreateUserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} callerRole={callerRole} onToast={showToast} />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111318] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
          <span className="w-2 h-2 rounded-full bg-[#4C63FC]" />
          {toast}
        </div>
      )}
    </div>
  );
}
