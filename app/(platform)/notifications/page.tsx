import { BellIcon } from "@/components/layout/nav-icons";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-[#E2E4EC] px-8 py-5 flex-shrink-0">
        <h1 className="text-xl font-bold text-[#111318]">Notificaciones</h1>
        <p className="text-sm text-[#7B8099] mt-0.5">Panel de administración</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#E2E4EC] flex items-center justify-center text-[#C0C4D6] mx-auto mb-6">
            <BellIcon className="w-12 h-12" />
          </div>
          <h2 className="text-lg font-bold text-[#111318]">Próximamente</h2>
          <p className="text-sm text-[#7B8099] mt-2 leading-relaxed">
            Esta sección estará disponible en una próxima versión.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center text-xs font-medium text-[#7B8099] bg-[#F4F5F7] px-3 py-1.5 rounded-full">
              En desarrollo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
