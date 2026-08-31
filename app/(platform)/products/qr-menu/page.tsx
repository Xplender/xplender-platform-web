import { QrCode, Building2, UtensilsCrossed, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listQrMenuRestaurants, getAdminSessionUrl } from "./actions";

const STATUS_MAP: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  active:    { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", dot: "#10b981", label: "Activo" },
  trial:     { color: "#3730a3", bg: "#eef2ff", border: "#c7d2fe", dot: "#6366f1", label: "Trial" },
  suspended: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Suspendido" },
};

const PLAN_LABEL: Record<string, string> = {
  digital: "Digital",
  premium: "Premium",
  basic: "Básico",
  pro: "Pro",
};

function SummaryChip({ count, label, bg, color, dot }: { count: number; label: string; bg: string; color: string; dot: string }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: bg, color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      {count} {label}
    </span>
  );
}

async function handleManage(orgId: string) {
  "use server";
  const url = await getAdminSessionUrl(orgId);
  redirect(url);
}

export default async function QrMenuPage() {
  const restaurants = await listQrMenuRestaurants().catch(() => []);

  const activeCount = restaurants.filter((r) => r.status === "active").length;
  const trialCount = restaurants.filter((r) => r.status === "trial").length;
  const suspendedCount = restaurants.filter((r) => r.status === "suspended").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E4EC] px-4 sm:px-8 py-4 sm:py-5 flex-shrink-0">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-xs font-medium text-[#7B8099] hover:text-[#4C63FC] transition-colors mb-3 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Productos <span className="text-[#E2E4EC] mx-0.5">/</span>
          <span className="text-[#111318]">QR Menu</span>
        </Link>

        <div className="flex flex-wrap items-start gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 text-[#4C63FC]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#111318]">QR Menu</h1>
              <p className="text-xs sm:text-sm text-[#7B8099] mt-0.5 hidden sm:block">
                Restaurantes con QR Menu activo en la plataforma
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <SummaryChip count={activeCount} label="activos" bg="#ecfdf5" color="#065f46" dot="#10b981" />
            <SummaryChip count={trialCount} label="trial" bg="#eef2ff" color="#3730a3" dot="#6366f1" />
            <SummaryChip count={suspendedCount} label="suspendido" bg="#fef2f2" color="#991b1b" dot="#ef4444" />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-[780px] mx-auto space-y-4">

          {restaurants.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E2E4EC] bg-white py-16 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-6 h-6 text-[#4C63FC]" />
              </div>
              <p className="text-sm font-semibold text-[#444A60]">Sin restaurantes con QR Menu</p>
              <p className="mt-1 text-xs text-[#7B8099]">
                Añade QR Menu a una organización desde su página de detalle.
              </p>
              <Link
                href="/organizations"
                className="mt-5 text-sm font-semibold text-[#4C63FC] hover:text-[#3A50E8] transition-colors"
              >
                Ir a organizaciones →
              </Link>
            </div>
          ) : (
            <div
              className="bg-white rounded-[14px] border border-[#E2E4EC] overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="border-b border-[#E2E4EC] px-4 sm:px-6 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B8099]">
                  {restaurants.length} restaurante{restaurants.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="divide-y divide-[#F0F1F5]">
                {restaurants.map((restaurant) => {
                  const s = STATUS_MAP[restaurant.status] ?? { color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: restaurant.status };
                  return (
                    <div
                      key={restaurant.orgId}
                      className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-[#F8F9FB] transition-colors group"
                    >
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C0C4D6] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/organizations/${restaurant.orgId}`}
                          className="text-sm font-semibold text-[#111318] group-hover:text-[#4C63FC] transition-colors truncate block"
                        >
                          {restaurant.orgName}
                        </Link>
                        <p className="text-xs font-mono text-[#7B8099] mt-0.5 hidden sm:block truncate">
                          @{restaurant.orgSlug}
                        </p>
                      </div>
                      {restaurant.planId && (
                        <span className="text-xs text-[#7B8099] hidden sm:block flex-shrink-0">
                          {PLAN_LABEL[restaurant.planId] ?? restaurant.planId}
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0"
                        style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                        {s.label}
                      </span>
                      <div className="hidden sm:block flex-shrink-0">
                        <form action={handleManage.bind(null, restaurant.orgId)}>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded-[11px] border border-[#E2E4EC] bg-white px-3 py-1.5 text-xs font-medium text-[#444A60] hover:border-[#4C63FC] hover:text-[#4C63FC] transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            Gestionar menú
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
