import { auth } from "@/lib/auth";
import {
  getDashboardStats,
  listOrganizations,
} from "@/app/(platform)/organizations/actions";
import Link from "next/link";
import { OrgTableRow } from "./OrgTableRow";
import {
  BuildingIcon,
  BuildingCheckIcon,
  UsersIcon,
  BellIcon,
  PackageIcon,
  BarChartIcon,
  ShieldIcon,
  ArrowRightIcon,
  PlusIcon,
} from "@/components/layout/nav-icons";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  bgAccent,
  icon,
  trend,
  trendUp,
}: {
  label: string;
  value: number | string;
  accent: string;
  bgAccent: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div
      className="bg-white rounded-[14px] border border-[#E2E4EC] p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between">
        <div className="pl-3">
          <p className="text-sm font-medium text-[#7B8099]">{label}</p>
          <p
            className="text-[42px] leading-tight mt-1 tabular-nums tracking-tight text-[#111318]"
            style={{ fontWeight: 800 }}
          >
            {value}
          </p>
          {trend && (
            <p
              className="text-xs font-medium mt-1"
              style={{ color: trendUp ? "#10B981" : "#EF4444" }}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: bgAccent, color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Action Card ───────────────────────────────────────────────────────────────

function ActionCard({
  title,
  subtitle,
  accent,
  bgAccent,
  icon,
  href,
}: {
  title: string;
  subtitle: string;
  accent: string;
  bgAccent: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-[14px] border border-[#E2E4EC] px-5 py-4 flex items-center gap-4 w-full text-left group hover:shadow-lg hover:-translate-y-0.5 hover:border-[#C8CDE0] transition-all duration-200"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: bgAccent, color: accent }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111318] leading-snug">{title}</p>
        <p className="text-xs text-[#7B8099] mt-0.5 leading-snug">{subtitle}</p>
      </div>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
        style={{ backgroundColor: bgAccent, color: accent }}
      >
        <ArrowRightIcon className="w-4 h-4" />
      </div>
    </Link>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  memberCount: number;
  productCount: number;
  createdAt: string;
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "usuario";
  const firstName = name.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const [statsData, allOrgs] = await Promise.all([
    getDashboardStats().catch(() => null),
    (listOrganizations() as Promise<OrgSummary[]>).catch(() => [] as OrgSummary[]),
  ]);

  const recentOrgs = allOrgs.slice(0, 5);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <header className="bg-white border-b border-[#E2E4EC] px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[26px] font-bold text-[#111318] leading-tight tracking-tight">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm text-[#7B8099] mt-0.5 font-medium capitalize">
            Panel de control · {formatDate()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#7B8099] hover:bg-[#F4F5F7] hover:text-[#111318] transition-colors duration-150">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4C63FC] border-2 border-white" />
          </div>
          <div className="w-10 h-10 rounded-full bg-[#4C63FC] flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-150">
            <span className="text-white text-base font-bold">{initial}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[1000px] mx-auto space-y-8">

          {/* Stats */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B8099] mb-4">
              Resumen general
            </p>
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Organizaciones"
                value={statsData?.totalOrgs ?? "—"}
                accent="#7C3AED"
                bgAccent="#F5F3FF"
                icon={<BuildingIcon className="w-5 h-5" />}
              />
              <StatCard
                label="Orgs activas"
                value={statsData?.activeOrgs ?? "—"}
                accent="#4C63FC"
                bgAccent="#EEF2FF"
                icon={<BuildingCheckIcon className="w-5 h-5" />}
              />
              <StatCard
                label="Usuarios totales"
                value={statsData?.totalUsers ?? "—"}
                accent="#0284C7"
                bgAccent="#E0F2FE"
                icon={<UsersIcon className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B8099] mb-4">
              Acciones rápidas
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ActionCard
                title="Crear organización"
                subtitle="Registrar un nuevo cliente en la plataforma"
                accent="#7C3AED"
                bgAccent="#F5F3FF"
                icon={<PlusIcon className="w-5 h-5" />}
                href="/organizations"
              />
              <ActionCard
                title="Añadir producto"
                subtitle="Asignar un producto a una organización"
                accent="#4C63FC"
                bgAccent="#EEF2FF"
                icon={<PackageIcon className="w-5 h-5" />}
                href="/products"
              />
              <ActionCard
                title="Ver analíticas"
                subtitle="Consultar métricas de uso y actividad"
                accent="#059669"
                bgAccent="#ECFDF5"
                icon={<BarChartIcon className="w-5 h-5" />}
                href="/analytics"
              />
              <ActionCard
                title="Administrar accesos"
                subtitle="Gestionar roles y permisos de usuarios"
                accent="#D97706"
                bgAccent="#FFFBEB"
                icon={<ShieldIcon className="w-5 h-5" />}
                href="/identity"
              />
            </div>
          </section>

          {/* Orgs table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7B8099]">
                Organizaciones
              </p>
              <Link
                href="/organizations"
                className="text-xs font-semibold text-[#4C63FC] hover:text-[#3A50E8] transition-colors"
              >
                Ver todas →
              </Link>
            </div>
            <div
              className="bg-white rounded-[14px] border border-[#E2E4EC] overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {recentOrgs.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#7B8099]">
                  Sin organizaciones todavía.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E4EC]">
                      {["Nombre", "Usuarios", "Estado", "Alta"].map((h, i) => (
                        <th
                          key={h}
                          className={`text-[10px] font-semibold uppercase tracking-wider text-[#7B8099] py-3 px-4 ${i === 0 ? "pl-6" : ""} ${i === 3 ? "pr-6 text-right" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrgs.map((org) => (
                      <OrgTableRow key={org.id} org={org} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
