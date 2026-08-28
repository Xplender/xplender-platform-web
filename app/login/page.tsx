"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ZapIcon } from "@/components/layout/nav-icons";

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    const pathname = new URL(raw, "http://x").pathname;
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
      return "/dashboard";
    }
    return pathname;
  } catch {
    return "/dashboard";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    </svg>
  );
}

function GridDots() {
  const dots = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 12; c++) {
      dots.push(
        <div
          key={`${r}-${c}`}
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        />
      );
    }
  }
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
      {dots}
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errorType, setErrorType] = useState<"credentials" | "disabled" | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorType(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error === "disabled") {
        setErrorType("disabled");
      } else if (result?.error) {
        setErrorType("credentials");
      } else {
        router.push(callbackUrl);
      }
    });
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Panel izquierdo — solo desktop ──────────────────────── */}
      <div
        className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #3730a3 0%, #4C63FC 50%, #6366f1 100%)" }}
      >
        {/* Grid decorativo */}
        <div className="absolute bottom-12 left-8 right-8 opacity-60">
          <GridDots />
        </div>

        {/* Watermark rayo */}
        <div className="absolute -bottom-16 -right-16 opacity-[0.06]">
          <ZapIcon className="w-80 h-80 text-white" />
        </div>

        {/* Contenido */}
        <div className="relative z-10 flex flex-col h-full px-12 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ZapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-lg font-bold tracking-tight">Xplender</span>
          </div>

          {/* Copy principal */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-4">
              Platform Admin
            </p>
            <h1 className="text-white text-4xl font-bold leading-tight tracking-tight">
              Control total<br />sobre tu<br />plataforma.
            </h1>
            <p className="text-white/60 text-base mt-5 leading-relaxed max-w-xs">
              Gestiona organizaciones, productos y usuarios desde un único panel de control.
            </p>
          </div>

        </div>
      </div>

      {/* ── Panel derecho — formulario ──────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F5F7] px-6">
        <div className="w-full max-w-[380px]">

          {/* Logo móvil */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#4C63FC] flex items-center justify-center">
              <ZapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#111318] text-base font-bold">Xplender</span>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#111318] tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-[#7B8099] mt-1.5">Accede al panel de administración</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Email</label>
              <input
                type="email"
                placeholder="tu@xplender.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorType(null); }}
                autoComplete="email"
                disabled={pending}
                className="w-full px-4 py-3 text-sm bg-white border border-[#E2E4EC] rounded-xl text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all disabled:opacity-60"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorType(null); }}
                  autoComplete="current-password"
                  disabled={pending}
                  className="w-full px-4 py-3 pr-11 text-sm bg-white border border-[#E2E4EC] rounded-xl text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B8099] hover:text-[#111318] transition-colors cursor-pointer p-0.5"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              <a
                href="/forgot-password"
                className="block text-right text-xs text-[#7B8099] hover:text-[#4C63FC] transition-colors mt-1"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Error */}
            {errorType === "disabled" && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] flex-shrink-0" />
                <p className="text-xs font-medium text-[#991b1b]">
                  Tu cuenta está desactivada. Por favor, contacta a un administrador o a soporte.
                </p>
              </div>
            )}
            {errorType === "credentials" && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] flex-shrink-0" />
                <p className="text-xs font-medium text-[#991b1b]">Correo o contraseña incorrectos</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 text-sm font-semibold text-white bg-[#4C63FC] rounded-xl hover:bg-[#3A50E8] disabled:opacity-70 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
              style={{ boxShadow: "0 2px 8px rgba(76,99,252,0.35)" }}
            >
              {pending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Accediendo…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#7B8099] mt-8">
            Xplender Platform · v1.0.0
          </p>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
