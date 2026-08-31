"use client";

import { useState, useTransition } from "react";
import { XIcon } from "@/components/layout/nav-icons";
import { registerProduct } from "./actions";

export function RegisterProductModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generateKey() {
    const key = crypto.randomUUID();
    setApiKey(key);
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await registerProduct(url, apiKey);
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
        className="relative bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E4EC]">
          <h2 className="text-base font-bold text-[#111318]">Registrar producto</h2>
          <button
            onClick={() => !pending && onClose()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] hover:bg-[#F4F5F7] hover:text-[#111318] transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111318]">
              URL base del producto *
            </label>
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://qr-menu:8082"
              disabled={pending}
              className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all disabled:opacity-60 font-mono"
            />
            <p className="text-xs text-[#7B8099]">
              URL interna del servicio (sin slash final)
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111318]">
              API Key interna *
            </label>
            <div className="flex gap-2">
              <input
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Genera o pega la clave"
                disabled={pending}
                className="flex-1 px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] placeholder-[#7B8099] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all disabled:opacity-60 font-mono"
              />
              <button
                type="button"
                onClick={generateKey}
                disabled={pending}
                className="px-3 py-2.5 text-xs font-semibold border border-[#E2E4EC] text-[#444A60] hover:border-[#4C63FC] hover:text-[#4C63FC] rounded-xl transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {copied ? "¡Copiado!" : "Generar"}
              </button>
            </div>
            <p className="text-xs text-[#7B8099]">
              Copia esta clave en <code className="bg-[#F4F5F7] px-1 rounded">XPLENDER_INTERNAL_API_KEY</code> del producto antes de guardar.
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
              onClick={() => !pending && onClose()}
              disabled={pending}
              className="px-4 py-2 text-sm font-medium text-[#444A60] bg-[#F4F5F7] hover:bg-[#E8E9EF] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending || !url || !apiKey}
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: "#4C63FC" }}
            >
              {pending ? "Conectando…" : "Registrar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
