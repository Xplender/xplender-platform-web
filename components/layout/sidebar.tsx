"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ZapIcon,
  HomeIcon,
  UserIcon,
  BuildingIcon,
  PackageIcon,
  BarChartIcon,
  BellIcon,
  CreditCardIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
} from "./nav-icons";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: <HomeIcon className="w-5 h-5" /> },
  { path: "/users", label: "Usuarios", icon: <UserIcon className="w-5 h-5" /> },
  { path: "/organizations", label: "Organizaciones", icon: <BuildingIcon className="w-5 h-5" /> },
  { path: "/products", label: "Productos", icon: <PackageIcon className="w-5 h-5" /> },
  { path: "/analytics", label: "Analíticas", icon: <BarChartIcon className="w-5 h-5" /> },
  { path: "/notifications", label: "Notificaciones", icon: <BellIcon className="w-5 h-5" /> },
  { path: "/billing", label: "Facturación", icon: <CreditCardIcon className="w-5 h-5" /> },
  { path: "/settings", label: "Ajustes", icon: <SettingsIcon className="w-5 h-5" /> },
];

const SECTION_DIVIDERS: Record<number, string> = {
  4: "Sistema",
};

export function Sidebar({
  userName,
  userEmail,
}: {
  userName?: string;
  userEmail?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const displayName = userName ?? userEmail ?? "Usuario";
  const initial = displayName.charAt(0).toUpperCase();

  function isActive(path: string) {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname === path || pathname.startsWith(path + "/");
  }

  return (
    <aside
      className="flex flex-col bg-white border-r border-[#E2E4EC] flex-shrink-0 transition-all duration-200 ease-in-out"
      style={{ width: collapsed ? 60 : 240 }}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-[#E2E4EC] flex-shrink-0 ${
          collapsed ? "justify-center px-0 py-4" : "px-5 py-4 gap-2.5"
        }`}
        style={{ height: 64 }}
      >
        <div className="w-8 h-8 rounded-lg bg-[#4C63FC] flex items-center justify-center flex-shrink-0">
          <ZapIcon className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm text-[#111318] leading-none font-bold">
              Xplender
            </p>
            <p className="text-[10px] text-[#7B8099] mt-0.5 leading-none">
              Platform Admin
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item, i) => {
          const divider = SECTION_DIVIDERS[i];
          const active = isActive(item.path);
          return (
            <div key={item.path}>
              {divider && !collapsed && (
                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#7B8099]">
                  {divider}
                </p>
              )}
              {divider && collapsed && (
                <div className="my-2 mx-auto w-5 border-t border-[#E2E4EC]" />
              )}
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-[10px] transition-all duration-150 group relative ${
                  collapsed
                    ? "justify-center px-0 py-2.5 w-full"
                    : "px-3 py-2.5 w-full"
                } ${
                  active
                    ? "bg-[#4C63FC]/10 text-[#4C63FC]"
                    : "text-[#7B8099] hover:bg-[#F4F5F7] hover:text-[#111318]"
                }`}
              >
                <span className={`flex-shrink-0 ${active ? "text-[#4C63FC]" : ""}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4C63FC]" />
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#111318] text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E2E4EC] px-2 py-3 flex-shrink-0 space-y-2">
        {/* Toggle collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 text-[#7B8099] hover:text-[#111318] hover:bg-[#F4F5F7] rounded-[10px] transition-all duration-150 cursor-pointer ${
            collapsed
              ? "justify-center w-full py-2"
              : "w-full px-3 py-2 text-xs font-medium"
          }`}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>

        {/* User / version */}
        {!collapsed ? (
          <div className="flex items-center justify-between px-3 py-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#4C63FC] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{initial}</span>
              </div>
              <span className="text-xs font-semibold text-[#111318] truncate">
                {displayName.split(" ")[0]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-[#7B8099] font-mono bg-[#F4F5F7] px-1.5 py-0.5 rounded-md">
                v1.0.0
              </span>
              <a
                href="/api/signout"
                title="Cerrar sesión"
                className="text-[#7B8099] hover:text-[#111318] transition-colors"
              >
                <LogOutIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="text-[9px] text-[#7B8099] font-mono">v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
