"use client";

import { useState, useTransition } from "react";
import {
  PlusIcon,
  XIcon,
} from "@/components/layout/nav-icons";
import { setUserEnabled, resendInvitation, createUser } from "./actions";

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

const ROLE_MAP: Record<string, { color: string; bg: string }> = {
  "xplender:owner":   { color: "#92400e", bg: "#fffbeb" },
  "xplender:admin":   { color: "#5b21b6", bg: "#f5f3ff" },
  "xplender:support": { color: "#374151", bg: "#f3f4f6" },
};

const ROLE_LABELS: Record<string, string> = {
  "xplender:owner":   "Owner",
  "xplender:admin":   "Admin",
  "xplender:support": "Soporte",
};

const CALLER_ROLE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  "xplender:owner": [
    { value: "xplender:admin",   label: "Admin" },
    { value: "xplender:support", label: "Soporte" },
  ],
  "xplender:admin": [
    { value: "xplender:support", label: "Soporte" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(firstName: string | null, lastName: string | null, email: string | null) {
  const parts = [firstName, lastName].filter(Boolean) as string[];
  if (parts.length > 0) return parts.map((w) => w[0]).join("").toUpperCase();
  return (email?.[0] ?? "?").toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string | null }) {
  const r = ROLE_MAP[role ?? ""] ?? { color: "#374151", bg: "#f3f4f6" };
  const label = ROLE_LABELS[role ?? ""] ?? role ?? "—";
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: r.color, backgroundColor: r.bg }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{ color: "#065f46", backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#10b981" }} />
      Activo
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{ color: "#991b1b", backgroundColor: "#fef2f2", borderColor: "#fecaca" }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#ef4444" }} />
      Suspendido
    </span>
  );
}

