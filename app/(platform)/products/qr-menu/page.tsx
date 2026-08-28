import { QrCode, Building2, ChevronLeft, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  listQrMenuRestaurants,
  getAdminSessionUrl,
  isQrMenuAvailable,
} from "./actions";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  trial: "bg-indigo-50 text-indigo-700 border-indigo-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  trial: "Trial",
  suspended: "Suspendido",
};

const PLAN_LABEL: Record<string, string> = {
  basic: "Básico",
  pro: "Pro",
};

async function handleManage(orgId: string) {
  "use server";
  const url = await getAdminSessionUrl(orgId);
  redirect(url);
}

export default async function QrMenuPage() {
  const restaurants = await listQrMenuRestaurants().catch(() => []);
  const apiAvailable = await isQrMenuAvailable();

  const activeCount = restaurants.filter((r) => r.status === "active").length;
  const trialCount = restaurants.filter((r) => r.status === "trial").length;
  const suspendedCount = restaurants.filter((r) => r.status === "suspended").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors w-fit"
          >
            <ChevronLeft className="h-3 w-3" />
            Productos
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
              <QrCode className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">QR Menu</h1>
              <p className="text-sm text-zinc-500">
                Restaurantes con QR Menu activo en la plataforma.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 text-xs font-medium">
              {activeCount} activo{activeCount !== 1 ? "s" : ""}
            </span>
          )}
          {trialCount > 0 && (
            <span className="rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-0.5 text-xs font-medium">
              {trialCount} trial
            </span>
          )}
          {suspendedCount > 0 && (
            <span className="rounded-full border bg-red-50 text-red-700 border-red-200 px-2.5 py-0.5 text-xs font-medium">
              {suspendedCount} suspendido{suspendedCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Aviso si API no disponible */}
      {!apiAvailable && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <QrCode className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              QR Menu API no configurada
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              La gestión de menús estará disponible una vez que se configure{" "}
              <code className="font-mono">QRMENU_API_URL</code> en el entorno.
            </p>
          </div>
        </div>
      )}

      {/* Lista de restaurantes */}
      {restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center">
          <UtensilsCrossed className="h-8 w-8 text-zinc-400 mb-3" />
          <p className="text-sm font-medium text-zinc-600">
            Sin restaurantes con QR Menu
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Añade QR Menu a una organización desde su página de detalle.
          </p>
          <Link
            href="/organizations"
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            Ir a organizaciones →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.orgId}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-100">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <div>
                    <Link
                      href={`/organizations/${restaurant.orgId}`}
                      className="text-sm font-medium text-zinc-900 hover:text-indigo-600 transition-colors"
                    >
                      {restaurant.orgName}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-zinc-400">{restaurant.orgSlug}</p>
                      {restaurant.planId && (
                        <>
                          <span className="text-zinc-300">·</span>
                          <p className="text-xs text-zinc-400">
                            Plan {PLAN_LABEL[restaurant.planId] ?? restaurant.planId}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[restaurant.status] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"}`}
                  >
                    {STATUS_LABEL[restaurant.status] ?? restaurant.status}
                  </span>

                  {apiAvailable ? (
                    <form
                      action={handleManage.bind(null, restaurant.orgId)}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        <QrCode className="h-3 w-3" />
                        Gestionar menú
                      </button>
                    </form>
                  ) : (
                    <button
                      disabled
                      title="Configura QRMENU_API_URL para habilitar esta acción"
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-400 cursor-not-allowed"
                    >
                      <QrCode className="h-3 w-3" />
                      Gestionar menú
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
