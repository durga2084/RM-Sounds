"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Images, CalendarDays, Mail } from "lucide-react";

const navItems = [
  {
    href: "/",
    icon: House,
  },
  {
    href: "/GalleryImages",
    icon: Images,
  },
  {
    href: "/Calendar",
    icon: CalendarDays,
  },
  {
    href: "/ContactUs",
    icon: Mail,
  },
] as const;

const MobileBottomNav = memo(function MobileBottomNav() {
  const pathname = usePathname();

  const activePathMap = useMemo(
    () =>
      navItems.reduce<Record<string, boolean>>((accumulator, { href }) => {
        accumulator[href] = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return accumulator;
      }, {}),
    [pathname],
  );

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[10000] md:hidden pointer-events-auto">
      <nav className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/85 backdrop-blur-xl px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
        {navItems.map(({ href, icon: Icon }) => {
          const active = activePathMap[href];

          return (
            <Link
              key={href}
              href={href}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] text-white shadow-[0_0_12px_rgba(200,80,192,0.45)] scale-105"
                  : "text-white/60 hover:text-white hover:bg-white/5 active:scale-95"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
});

export default MobileBottomNav;
