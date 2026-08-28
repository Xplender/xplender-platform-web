"use client";

import { useState, useTransition, useRef } from "react";
import { UserPlus, X } from "lucide-react";
import { createUser, resendInvitation } from "./actions";

const ROLE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  "xplender:owner": [
    { value: "xplender:admin", label: "Administrador" },
    { value: "xplender:support", label: "Soporte" },
  ],
  "xplender:admin": [{ value: "xplender:support", label: "Soporte" }],
};

type Field = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
};

const empty = (callerRole: string): Field => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: ROLE_OPTIONS[callerRole]?.[0]?.value ?? "xplender:support",
});

type Mode = "form" | "invitationFailed";

export function CreateUserButton({ callerRole }: { callerRole: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("form");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [fields, setFields] = useState<Field>(() => empty(callerRole));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  const roleOptions = ROLE_OPTIONS[callerRole] ?? [];
  const showRoleSelect = roleOptions.length > 1;

  function openDialog() {
    setFields(empty(callerRole));
    setError(null);
    setMode("form");
    setCreatedUserId(null);
    setOpen(true);
  }

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function set(key: keyof Field) {
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
          setOpen(false);
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
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al reenviar la invitación"
        );
      }
    });
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Crear usuario
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
          <div
            ref={dialogRef}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 className="text-base font-semibold text-zinc-900">Crear usuario</h2>
              <button
                onClick={close}
                disabled={pending}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {mode === "invitationFailed" ? (
              <div className="px-6 py-5 flex flex-col gap-4">
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex flex-col gap-1">
                  <p className="text-sm font-medium text-red-700">
                    La invitación no se envió correctamente
                  </p>
                  <p className="text-xs text-red-600">
                    El usuario fue creado pero no recibirá el correo de invitación.
                    Puedes reintentar el envío ahora.
                  </p>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    disabled={pending}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  >
                    Cerrar de todas formas
                  </button>
                  <button
                    type="button"
                    onClick={retry}
                    disabled={pending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {pending ? "Enviando…" : "Reintentar"}
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-700">Nombre *</label>
                    <input
                      required
                      value={fields.firstName}
                      onChange={set("firstName")}
                      placeholder="Xavier"
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-700">Apellido *</label>
                    <input
                      required
                      value={fields.lastName}
                      onChange={set("lastName")}
                      placeholder="Castellanos"
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-700">Correo *</label>
                  <input
                    required
                    type="email"
                    value={fields.email}
                    onChange={set("email")}
                    placeholder="usuario@ejemplo.com"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-700">Teléfono</label>
                  <input
                    type="tel"
                    value={fields.phone}
                    onChange={set("phone")}
                    placeholder="+52 55 1234 5678"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {showRoleSelect ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-700">Rol *</label>
                    <select
                      value={fields.role}
                      onChange={set("role")}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      {roleOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-700">Rol</label>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
                      {roleOptions[0]?.label ?? "Soporte"}
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    disabled={pending}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {pending ? "Enviando…" : "Enviar invitación"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
