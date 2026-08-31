import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

type ProductClaim = { id: string; adminUrl: string };
type OrgClaim = { id: string; slug: string; role: string; products: ProductClaim[] };

function decodeOrgs(accessToken: string): OrgClaim[] {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64url").toString()
    );
    return payload.orgs ?? [];
  } catch {
    return [];
  }
}

const PRODUCT_NAMES: Record<string, string> = {
  "qr-menu": "QR Menu",
};

export default async function PortalPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Los roles internos no deberían llegar aquí — los redirigimos al panel
  const internalRoles = ["xplender:owner", "xplender:admin", "xplender:support"];
  if (internalRoles.includes(session.xplenderRole ?? "")) redirect("/dashboard");

  const orgs = decodeOrgs(session.accessToken ?? "");
  const allProducts = orgs.flatMap((org) =>
    org.products.map((p) => ({ ...p, orgSlug: org.slug }))
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#111318]">Xplender</h1>
          <p className="text-sm text-[#7B8099] mt-1">
            Selecciona el producto al que deseas acceder
          </p>
        </div>

        {allProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E4EC] p-8 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p className="text-sm font-semibold text-[#444A60]">Sin productos activos</p>
            <p className="text-xs text-[#7B8099] mt-1">
              Contacta al administrador para activar tu suscripción.
            </p>
          </div>
        ) : (
          allProducts.map((p) => (
            <a
              key={p.id + p.orgSlug}
              href={p.adminUrl}
              className="flex items-center gap-4 bg-white rounded-2xl border border-[#E2E4EC] px-5 py-4 hover:border-[#4C63FC] hover:shadow-md transition-all group"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                <span className="text-[#4C63FC] font-bold text-sm">
                  {(PRODUCT_NAMES[p.id] ?? p.id).slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111318] group-hover:text-[#4C63FC] transition-colors">
                  {PRODUCT_NAMES[p.id] ?? p.id}
                </p>
                <p className="text-xs text-[#7B8099] truncate">@{p.orgSlug}</p>
              </div>
              <svg className="w-4 h-4 text-[#7B8099] group-hover:text-[#4C63FC] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))
        )}

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="pt-4 text-center"
        >
          <button
            type="submit"
            className="text-xs text-[#7B8099] hover:text-[#444A60] transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
