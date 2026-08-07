"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { GalleryImagesAPI } from "@/app/(client)/1constants/API_Gallery";

interface GalleryImage {
  GalleryImageID: number;
  ImageFileName: string;
  ImageUrl: string;
  CreatedAt: string;
  CreatedBy: string;
}

export default function PublicGalleryPage() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchGallery = async () => {
      setLoading(true);
      try {
        const res = await fetch(GalleryImagesAPI.GetGalleryImages, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            PageNumber: 1,
            PageSize: 1000,
          }),
          signal: abortController.signal,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load gallery");
        }

        setGallery(json.data || []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Gallery Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();

    return () => abortController.abort();
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % gallery.length;
    });
  }, [gallery.length]);

  const previousImage = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + gallery.length) % gallery.length;
    });
  }, [gallery.length]);

  const closePreview = useCallback(() => {
    setCurrentIndex(null);
  }, []);

  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          closePreview();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "ArrowLeft":
          previousImage();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [currentIndex, closePreview, nextImage, previousImage]);

  return (
    <main className="min-h-screen bg-[#0B0F19] pb-16 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Gallery</h1>
          <p className="mt-2 text-gray-400">Browse our latest event photos.</p>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center rounded-3xl border border-white/10 bg-[#111827]">
            <div className="text-lg text-gray-300">Loading gallery...</div>
          </div>
        ) : gallery.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#111827] py-20 text-center shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <h2 className="text-2xl font-bold text-white">No Images</h2>
            <p className="mt-3 text-gray-400">No gallery images are available.</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4 xl:columns-5">
            {gallery.map((image, index) => (
              <div
                key={image.GalleryImageID}
                className="group mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400"
              >
                <button
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className="block w-full cursor-zoom-in"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={image.ImageUrl}
                      alt={image.ImageFileName || "Gallery Image"}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closePreview}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closePreview();
            }}
            className="absolute right-5 top-5 z-50 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <X size={28} />
          </button>

          {gallery.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-6"
            >
              <ChevronLeft size={34} />
            </button>
          )}

          {gallery.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-6"
            >
              <ChevronRight size={34} />
            </button>
          )}

          <div className="absolute top-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111827]/90 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            {currentIndex + 1} / {gallery.length}
          </div>

          <div
            className="relative flex h-full w-full items-center justify-center p-4 md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery[currentIndex].ImageUrl}
              alt={gallery[currentIndex].ImageFileName}
              width={2200}
              height={2200}
              priority
              unoptimized
              className="max-h-[92vh] max-w-[95vw] h-auto w-auto rounded-3xl border border-white/10 object-contain shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
            />
          </div>
        </div>
      )}
    </main>
  );
}
