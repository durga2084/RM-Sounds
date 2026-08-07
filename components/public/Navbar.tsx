import Link from "next/link";
import Image from "next/image";
import { Calendar, Mail } from "lucide-react";
import { RMSoundsLogo } from "@/app/(client)/1constants/Images";

export default function Navbar() {
  return (
    <div className="w-full sticky top-0 z-50 px-2 pt-4 pb-2 bg-gradient-to-b from-[#0B0F19] to-transparent">
      <nav className="max-w-7xl mx-auto bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 text-white px-4 py-3 flex items-center justify-between rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Left button */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/Calendar"
            className="relative px-2 py-2.5 text-xs font-bold text-white/90 rounded-xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#4158D0] bg-[length:200%_auto] border border-white/20 shadow-[0_0_15px_rgba(65,88,208,0.4)] transition-all duration-300 flex items-center gap-1.5 
            animate-gradient-flow
            hover:shadow-[0_0_25px_rgba(65,88,208,0.8)] hover:scale-105 hover:border-white/40
            active:scale-95 active:shadow-[0_0_10px_rgba(65,88,208,0.2)]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center min-w-0">
          <Link
            href="/"
            className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105 w-full max-w-[160px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[320px] xl:max-w-[400px] h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16"
          >
            <Image
              src={RMSoundsLogo}
              alt="RM Sounds Logo"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 160px, (max-width: 768px) 200px, (max-width: 1024px) 260px, (max-width: 1280px) 320px, 400px"
            />
          </Link>
        </div>

        {/* Right button */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/ContactUs"
            className="relative px-2 py-2.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#FF512F] bg-[length:200%_auto] border border-white/10 shadow-[0_0_15px_rgba(255,81,47,0.4)] transition-all duration-300 flex items-center gap-1.5
            animate-gradient-flow
            hover:shadow-[0_0_25px_rgba(255,81,47,0.8)] hover:scale-105 hover:border-white/30
            active:scale-95 active:shadow-[0_0_10px_rgba(255,81,47,0.2)]"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
