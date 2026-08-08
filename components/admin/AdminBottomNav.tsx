"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  MapPin,
  PartyPopper,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminAuthAPI } from "@/app/(admin)/1constants/API_AdminAuth";

const navItems = [
  {
    label: "Dashboard",
    href: "/Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Gallery",
    href: "/Gallery",
    icon: Images,
  },
  {
    label: "Locations",
    href: "/Locations",
    icon: MapPin,
  },
  {
    label: "Types",
    href: "/EventTypes",
    icon: PartyPopper,
  },
];

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        localStorage.removeItem("AdminToken");
        localStorage.removeItem("AdminUser");
        router.push("/Login");
        return;
      }

      const res = await fetch(AdminAuthAPI.Logout, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      console.log("Logout response:", json);

      localStorage.removeItem("AdminToken");
      localStorage.removeItem("AdminUser");
      document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      router.push("/Login");
    } catch (err) {
      console.error("Logout error", err);
      localStorage.removeItem("AdminToken");
      localStorage.removeItem("AdminUser");
      document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      router.push("/Login");
    }
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-24px)] max-w-xl -translate-x-1/2">
      <div
        className="
          rounded-full
          border border-white/10
          bg-[#0f172a]/90
          backdrop-blur-xl
          shadow-[0_20px_60px_rgba(0,0,0,.55)]
          px-2
          py-2
        "
      >
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  py-2
                  transition-all
                  duration-300

                  ${
                    active
                      ? "bg-gradient-to-r from-[#4158D0] to-[#C850C0] text-white shadow-lg scale-105"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon
                  className={`
                    h-5
                    w-5
                    transition-transform
                    duration-300
                    ${active ? "" : "group-hover:-translate-y-0.5"}
                  `}
                />

                <span className="mt-1 text-[10px] font-semibold">
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`group flex flex-col items-center justify-center rounded-2xl py-2 text-gray-400 hover:bg-white/5 hover:text-white`}
          >
            <LogOut className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
