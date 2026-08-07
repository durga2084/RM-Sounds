"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { UploadCloud, Images, Trash2, Eye, X } from "lucide-react";

import { toast } from "sonner";
import { AdminGalleryAPI } from "@/app/(admin)/1constants/API_AdminGallery";

interface GalleryImage {
  GalleryImageID: number;
  ImageFileName: string;
  ImageUrl: string;
  CreatedAt: string;
  CreatedBy: string;
}

export default function GalleryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const fetchGalleryImages = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("AdminToken") : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(AdminGalleryAPI.GetGalleryImages, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          PageNumber: 1,
          PageSize: 1000,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load gallery.");
      }

      return result.data as GalleryImage[];
    } catch (error) {
      console.error("Gallery Fetch Error:", error);

      throw error;
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadGallery() {
      try {
        setLoading(true);

        const images = await fetchGalleryImages();

        if (!ignore) {
          setGallery(images);
        }
      } catch {
        if (!ignore) {
          toast.error("Unable to load gallery.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      ignore = true;
    };
  }, [fetchGalleryImages]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("Images", file);
      });

      formData.append("CreatedBy", "Admin");

      const response = await fetch(AdminGalleryAPI.PostGalleryImage, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Upload failed.");

        return;
      }

      const updatedGallery = await fetchGalleryImages();

      setGallery(updatedGallery);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Images uploaded successfully.");
    } catch (error) {
      console.error("Upload Error:", error);

      toast.error("Unable to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const openDeleteModal = (galleryImageID: number) => {
    setSelectedDeleteId(galleryImageID);

    setShowDeleteModal(true);
  };

  const deleteImage = async () => {
    if (!selectedDeleteId) {
      return;
    }

    try {
      setDeletingId(selectedDeleteId);

      const response = await fetch(AdminGalleryAPI.DeleteGalleryImage, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("AdminToken")
            ? { Authorization: `Bearer ${localStorage.getItem("AdminToken")}` }
            : {}),
        },
        body: JSON.stringify({
          GalleryImageID: selectedDeleteId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Delete failed.");

        return;
      }

      setGallery((previous) =>
        previous.filter((image) => image.GalleryImageID !== selectedDeleteId),
      );

      toast.success("Image deleted successfully.");

      setShowDeleteModal(false);

      setSelectedDeleteId(null);
    } catch (error) {
      console.error("Delete Error:", error);

      toast.error("Unable to delete image.");
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <main className="min-h-screen bg-[#0B0F19] pb-32 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black">Gallery</h1>

          <p className="mt-2 text-sm text-gray-400">
            Upload, manage and remove gallery images.
          </p>
        </div>

        <div
          onClick={openFilePicker}
          className="mb-6 flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-cyan-500/30 bg-[#111827] px-5 py-4 transition hover:border-cyan-400 hover:bg-[#151d2f]"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-cyan-500/10 p-3">
              <UploadCloud className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h3 className="font-semibold">
                {uploading ? "Uploading Images..." : "Upload Gallery Images"}
              </h3>

              <p className="text-sm text-gray-400">
                Click here to choose one or more images.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={uploading}
            className="rounded-xl bg-gradient-to-r from-[#4158D0] to-[#C850C0] px-5 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Browse"}
          </button>

          <input
            ref={fileInputRef}
            hidden
            multiple
            type="file"
            accept="image/*"
            onChange={handleUpload}
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading gallery...
          </div>
        ) : gallery.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-14 text-center">
            <Images className="mx-auto h-16 w-16 text-gray-500" />
            <h2 className="mt-5 text-2xl font-bold">No Images Uploaded</h2>
            <p className="mt-2 text-gray-400">
              Upload your first gallery image.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {gallery.map((image) => (
              <div
                key={image.GalleryImageID}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111827] transition hover:border-cyan-400"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={image.ImageUrl}
                    alt="Gallery Image"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 flex items-end justify-center gap-3 bg-gradient-to-t from-black/80 pb-5 opacity-80 transition group-hover:opacity-100">
                    <button
                      onClick={() => setPreviewImage(image.ImageUrl)}
                      className="rounded-full bg-cyan-500 p-3 transition hover:scale-110"
                    >
                      <Eye size={20} />
                    </button>

                    <button
                      disabled={deletingId === image.GalleryImageID}
                      onClick={() => openDeleteModal(image.GalleryImageID)}
                      className="rounded-full bg-red-500 p-3 transition hover:scale-110 disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-5">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3 hover:bg-white/20"
          >
            <X />
          </button>

          <div className="relative h-[90vh] w-full max-w-7xl">
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowDeleteModal(false);
              setSelectedDeleteId(null);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0B0F19] p-6 shadow-2xl">
            <div className="mb-5 h-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
            <h2 className="text-xl font-bold">Delete Image?</h2>
            <p className="mt-2 text-sm text-gray-400">
              This image will be permanently removed.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDeleteId(null);
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                disabled={deletingId !== null}
                onClick={deleteImage}
                className="flex-1 rounded-xl bg-red-500 py-3 font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