function UserTableRow({
  user,
  index,
  callerRole,
  onToast,
}: {
  user: UserRow;
  index: number;
  callerRole: string;
  onToast: (msg: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const av = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const ini = getInitials(user.firstName, user.lastName, user.email);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const canManage =
    user.role !== "xplender:owner" &&
    (callerRole === "xplender:owner" || callerRole === "xplender:admin");

  function handleToggleEnabled() {
    startTransition(async () => {
      try {
        await setUserEnabled(user.id, !user.enabled);
        onToast(user.enabled ? "Usuario desactivado" : "Usuario activado");
      } catch {
        onToast("Error al actualizar usuario");
      }
    });
  }

  return (
    <tr
      className={`border-b border-[#F0F1F5] last:border-0 transition-colors duration-100 ${
        index % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"
      } hover:bg-[#F4F5FF]`}
    >
      {/* Usuario */}
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: av.bg, color: av.color }}
          >
            {ini}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111318]">{fullName}</p>
            <p className="text-xs text-[#7B8099] mt-0.5">{user.email ?? "—"}</p>
          </div>
        </div>
      </td>

      {/* Rol */}
      <td className="py-4 px-4">
        <RoleBadge role={user.role} />
      </td>

      {/* Estado */}
      <td className="py-4 px-4">
        <StatusBadge enabled={user.enabled} />
      </td>

      {/* Acciones */}
      <td className="py-4 px-4 pr-6">
        {canManage && (
          <button
            onClick={handleToggleEnabled}
            disabled={pending}
            className={`text-xs font-medium border rounded-lg px-2.5 py-1.5 transition-colors bg-white cursor-pointer disabled:opacity-50 ${
              user.enabled
                ? "text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50"
                : "text-green-700 border-green-200 hover:border-green-400 hover:bg-green-50"
            }`}
          >
            {user.enabled ? "Desactivar" : "Activar"}
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Create User Modal ─────────────────────────────────────────────────────────

function CreateUserModal({
  isOpen,
  onClose,
  callerRole,
  onToast,
}: {
  isOpen: boolean;
  onClose: () => void;
  callerRole: string;
  onToast: (msg: string) => void;
}) {
  const roleOptions =
    CALLER_ROLE_OPTIONS[callerRole] ?? [
      { value: "xplender:support", label: "xplender:support" },
    ];

  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: roleOptions[0]?.value ?? "xplender:support",
  });
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"form" | "invitationFailed">("form");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isOpen) return null;

  function reset() {
    setFields({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: roleOptions[0]?.value ?? "xplender:support",
    });
    setError(null);
    setMode("form");
    setCreatedUserId(null);
  }

  function close() {
    if (pending) return;
    reset();
    onClose();
  }

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await createUser({
          email: fields.email,
          firstName: fields.firstName,
          lastName: fields.lastName,
          phone: fields.phone || undefined,
          role: fields.role,
        });
        if (result.invitationSent) {
          onToast(`Usuario ${fields.firstName} creado`);
          close();
        } else {
          setCreatedUserId(result.userId);
          setMode("invitationFailed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  function retry() {
    if (!createdUserId) return;
    setError(null);
    startTransition(async () => {
      try {
        await resendInvitation(createdUserId);
        onToast("Invitación reenviada");
        close();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al reenviar la invitación"
        );
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={close}
      />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E4EC]">
          <h2 className="text-base font-bold text-[#111318]">Nuevo usuario</h2>
          <button
            onClick={close}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] hover:bg-[#F4F5F7] hover:text-[#111318] transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {mode === "invitationFailed" ? (
          <div className="px-6 py-5 space-y-4">
            <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] px-4 py-3">
              <p className="text-sm font-semibold text-[#991b1b]">
                La invitación no se envió
              </p>
              <p className="text-xs text-[#b91c1c] mt-0.5">
                El usuario fue creado pero no recibirá el correo. Puedes
                reintentar ahora.
              </p>
            </div>
            {error && (
              <p className="text-sm text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F1F5]">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-[#444A60] bg-[#F4F5F7] hover:bg-[#E8E9EF] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={retry}
                disabled={pending}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: "#4C63FC" }}
              >
                {pending ? "Enviando…" : "Reintentar"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#111318]">
                  Nombre *
                </label>
                <input
                  required
                  value={fields.firstName}
                  onChange={set("firstName")}
                  placeholder="Xavier"
                  className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#111318]">
                  Apellido *
                </label>
                <input
                  required
                  value={fields.lastName}
                  onChange={set("lastName")}
                  placeholder="García"
                  className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">
                Correo *
              </label>
              <input
                required
                type="email"
                value={fields.email}
                onChange={set("email")}
                placeholder="usuario@xplender.com"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">
                Teléfono
              </label>
              <input
                type="tel"
                value={fields.phone}
                onChange={set("phone")}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">
                Rol *
              </label>
              {roleOptions.length > 1 ? (
                <select
                  value={fields.role}
                  onChange={set("role")}
                  className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all cursor-pointer"
                >
                  {roleOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-[#F4F5F7] text-[#7B8099]">
                  {roleOptions[0]?.label ?? "xplender:support"}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F1F5]">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-[#444A60] bg-[#F4F5F7] hover:bg-[#E8E9EF] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: "#4C63FC" }}
              >
                {pending ? "Enviando…" : "Enviar invitación"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

export function UsersClient({
  initialUsers,
  callerRole,
}: {
  initialUsers: UserRow[];
  callerRole: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="bg-white border-b border-[#E2E4EC] px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#111318] leading-tight">
            Usuarios
          </h1>
          <p className="text-sm text-[#7B8099] mt-0.5">
            Usuarios registrados en la plataforma
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer shadow-sm"
          style={{ backgroundColor: "#4C63FC" }}
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[900px] mx-auto">
          <div
            className="bg-white rounded-[14px] border border-[#E2E4EC] overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            {initialUsers.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-[#444A60]">
                  Sin usuarios todavía
                </p>
                <p className="text-xs text-[#7B8099] mt-1">
                  Crea el primer usuario con el botón de arriba.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E4EC]">
                    {["Usuario", "Rol", "Estado", "Acciones"].map((h, i) => (
                      <th
                        key={h}
                        className={`text-[10px] font-semibold uppercase tracking-wider text-[#7B8099] py-3 px-4 ${
                          i === 0 ? "pl-6" : ""
                        } ${i === 3 ? "pr-6" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initialUsers.map((user, i) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      index={i}
                      callerRole={callerRole}
                      onToast={showToast}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      <CreateUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        callerRole={callerRole}
        onToast={showToast}
      />

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
