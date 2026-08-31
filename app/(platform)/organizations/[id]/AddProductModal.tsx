"use client";

import { useEffect, useState, useTransition } from "react";
import { XIcon } from "@/components/layout/nav-icons";
import { addProduct } from "../actions";
import { listRegisteredProducts } from "../../settings/actions";

type Plan = { id: string; name: string; priceMonthly?: number };
type RegisteredProduct = {
  id: string;
  productId: string | null;
  name: string | null;
  plans: string | null;
};

const TRIAL_OPTIONS = [
  { label: "15 días", value: 15 },
  { label: "30 días", value: 30 },
  { label: "3 meses", value: 90 },
];

const STATUS_OPTIONS = [
  { value: "trial",  label: "Trial" },
  { value: "active", label: "Activo" },
];

function parsePlans(raw: string | null): Plan[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function AddProductModal({
  orgId,
  onClose,
}: {
  orgId: string;
  onClose: () => void;
}) {
  const [registeredProducts, setRegisteredProducts] = useState<RegisteredProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [status, setStatus] = useState("trial");
  const [trialDays, setTrialDays] = useState(30);

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    listRegisteredProducts()
      .then(setRegisteredProducts)
      .catch(() => setRegisteredProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const selectedProduct = registeredProducts.find((p) => p.productId === selectedProductId);
  const plans = parsePlans(selectedProduct?.plans ?? null);

  function handleProductChange(productId: string) {
    setSelectedProductId(productId);
    setSelectedPlanId("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await addProduct(
          orgId,
          selectedProductId,
          selectedPlanId || null,
          status === "trial" ? trialDays : null
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
        className="relative bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E4EC]">
          <h2 className="text-base font-bold text-[#111318]">Añadir producto</h2>
          <button
            onClick={() => !pending && onClose()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] hover:bg-[#F4F5F7] hover:text-[#111318] transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">

          {/* Producto */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111318]">Producto *</label>
            {loadingProducts ? (
              <div className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl text-[#7B8099]">
                Cargando productos…
              </div>
            ) : registeredProducts.length === 0 ? (
              <div className="w-full px-3 py-2.5 text-sm border border-[#fecaca] bg-[#fef2f2] rounded-xl text-[#991b1b]">
                No hay productos registrados. Ve a Ajustes para registrar uno.
              </div>
            ) : (
              <select
                required
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                disabled={pending}
                className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all disabled:opacity-60 cursor-pointer"
              >
                <option value="">Selecciona un producto…</option>
                {registeredProducts.map((p) => (
                  <option key={p.id} value={p.productId ?? ""}>
                    {p.name ?? p.productId}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Plan */}
          {selectedProduct && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                disabled={pending || plans.length === 0}
                className="w-full px-3 py-2.5 text-sm border border-[#E2E4EC] rounded-xl bg-white text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/30 focus:border-[#4C63FC] transition-all disabled:opacity-60 cursor-pointer"
              >
                <option value="">Sin plan específico</option>
                {plans.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                    {pl.priceMonthly != null ? ` — $${pl.priceMonthly}/mes` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Estado */}
          {selectedProduct && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Estado inicial</label>
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
          )}

          {/* Duración del trial */}
          {selectedProduct && status === "trial" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111318]">Duración del trial</label>
              <div className="flex gap-2">
                {TRIAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTrialDays(opt.value)}
                    disabled={pending}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                      trialDays === opt.value
                        ? "border-[#4C63FC] text-[#4C63FC] bg-[#EEF2FF]"
                        : "border-[#E2E4EC] text-[#444A60] bg-white hover:border-[#4C63FC]/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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
              disabled={pending || !selectedProductId || registeredProducts.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: "#4C63FC" }}
            >
              {pending ? "Añadiendo…" : "Añadir producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
