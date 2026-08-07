import Image from "next/image";
import { ExploreSystems } from "@/app/(client)/1constants/Images";

const SYSTEM_CATEGORIES = [
  {
    title: "Professional Z Sound Systems",
    subtitle: "Massive festival-grade audio rigs built for powerful crowd delivery.",
    description:
      "Our Z Sound category is engineered for events that demand tight bass, crystal-clear mids, and soaring vocal projection. These rigs are tuned for high-output performance without harshness, making them ideal for weddings, concerts, and roadshows.",
    highlights: [
      "High-output line-array speakers and subwoofers",
      "Precision DSP tuning for clean clarity",
      "Fast setup for outdoor and indoor events",
    ],
    images: [ExploreSystems.ZSounds1, ExploreSystems.ZSounds2, ExploreSystems.ZSounds3],
    accent: "from-[#4158D0] via-[#C850C0] to-[#FF512F]",
  },
  {
    title: "Road Show & Outdoor Production",
    subtitle: "Heavy-duty systems designed for roadshow stages and mobile event productions.",
    description:
      "Road show equipment in this category includes rugged speaker towers, touring amplifiers, and pro lighting infrastructure. It is built to perform consistently across long routes, harsh venues, and demanding crowd sizes.",
    highlights: [
      "Portable stage-ready setups",
      "Durable excursion speakers and sub systems",
      "Optimized for large-area coverage",
    ],
    images: [ExploreSystems.RoadShow1, ExploreSystems.RoadShow2, ExploreSystems.RoadShow3],
    accent: "from-[#FF512F] via-[#DD2476] to-[#FF512F]",
  },
  {
    title: "Speakers & Amplifiers",
    subtitle: "Premium sound stacks with unmatched clarity and punch.",
    description:
      "Our speaker and amplifier packages combine high-output transducers with efficient power delivery, giving every performance a sharp, defined soundstage. This category is perfect for weddings, corporate events, and live concerts.",
    highlights: [
      "Low distortion with powerful headroom",
      "True-to-source musical fidelity",
      "Balanced coverage for any venue size",
    ],
    images: [ExploreSystems.SpeakerAmplifier1, ExploreSystems.SpeakerAmplifier2, ExploreSystems.SpeakerAmplifier3],
    accent: "from-[#22C55E] via-[#4158D0] to-[#22C55E]",
  },
  {
    title: "LED Screens & Visual Systems",
    subtitle: "High-impact display walls engineered for crisp visuals and bright color.",
    description:
      "This category covers LED panels and support systems tailored for immersive stage visuals, brand messaging, and audience engagement. Our LED walls deliver vivid imagery even in bright daylight or dramatic indoor environments.",
    highlights: [
      "Ultra-bright, high-contrast displays",
      "Fast refresh rates for camera-ready visuals",
      "Modular setup for any stage layout",
    ],
    images: [ExploreSystems.LEDScreens1, ExploreSystems.LEDScreens2, ExploreSystems.LEDScreens3],
    accent: "from-[#4158D0] via-[#C850C0] to-[#22C55E]",
  },
];

export default function ExploreSystemsPage() {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-[#C850C0]/40 bg-[#C850C0]/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-[#C850C0]">
              Explore Systems
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Equipment Designed for Massive Sound, Lighting, and Visual Impact
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
              Discover our category-by-category system briefing with three standout images per package. Every setup is curated to be highly visible, event-ready, and built for professional-grade performance.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-[#0D1222]/80 p-5 text-center border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[#A5B4FC]">Z Sound</p>
              <p className="mt-3 text-2xl font-black">Bass & Clarity</p>
            </div>
            <div className="rounded-3xl bg-[#0D1222]/80 p-5 text-center border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[#FB7185]">Road Show</p>
              <p className="mt-3 text-2xl font-black">Tour-Ready</p>
            </div>
            <div className="rounded-3xl bg-[#0D1222]/80 p-5 text-center border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[#34D399]">Speakers</p>
              <p className="mt-3 text-2xl font-black">Power & Precision</p>
            </div>
            <div className="rounded-3xl bg-[#0D1222]/80 p-5 text-center border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[#818CF8]">LED Systems</p>
              <p className="mt-3 text-2xl font-black">Visual Impact</p>
            </div>
          </div>
        </section>

        <div className="mt-12 space-y-12">
          {SYSTEM_CATEGORIES.map((category) => (
            <section
              key={category.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl"
            >
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#111827]/80 px-4 py-2 text-sm font-semibold text-white/80">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F]" />
                    Featured Category
                  </div>
                  <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {category.title}
                  </h2>
                  <p className="mt-4 text-gray-300 leading-8">{category.subtitle}</p>

                  <div className="mt-8 space-y-4">
                    <p className="text-gray-300">{category.description}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {category.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="rounded-3xl border border-white/10 bg-[#111827] px-4 py-4"
                        >
                          <p className="text-sm font-semibold text-white">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {category.images.map((src, index) => (
                    <div
                      key={`${category.title}-${index}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0B0F19]/80 shadow-[0_20px_45px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={src}
                          alt={`${category.title} ${index + 1}`}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
