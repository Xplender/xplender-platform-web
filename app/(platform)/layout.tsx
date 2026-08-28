import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { InactivityGuard } from "@/components/InactivityGuard";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user;

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      <Sidebar
        userName={user?.name ?? undefined}
        userEmail={user?.email ?? undefined}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </div>
      <InactivityGuard />
    </div>
  );
}
