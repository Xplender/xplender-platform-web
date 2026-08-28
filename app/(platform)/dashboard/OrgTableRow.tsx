"use client";

import { useRouter } from "next/navigation";

type OrgRow = {
  id: string;
  name: string;
  memberCount: number;
  status: string;
  createdAt: string;
};

const STATUS_MAP: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  active:    { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", dot: "#10b981", label: "Activo" },
  trial:     { color: "#3730a3", bg: "#eef2ff", border: "#c7d2fe", dot: "#6366f1", label: "Trial" },
  suspended: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Suspendido" },
};

export function OrgTableRow({ org }: { org: OrgRow }) {
  const router = useRouter();
  const s = STATUS_MAP[org.status] ?? STATUS_MAP.trial;

  const initials = org.name.slice(0, 2).toUpperCase();

  const joined = org.createdAt
    ? new Date(org.createdAt).toLocaleDateString("es-MX", { month: "short", year: "numeric" })
    : "—";

  return (
    <tr
      className="border-b border-[#F0F1F5] last:border-0 hover:bg-[#F8F9FB] transition-colors duration-100 cursor-pointer"
      onClick={() => router.push(`/organizations/${org.id}`)}
    >
      <td className="py-3.5 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-xs font-bold text-[#4C63FC] flex-shrink-0">
            {initials}
          </div>
          <p className="text-sm font-semibold text-[#111318]">{org.name}</p>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className="text-sm text-[#444A60] tabular-nums font-medium">{org.memberCount}</span>
      </td>
      <td className="py-3.5 px-4">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
          {s.label}
        </span>
      </td>
      <td className="py-3.5 px-4 pr-6 text-right">
        <span className="text-xs text-[#7B8099]">{joined}</span>
      </td>
    </tr>
  );
}
