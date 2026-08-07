"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasAdminSession } from "@/lib/adminSession";

export default function AdminAuthRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/Login" || pathname === "/login") {
      if (hasAdminSession()) {
        router.replace("/Dashboard");
      }
    }
  }, [pathname, router]);

  return null;
}
