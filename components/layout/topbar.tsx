import { auth } from "@/lib/auth";
import { Bell, LogOut } from "lucide-react";

export async function Topbar() {
  const session = await auth();
  const user = session?.user;
  const name = user?.name ?? user?.email ?? "Usuario";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Panel de control</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 select-none">
            {initials || "X"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 leading-none">{name}</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-none">{user?.email ?? ""}</p>
          </div>
        </div>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        <a
          href="/api/signout"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </a>
      </div>
    </header>
  );
}
