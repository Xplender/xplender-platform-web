import Link from "next/link";
import { listAllOrgProducts } from "@/app/(platform)/organizations/actions";
import { PackageIcon, BuildingIcon, ArrowRightIcon } from "@/components/layout/nav-icons";

// ── Product metadata ──────────────────────────────────────────────────────────

const PRODUCT_META: Record<string, { name: string; description: string; managePath?: string }> = {
  "qr-menu":        { name: "QR Menu",        description: "Menú digital con QR para restaurantes y bares",          managePath: "/products/qr-menu" },
  "qr-reservation": { name: "QR Reservation", description: "Sistema de reservas online con confirmación automática" },
  "qr-loyalty":     { name: "QR Loyalty",     description: "Programa de fidelización por puntos y recompensas" },
};

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  active:    { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", dot: "#10b981", label: "Activo" },
  trial:     { color: "#3730a3", bg: "#eef2ff", border: "#c7d2fe", dot: "#6366f1", label: "Trial" },
  suspended: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Suspendido" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

type OrgEntry = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  planId: string | null;
  status: string;
};

type ProductGroup = {
  productId: string;
  orgs: OrgEntry[];
  activeCount: number;
  trialCount: number;
  suspendedCount: number;
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductsPage() {
  const rawOrgs = await listAllOrgProducts().catch(() => []);

  // Group by productId
  const productMap = new Map<string, ProductGroup>();
  for (const org of rawOrgs) {
    for (const p of org.products) {
      if (!productMap.has(p.productId)) {
        productMap.set(p.productId, { productId: p.productId, orgs: [], activeCount: 0, trialCount: 0, suspendedCount: 0 });
      }
      const g = productMap.get(p.productId)!;
      g.orgs.push({ orgId: org.id, orgName: org.name, orgSlug: org.slug, planId: p.planId, status: p.status });
      if (p.status === "active") g.activeCount++;
      else if (p.status === "trial") g.trialCount++;
      else if (p.status === "suspended") g.suspendedCount++;
    }
  }

  const products = Array.from(productMap.values()).sort(
    (a, b) => b.activeCount - a.activeCount || a.productId.localeCompare(b.productId)
  );

  const totalDeployments = products.reduce((acc, p) => acc + p.orgs.length, 0);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-[#E2E4EC] px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#111318] leading-tight">Productos</h1>
          <p className="text-sm text-[#7B8099] mt-0.5">Productos Xplender desplegados en organizaciones</p>
        </div>
        <span className="text-sm font-semibold text-[#4C63FC] bg-[#EEF2FF] px-3 py-1.5 rounded-full">
          {totalDeployments} {totalDeployments === 1 ? "despliegue" : "despliegues"}
        </span>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[860px] mx-auto space-y-5">

          {products.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E2E4EC] bg-white py-16 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                <PackageIcon className="w-6 h-6 text-[#4C63FC]" />
              </div>
              <p className="text-sm font-semibold text-[#444A60]">Sin productos configurados</p>
              <p className="mt-1 text-xs text-[#7B8099]">
                Añade productos desde el detalle de una organización.
              </p>
              <Link
                href="/organizations"
                className="mt-5 text-sm font-semibold text-[#4C63FC] hover:text-[#3A50E8] transition-colors"
              >
                Ir a organizaciones →
              </Link>
            </div>
          ) : (
            products.map((product) => {
              const meta = PRODUCT_META[product.productId];
              const displayName = meta?.name ?? product.productId;
              const description = meta?.description ?? "";

              return (
                <div
                  key={product.productId}
                  className="bg-white rounded-[14px] border border-[#E2E4EC] overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-4 px-6 py-4 border-b border-[#F0F1F5]">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                      <PackageIcon className="w-5 h-5 text-[#4C63FC]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#111318]">{displayName}</p>
                        <span className="text-xs font-mono text-[#7B8099]">({product.productId})</span>
                      </div>
                      {description && (
                        <p className="text-xs text-[#7B8099] mt-0.5">{description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {product.activeCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                          {product.activeCount} activo{product.activeCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {product.trialCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#3730a3]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                          {product.trialCount} trial
                        </span>
                      )}
                      {product.suspendedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                          {product.suspendedCount} suspendido{product.suspendedCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {meta?.managePath && (
                        <Link
                          href={meta.managePath}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#4C63FC] hover:text-[#3A50E8] transition-colors ml-2"
                        >
                          Ver gestión
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Org list */}
                  <div className="divide-y divide-[#F0F1F5]">
                    {product.orgs.map((entry) => {
                      const s = STATUS_MAP[entry.status] ?? { color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: entry.status };
                      return (
                        <Link
                          key={entry.orgId}
                          href={`/organizations/${entry.orgId}`}
                          className="flex items-center gap-3 px-6 py-3 hover:bg-[#F8F9FB] transition-colors group"
                        >
                          <BuildingIcon className="w-4 h-4 text-[#C0C4D6] flex-shrink-0" />
                          <p className="text-sm font-medium text-[#444A60] group-hover:text-[#4C63FC] transition-colors flex-1">
                            {entry.orgName}
                          </p>
                          {entry.planId && (
                            <span className="text-xs text-[#7B8099]">{entry.planId}</span>
                          )}
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                            style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                            {s.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
