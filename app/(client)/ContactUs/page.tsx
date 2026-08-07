"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactDetailsAPI } from "@/app/(client)/1constants/API_ContactDetails";

type Location = {
  LocationID: number;
  LocationManager?: string | null;
  ContactNumber?: string | null;
  ContactEmail?: string | null;
  FullAddress?: string | null;
  GoogleMapEmbedUrl?: string | null;
  LocationType?: string | null;
};

export default function ContactPage() {
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadContacts() {
      try {
        setLoadingContacts(true);

        const res = await fetch(ContactDetailsAPI.GetContactDetails, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ PageNumber: 1, PageSize: 10 }),
        });

        const json = await res.json();

        if (!ignore && json?.success) {
          setLocations(json.data || []);
        }
      } catch (err) {
        console.error("Fetch contact details error:", err);
      } finally {
        if (!ignore) setLoadingContacts(false);
      }
    }

    loadContacts();

    return () => {
      ignore = true;
    };
  }, []);

  const primary = locations && locations.length > 0 ? locations[0] : null;

  return (
    <main className="min-h-screen bg-[#0B0F19] px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[4px] text-[#C850C0]">
            Contact RM Sounds
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Lets Make Your Event Unforgettable
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-gray-400 leading-7">
            Planning a wedding, DJ night, concert, political meeting, road show,
            or corporate event? Get in touch with RM Sounds for premium sound
            systems, LED display walls, lighting, and complete event production
            solutions.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <h2 className="mb-8 text-2xl font-black">Contact Information</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F]">
                  <MapPin className="h-6 w-6 text-white" strokeWidth={2.3} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold">Business Address</h3>

                  {loadingContacts ? (
                    <p className="mt-2 leading-7 text-gray-400">Loading...</p>
                  ) : primary?.FullAddress ? (
                    <p className="mt-2 leading-7 text-gray-400 whitespace-pre-line break-words">
                      {primary.FullAddress}
                    </p>
                  ) : (
                    <p className="mt-2 leading-7 text-gray-400">
                      RM Sounds
                      <br />
                      Maha Lakshmipuram
                      <br />
                      Beside Tea Hub
                      <br />
                      Jangareddygudem - Eluru Road
                      <br />
                      Eluru District
                      <br />
                      Andhra Pradesh, India
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                  <Phone className="h-6 w-6 text-white" strokeWidth={2.3} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold">Phone Number</h3>

                  <a
                    href={
                      primary?.ContactNumber
                        ? `tel:${primary.ContactNumber}`
                        : "tel:+919912657338"
                    }
                    className="mt-2 inline-block text-gray-300 transition hover:text-white"
                  >
                    {primary?.ContactNumber || "+91 99126 57338"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#4158D0] to-[#22C55E]">
                  <Mail className="h-6 w-6 text-white" strokeWidth={2.3} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold">Email Address</h3>

                  <a
                    href={
                      primary?.ContactEmail
                        ? `mailto:${primary.ContactEmail}`
                        : "mailto:durgaprasad1846@gmail.com"
                    }
                    className="mt-2 inline-block text-gray-300 transition hover:text-white break-all"
                  >
                    {primary?.ContactEmail || "durgaprasad1846@gmail.com"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#4158D0]">
                  <Clock className="h-6 w-6 text-white" strokeWidth={2.3} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold">Working Hours</h3>

                  <p className="mt-2 leading-7 text-gray-400">
                    Monday - Sunday
                    <br />
                    9:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={
                  primary?.ContactNumber
                    ? `tel:${primary.ContactNumber}`
                    : "tel:+919912657338"
                }
                className="flex-1 rounded-xl bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#FF512F] px-6 py-4 text-center font-bold transition duration-300 hover:scale-105"
              >
                Call Now
              </a>

              <Link
                href="/Calendar"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center font-bold transition duration-300 hover:scale-105 hover:bg-white/10"
              >
                <Calendar size={18} />
                Check Availability
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <iframe
              title="RM Sounds Location"
              src={
                primary?.GoogleMapEmbedUrl
                  ? primary.GoogleMapEmbedUrl
                  : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3327.677903624252!2d81.23819407450597!3d17.05243978377873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a365f0063468f49%3A0x488cee3c55516060!2sRM%20Sounds!5e1!3m2!1sen!2sin!4v1782963251136!5m2!1sen!2sin"
              }
              width="100%"
              height="100%"
              className="min-h-[300px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-[#4158D0]/10 via-[#C850C0]/10 to-[#FF512F]/10 p-10 text-center backdrop-blur-xl">
          <h2 className="text-3xl font-black">Ready to Book RM Sounds?</h2>

          <p className="mx-auto mt-5 max-w-3xl leading-7 text-gray-400">
            Whether its a wedding, concert, DJ event, political campaign, road
            show, or corporate event, we deliver premium audio systems, LED
            display walls, lighting, and complete event production with
            professional support.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="tel:+919912657338"
              className="rounded-xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] px-8 py-4 font-bold transition duration-300 hover:scale-105"
            >
              Call RM Sounds
            </a>

            <Link
              href="/Calendar"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-bold transition duration-300 hover:scale-105 hover:bg-white/10"
            >
              Book Your Date
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
