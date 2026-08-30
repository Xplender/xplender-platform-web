"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { resetPassword } from "./actions";

const AUTH_LOGIN_URL = "/login";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!token || tokenInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-zinc-900">Enlace inválido</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Este enlace de recuperación no es válido o ya fue utilizado.
          </p>
          <a
            href="/forgot-password"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Solicitar nuevo enlace
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-zinc-900">
            Contraseña restablecida
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tu
            nueva contraseña.
          </p>
          <a
            href={AUTH_LOGIN_URL}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Ir a iniciar sesión →
          </a>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(token!, password);
      if (result.success) {
        setSuccess(true);
      } else if (
        result.error === "Invalid reset token" ||
        result.error === "Reset token expired"
      ) {
        setTokenInvalid(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg overflow-hidden">
        <div className="bg-indigo-600 px-8 py-6 text-center">
          <h1 className="text-xl font-bold text-white">Xplender</h1>
          <p className="mt-1 text-sm text-indigo-200">Nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
          <p className="text-sm text-zinc-600">
            Elige una nueva contraseña para tu cuenta.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700">
              Nueva contraseña *
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              disabled={pending}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700">
              Confirmar contraseña *
            </label>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              placeholder="Repite la contraseña"
              disabled={pending}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {pending ? "Restableciendo…" : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
