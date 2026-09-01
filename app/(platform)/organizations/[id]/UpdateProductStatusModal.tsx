"use client";

import { useState, useTransition } from "react";
import { XIcon } from "@/components/layout/nav-icons";
import { updateProductStatus } from "../actions";

const STATUS_OPTIONS = [
  { value: "active",    label: "Activo" },
  { value: "trial",     label: "Trial" },
  { value: "suspended", label: "Suspendido" },
];

const TRIAL_OPTIONS = [
  { label: "15 días",  value: 15 },
  { label: "30 días",  value: 30 },
  { label: "3 meses",  value: 90 },
];

export function UpdateProductStatusModal({
  orgId,
  productId,
  currentStatus,
  onClose,
}: {
  orgId: string;
  productId: string;
  currentStatus: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [trialDays, setTrialDays] = useState(30);
  const [customDays, setCustomDays] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const resolvedTrialDays = useCustom ? parseInt(customDays || "0", 10) : trialDays;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (status === "trial" && useCustom && (!customDays || parseInt(customDays, 10) < 1)) {
      setError("Ingresa un número de días válido.");
      return;
    }
    startTransition(async () => {
      try {
        await updateProductStatus(
          orgId,
          productId,
          status,
          status === "trial" ? resolvedTrialDays : null
        );
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => !pending && onClose()}
      />
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E4EC]">
          <div>
            <h2 className="text-base font-bold text-[#111318]">Actualizar producto</h2>
            <p className="text-xs text-[#7B8099] mt-0.5 font-mono">{productId}</p>
          </div>
          <button
            onClick={() => !pending && onClose()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] hover:bg-[#F4F5F7] hover:text-[#111318] transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {/* Estado */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111318]">Estado</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  disabled={pending}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                    status === opt.value
                      ? "border-[#4C63FC] text-[#4C63FC] bg-[#EEF2FF]"
                      : "border-[#E2E4EC] text-[#444A60] bg-white hover:border-[#4C63FC]/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duración del trial */}
          {status === "trial" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Duración del trial</label>
              <div className="flex gap-2">
                {TRIAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setTrialDays(opt.value); setUseCustom(false); }}
                    disabled={pending}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                      !useCustom && trialDays === opt.value
                        ? "border-[#4C63FC] text-[#4C63FC] bg-[#EEF2FF]"
                        : "border-[#E2E4EC] text-[#444A60] bg-white hover:border-[#4C63FC]/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setUseCustom((v) => !v)}
                  disabled={pending}
                  className={`px-3 py-2 text-sm font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                    useCustom
                      ? "border-[#4C63FC] text-[#4C63FC] bg-[#EEF2FF]"
                      : "border-[#E2E4EC] text-[#444A60] bg-white hover:border-[#4C63FC]/40"
                  }`}
                >
                  Personalizado
                </button>
                {useCustom && (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Ej. 45"
                      disabled={pending}
                      className="w-full px-3 py-2 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all"
                    />
                    <span className="text-xs text-[#7B8099] whitespace-nowrap">días</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F1F5]">
            <button
              type="button"
              onClick={() => !pending && onClose()}
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
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
