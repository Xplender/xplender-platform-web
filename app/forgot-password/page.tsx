"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { forgotPassword } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-zinc-900">
            Revisa tu correo
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Si ese correo está registrado, recibirás un enlace para
            restablecer tu contraseña en breve.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await forgotPassword(email);
        setSuccess(true);
      } catch {
        setError("Error al procesar la solicitud. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg overflow-hidden">
        <div className="bg-indigo-600 px-8 py-6 text-center">
          <h1 className="text-xl font-bold text-white">Xplender</h1>
          <p className="mt-1 text-sm text-indigo-200">
            Recupera tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
          <p className="text-sm text-zinc-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700">
              Correo electrónico *
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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
            {pending ? "Enviando…" : "Enviar enlace de recuperación"}
          </button>

          <a
            href="/login"
            className="text-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            ← Volver al inicio de sesión
          </a>
        </form>
      </div>
    </div>
  );
}
