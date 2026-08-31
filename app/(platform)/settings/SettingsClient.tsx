"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@/components/layout/nav-icons";
import { syncProduct, deleteRegisteredProduct } from "./actions";
import { RegisterProductModal } from "./RegisterProductModal";

type Plan = { id: string; name: string; priceMonthly: number };

type RegisteredProduct = {
  id: string;
  url: string;
  productId: string | null;
  name: string | null;
  adminUrl: string | null;
  plans: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
};

function parsePlans(raw: string | null): Plan[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function SettingsClient({ products }: { products: RegisteredProduct[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [registerModal, setRegisterModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function mutate(fn: () => Promise<void>, success?: string) {
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
        if (success) showToast(success);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Error inesperado");
      }
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-[#E2E4EC] px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#111318]">Ajustes</h1>
          <p className="text-sm text-[#7B8099] mt-0.5">Configuración de la plataforma</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[900px] mx-auto space-y-6">

          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest">
                  Productos registrados
                </p>
                <p className="text-xs text-[#7B8099] mt-0.5">
                  Productos conectados a la plataforma Xplender
                </p>
              </div>
              <button
                onClick={() => setRegisterModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#E2E4EC] text-[#444A60] hover:border-[#4C63FC] hover:text-[#4C63FC] bg-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Registrar producto
              </button>
            </div>

            <div
              className="bg-white rounded-[14px] border border-[#E2E4EC] overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {products.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-[#444A60]">Sin productos registrados</p>
                  <p className="text-xs text-[#7B8099] mt-1">
                    Registra un producto para empezar a asignarlo a organizaciones.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F0F1F5]">
                      <th className="text-left text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest px-5 py-3">Producto</th>
                      <th className="text-left text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest px-5 py-3">URL</th>
                      <th className="text-left text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest px-5 py-3">Planes</th>
                      <th className="text-left text-[10px] font-semibold text-[#7B8099] uppercase tracking-widest px-5 py-3">Última sync</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F5]">
                    {products.map((p) => {
                      const plans = parsePlans(p.plans);
                      return (
                        <tr key={p.id} className="group hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-[#111318]">{p.name ?? "—"}</p>
                            <p className="text-xs text-[#7B8099] font-mono">{p.productId ?? "—"}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-xs font-mono text-[#444A60] truncate max-w-[180px]">{p.url}</p>
                            {p.adminUrl && (
                              <p className="text-xs text-[#7B8099] truncate max-w-[180px]">{p.adminUrl}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {plans.length === 0 ? (
                                <span className="text-xs text-[#7B8099]">—</span>
                              ) : (
                                plans.map((pl) => (
                                  <span
                                    key={pl.id}
                                    className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                    style={{ color: "#1e40af", backgroundColor: "#eff6ff" }}
                                  >
                                    {pl.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#7B8099]">
                            {formatDate(p.lastSyncedAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => mutate(() => syncProduct(p.id), "Producto sincronizado")}
                                className="text-[11px] font-semibold text-[#4C63FC] hover:underline cursor-pointer"
                              >
                                Sync
                              </button>
                              <button
                                onClick={() => mutate(() => deleteRegisteredProduct(p.id), "Producto eliminado")}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7B8099] hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-all cursor-pointer"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </div>
      </main>

      {registerModal && (
        <RegisterProductModal
          onClose={() => {
            setRegisterModal(false);
            router.refresh();
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111318] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
          <span className="w-2 h-2 rounded-full bg-[#4C63FC]" />
          {toast}
        </div>
      )}
    </div>
  );
}
