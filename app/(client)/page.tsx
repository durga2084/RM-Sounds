import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Calendar,
  Disc,
  Cpu,
  Tv,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { HeroVideo } from "@/app/(client)/1constants/Videos";
import { AboutSection } from "@/app/(client)/1constants/Images";

const SOUND_WAVE_BARS = Array.from({ length: 10 }, (_, index) => index);
const LED_DOTS = Array.from({ length: 96 }, (_, index) => index);

type ShowcaseBlockProps = {
  icon: LucideIcon;
  iconWrapClassName: string;
  title: string;
  image: string;
  alt: string;
  description: React.ReactNode;
  variant: "z-sounds" | "speakers" | "led" | "road-show";
};

function ShowcaseBlock({
  icon: Icon,
  iconWrapClassName,
  title,
  image,
  alt,
  description,
  variant,
}: ShowcaseBlockProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border ${iconWrapClassName}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-[22px] md:text-3xl font-black uppercase tracking-tight">
          {title}
        </h3>
      </div>
      <div className="relative group overflow-hidden rounded-2xl border border-white/10 aspect-square shadow-[0_15px_30px_rgba(0,0,0,0.5)] bg-[#0B0F19]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 7xl) 100vw"
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />

        {variant === "z-sounds" && (
          <>
            <div className="sound-wave">
              <div className="ring" />
              <div className="ring" />
              <div className="ring" />
              <div className="ring" />
            </div>
            <div className="eq-bars">
              {SOUND_WAVE_BARS.map((i) => (
                <div key={i} className="bar" />
              ))}
            </div>
          </>
        )}

        {variant === "speakers" && (
          <>
            <div className="sound-wave">
              <div
                className="ring"
                style={{ borderColor: "rgba(200, 80, 192, 0.2)" }}
              />
              <div
                className="ring"
                style={{ borderColor: "rgba(200, 80, 192, 0.2)" }}
              />
              <div
                className="ring"
                style={{ borderColor: "rgba(200, 80, 192, 0.2)" }}
              />
              <div
                className="ring"
                style={{ borderColor: "rgba(200, 80, 192, 0.2)" }}
              />
            </div>
            <div className="eq-bars" style={{ opacity: 0.2 }}>
              {SOUND_WAVE_BARS.map((i) => (
                <div
                  key={i}
                  className="bar"
                  style={{
                    background: "linear-gradient(to top, #C850C0, #FF512F)",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {variant === "led" && (
          <div className="led-grid">
            {LED_DOTS.map((i) => (
              <div key={i} className="dot" />
            ))}
          </div>
        )}

        {variant === "road-show" && (
          <div className="road-effect">
            <div className="road-lines" />
            <div
              className="road-lines"
              style={{ bottom: "25%", animationDuration: "4s" }}
            />
          </div>
        )}
      </div>
      <p className="text-gray-400 font-medium leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#0B0F19] overflow-x-hidden">
      <section className="w-full bg-[#0B0F19] px-4 pb-8 pt-2">
        <div className="relative w-full min-h-[80vh] flex items-center justify-center rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] px-4 py-12 md:py-24">
          <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover opacity-35 scale-[1.05]"
            >
              <source src={HeroVideo.HeroSectionVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-[#0B0F19]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19]/60 via-transparent to-[#0B0F19]/60" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
            <div className="animate-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4158D0]/30 bg-[#4158D0]/10 text-xs font-bold tracking-widest text-[#C850C0] uppercase backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#4158D0] animate-pulse" />
              PROFESSIONAL SOUND ENGINEERING
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] uppercase text-white drop-shadow-md">
              UNLEASH THE POWER OF <br />
              <span className="bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-flow">
                Z SOUND
                <br /> LED DISPLAYS <br /> PRO AUDIO
              </span>
            </h1>
            <p className="max-w-xl text-gray-400 font-medium text-sm sm:text-base md:text-lg leading-relaxed px-2">
              Premium amplifiers, subwoofers, speakers, line arrays, LED walls,
              and complete event audio solutions engineered for exceptional
              performance.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 px-4">
              <Link
                href="/ExploreSystems"
                className="w-full sm:w-auto text-center px-8 py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#FF512F] bg-[length:200%_auto] border border-white/10 shadow-[0_0_20px_rgba(255,81,47,0.3)] transition-all duration-300 animate-gradient-flow hover:shadow-[0_0_30px_rgba(255,81,47,0.7)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Explore Systems
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full text-white py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF512F]/30 bg-[#FF512F]/10 text-xs font-bold tracking-widest text-[#FF512F] uppercase mb-4">
            <Calendar className="w-3.5 h-3.5" /> Established Dec 25, 2024
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-6">
            The Story of <br />
            <span className="bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#4158D0] bg-clip-text text-transparent">
              RM SOUNDS
            </span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium">
            Founded on{" "}
            <span className="text-white font-bold">25th December 2024</span>, RM
            Sounds has redefined massive audio deployments and live production
            management. We engineer absolute auditory dominance, combining heavy
            infrastructure like <b>high-performance generators</b>, industrial
            <b>smokers</b>, and rapid <b>paper pushers</b> with a
            state-of-the-art
            <b>DJ lighting system</b> to guarantee uncompromised, arena-grade
            club energy for any venue.
          </p>
        </div>

        <div className="flex flex-col gap-24">
          <ShowcaseBlock
            icon={Disc}
            iconWrapClassName="bg-[#4158D0]/10 border-[#4158D0]/30 text-[#4158D0]"
            title="Professional Z Sounds"
            image={AboutSection.ZSounds}
            alt="Professional Z Sounds Rig"
            description={
              <>
                Our flagship <b>Z Sound system lineup</b> handles low-frequency
                delivery without distortion. Engineered for high acoustic
                fidelity, this massive array structures raw acoustic power with
                maximum structural clarity, guaranteeing your bass cuts through
                heavy outdoor air crowds cleanly.
              </>
            }
            variant="z-sounds"
          />

          <ShowcaseBlock
            icon={Cpu}
            iconWrapClassName="bg-[#C850C0]/10 border-[#C850C0]/30 text-[#C850C0]"
            title="Speakers & Amplifiers"
            image={AboutSection.SoundSystem}
            alt="Acoustic Speakers and Amplifiers"
            description={
              <>
                Our advanced <b>speaker and amplifier systems</b> deliver
                crystal-clear highs and deep, punchy lows. Paired with precision
                crossover networks and high-efficiency Class-D amplification,
                these setups provide unmatched sound reinforcement for concerts,
                festivals, and corporate events.
              </>
            }
            variant="speakers"
          />

          <ShowcaseBlock
            icon={Tv}
            iconWrapClassName="bg-[#FF512F]/10 border-[#FF512F]/30 text-[#FF512F]"
            title="LED Display Walls"
            image={AboutSection.LEDSetup}
            alt="High-resolution LED Display Walls"
            description={
              <>
                Our <b>LED display walls</b> deliver stunning, ultra-bright
                visuals for any stage, indoor or outdoor. With seamless modular
                panels, high refresh rates, and full-color calibration, we
                create immersive backdrops, dynamic content screens, and
                eye-catching signage that elevate your events production value.
              </>
            }
            variant="led"
          />

          <ShowcaseBlock
            icon={Truck}
            iconWrapClassName="bg-[#DD2476]/10 border-[#DD2476]/30 text-[#DD2476]"
            title="Road Show & Tour Production"
            image={AboutSection.RoadShow}
            alt="Mobile production and road show setup"
            description={
              <>
                From <b>one-off shows</b> to <b>multi-city tours</b>, our
                road-ready production teams handle logistics, staging, and
                technical direction. We deploy compact yet powerful systems that
                travel efficiently, set up quickly, and deliver consistent
                arena-grade sound and visuals at every stop.
              </>
            }
            variant="road-show"
          />
        </div>
      </section>
    </main>
  );
}
