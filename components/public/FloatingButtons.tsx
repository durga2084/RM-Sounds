"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, CalendarPlus } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { WhatsappNumberAPI } from "@/app/(client)/1constants/API_WhatsappNumber";

const whatsappNumberCache = {
  promise: null as Promise<string | null> | null,
  value: null as string | null,
};

const BookingModal = dynamic(() => import("./BookingModal"), {
  ssr: false,
  loading: () => null,
});

const FloatingButtons = memo(function FloatingButtons() {
  const pathname = usePathname();
  const router = useRouter();

  const [showTop, setShowTop] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNumber = async () => {
      if (whatsappNumberCache.value) {
        setWhatsappNumber(whatsappNumberCache.value);
        setLoadingWhatsapp(false);
        return;
      }

      if (whatsappNumberCache.promise) {
        try {
          const cachedNumber = await whatsappNumberCache.promise;
          if (isMounted && cachedNumber) {
            setWhatsappNumber(cachedNumber);
          }
        } finally {
          if (isMounted) {
            setLoadingWhatsapp(false);
          }
        }
        return;
      }

      whatsappNumberCache.promise = (async () => {
        try {
          const res = await fetch(WhatsappNumberAPI.GetWhatsappNumber, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });

          const rawText = await res.text();

          if (!res.ok) {
            return null;
          }

          const data = JSON.parse(rawText);

          if (data.success && data.data?.WhatsappNumber) {
            whatsappNumberCache.value = data.data.WhatsappNumber;
            return data.data.WhatsappNumber;
          }

          return null;
        } catch {
          return null;
        }
      })();

      try {
        const resolvedNumber = await whatsappNumberCache.promise;
        if (isMounted && resolvedNumber) {
          setWhatsappNumber(resolvedNumber);
        }
      } finally {
        if (isMounted) {
          setLoadingWhatsapp(false);
          whatsappNumberCache.promise = null;
        }
      }
    };

    fetchNumber();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 250);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openBookingModal = useCallback(() => {
    setOpenBooking(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setOpenBooking(false);
  }, []);

  const whatsappLink = useMemo(
    () =>
      whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=Hi%20RM%20Sounds,%20I%20want%20to%20book%20an%20event.`
        : "#",
    [whatsappNumber],
  );

  return (
    <>
      {pathname !== "/" && (
        <div className="fixed left-4 bottom-24 md:bottom-6 z-[10000] pointer-events-auto">
          <button
            onClick={() => router.back()}
            aria-label="Go Back"
            className="group h-14 w-14 rounded-2xl border border-white/10 bg-[#0B0F19]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-105 hover:border-white/20 hover:bg-white/10 active:scale-95"
          >
            <ArrowLeft className="mx-auto h-6 w-6 text-white group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      )}

      <div className="fixed right-4 bottom-24 md:bottom-6 z-[10000] flex flex-col items-end gap-4 pointer-events-auto">
        {/* Scroll to top */}
        <button
          onClick={scrollToTop}
          aria-label="Scroll To Top"
          className={`h-14 w-14 rounded-2xl border border-[#4158D0]/20 bg-[#0B0F19]/85 backdrop-blur-xl shadow-[0_8px_25px_rgba(65,88,208,0.25)] transition-all duration-300 ${
            showTop
              ? "opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 translate-y-5"
          } hover:scale-105 hover:shadow-[0_0_25px_rgba(65,88,208,.5)] active:scale-95`}
        >
          <ArrowUp className="mx-auto h-6 w-6 text-[#4158D0]" />
        </button>

        {loadingWhatsapp ? (
          <div className="h-14 w-14 rounded-2xl bg-[#0B0F19]/50 backdrop-blur-xl border border-white/5 animate-pulse" />
        ) : whatsappNumber ? (
          <Link
            href={whatsappLink}
            target="_blank"
            aria-label="WhatsApp"
            className="group flex items-center justify-center h-14 w-14 rounded-2xl border border-[#25D366]/25 bg-[#0B0F19]/85 backdrop-blur-xl shadow-[0_0_20px_rgba(37,211,102,.20)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,.45)] active:scale-95"
          >
            <FaWhatsapp className="h-7 w-7 text-[#25D366]" />
          </Link>
        ) : (
          <div className="h-14 w-14 rounded-2xl bg-[#0B0F19]/50 backdrop-blur-xl border border-red-500/20 flex items-center justify-center opacity-50 cursor-not-allowed">
            <FaWhatsapp className="h-7 w-7 text-gray-500" />
          </div>
        )}

        <button
          onClick={openBookingModal}
          aria-label="Book Event"
          className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] px-5 py-4 text-white shadow-[0_0_30px_rgba(200,80,192,.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(200,80,192,.6)] active:scale-95 animate-gradient-flow"
        >
          <CalendarPlus className="h-6 w-6" />
          <span className="hidden md:block font-bold tracking-wide">
            Book Event
          </span>
        </button>
      </div>

      <BookingModal open={openBooking} onClose={closeBookingModal} />
    </>
  );
});

export default FloatingButtons;
