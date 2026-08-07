"use client";

import { usePathname } from "next/navigation";
import AdminBottomNav from "./AdminBottomNav";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideBottomNav = pathname === "/Login" || pathname === "/login";

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="pb-24">{children}</div>
      {!hideBottomNav && <AdminBottomNav />}
    </div>
  );
}
