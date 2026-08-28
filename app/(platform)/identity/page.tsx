import { auth } from "@/lib/auth";
import { Users } from "lucide-react";
import { UserTable, type UserRow } from "./UserTable";
import { CreateUserButton } from "./CreateUserButton";

const API_URL = process.env.XPLENDER_AUTH_URL ?? "http://localhost:8080";

async function fetchUsers(token: string): Promise<UserRow[]> {
  const res = await fetch(`${API_URL}/api/v1/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function IdentityPage() {
  const session = await auth();
  const token = session?.accessToken;
  const callerRole = session?.xplenderRole ?? "";

  const users = token ? await fetchUsers(token) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Identidad</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Gestiona los usuarios y sus niveles de acceso.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 shadow-sm">
            <Users className="h-4 w-4 text-zinc-400" />
            <span>{users.length} {users.length === 1 ? "usuario" : "usuarios"}</span>
          </div>
          {(callerRole === "xplender:owner" || callerRole === "xplender:admin") && (
            <CreateUserButton callerRole={callerRole} />
          )}
        </div>
      </div>

      {/* Tabla */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center">
          <Users className="h-8 w-8 text-zinc-400 mb-3" />
          <p className="text-sm font-medium text-zinc-600">Sin usuarios</p>
          <p className="mt-1 text-xs text-zinc-400">
            No hay usuarios disponibles para mostrar.
          </p>
        </div>
      ) : (
        <UserTable users={users} callerRole={callerRole} />
      )}
    </div>
  );
}
