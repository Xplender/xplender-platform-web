"use client";

import { useState, useTransition } from "react";
import { setUserEnabled } from "./actions";

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

const ROLE_LABELS: Record<string, string> = {
  "xplender:owner": "Owner",
  "xplender:admin": "Administrador",
  "xplender:support": "Soporte",
};

const ROLE_STYLES: Record<string, string> = {
  "xplender:owner": "bg-amber-50 text-amber-700 border-amber-200",
  "xplender:admin": "bg-violet-50 text-violet-700 border-violet-200",
  "xplender:support": "bg-zinc-50 text-zinc-600 border-zinc-200",
};

const AVATAR_COLORS: Record<string, string> = {
  "xplender:owner": "bg-amber-100 text-amber-700",
  "xplender:admin": "bg-violet-100 text-violet-700",
  "xplender:support": "bg-zinc-100 text-zinc-600",
};

function UserAvatar({
  firstName,
  lastName,
  email,
  role,
}: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
}) {
  const parts = [firstName, lastName].filter(Boolean);
  const text = parts.length > 0 ? parts.join(" ") : (email ?? "?");
  const initials = text
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const colorClass =
    AVATAR_COLORS[role ?? ""] ?? "bg-indigo-100 text-indigo-700";
  return (
    <div
      className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${colorClass}`}
    >
      {initials || "?"}
    </div>
  );
}

function ToggleEnabled({
  userId,
  enabled,
  isOwner,
}: {
  userId: string;
  enabled: boolean;
  isOwner: boolean;
}) {
  const [optimistic, setOptimistic] = useState(enabled);
  const [pending, startTransition] = useTransition();

  if (isOwner) {
    return <span className="text-xs text-zinc-400 italic">Siempre activo</span>;
  }

  function toggle() {
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      try {
        await setUserEnabled(userId, next);
      } catch {
        setOptimistic(!next);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={pending}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
          optimistic ? "bg-indigo-600" : "bg-zinc-200"
        }`}
        aria-label={optimistic ? "Desactivar usuario" : "Activar usuario"}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            optimistic ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <span
        className={`text-xs font-medium ${optimistic ? "text-emerald-600" : "text-zinc-400"}`}
      >
        {optimistic ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}

export function UserTable({
  users,
  callerRole,
}: {
  users: UserRow[];
  callerRole: string;
}) {
  void callerRole;
  return (
    <div className="overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/70">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Usuario
            </th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Rol
            </th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Miembro desde
            </th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => {
            const isOwner = u.role === "xplender:owner";
            const roleLabel = u.role
              ? (ROLE_LABELS[u.role] ?? u.role)
              : "Sin rol";
            const roleStyle = u.role
              ? (ROLE_STYLES[u.role] ??
                "bg-zinc-100 text-zinc-600 border-zinc-200")
              : "bg-zinc-100 text-zinc-600 border-zinc-200";
            const fullName =
              [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
            const since = u.createdAt
              ? new Date(u.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            return (
              <tr
                key={u.id}
                className={`border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50 ${
                  i % 2 === 1 ? "bg-zinc-50/40" : ""
                }`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      firstName={u.firstName}
                      lastName={u.lastName}
                      email={u.email}
                      role={u.role}
                    />
                    <div>
                      <p className="font-medium text-zinc-900">{fullName}</p>
                      <p className="text-xs text-zinc-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleStyle}`}
                  >
                    {roleLabel}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-zinc-400 text-xs">{since}</td>
                <td className="px-5 py-3.5">
                  <ToggleEnabled
                    userId={u.id}
                    enabled={u.enabled}
                    isOwner={isOwner}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
