"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Edit,
  Trash,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { AdminContactDetailsAPI } from "@/app/(admin)/1constants/API_AdminContactDetails";
import { toast } from "sonner";

type LocationForm = {
  LocationID?: number;
  LocationManager?: string;
  ContactNumber?: string;
  ContactEmail?: string;
  FullAddress?: string;
  GoogleMapEmbedUrl?: string;
  LocationType?: string;
};

type Location = {
  LocationID: number;
  LocationManager?: string | null;
  ContactNumber?: string | null;
  ContactEmail?: string | null;
  FullAddress?: string | null;
  GoogleMapEmbedUrl?: string | null;
  LocationType?: string | null;
  Status?: string | null; // added
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LocationForm>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(AdminContactDetailsAPI.GetContactDetails, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ PageNumber: 1, PageSize: 50 }),
        });

        const json = await res.json();

        if (!ignore && json?.success) {
          setLocations(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const openAdd = () => {
    setForm({});
    setShowForm(true);
  };

  const openEdit = (loc: Location) => {
    setForm({
      LocationID: loc.LocationID,
      LocationManager: loc.LocationManager || undefined,
      ContactNumber: loc.ContactNumber || undefined,
      ContactEmail: loc.ContactEmail || undefined,
      FullAddress: loc.FullAddress || undefined,
      GoogleMapEmbedUrl: loc.GoogleMapEmbedUrl || undefined,
      LocationType: loc.LocationType || undefined,
    });
    setShowForm(true);
  };

  const saveLocation = async () => {
    try {
      setSaving(true);

      const payload = { ...form, CreatedBy: "Admin", UpdatedBy: "Admin" };

      const res = await fetch(AdminContactDetailsAPI.PostContactDetails, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save location.");
      }

      const refreshed = await (
        await fetch(AdminContactDetailsAPI.GetContactDetails, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ PageNumber: 1, PageSize: 50 }),
        })
      ).json();

      setLocations(refreshed.data || []);
      setShowForm(false);
      toast.success(json.message || "Saved.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Unable to save location.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLocation = async (id: number) => {
    if (!confirm("Delete this location?")) return;

    try {
      const res = await fetch(AdminContactDetailsAPI.DeleteContactDetails, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ LocationID: id }),
      });

      const json = await res.json();

      if (!res.ok || !json.success)
        throw new Error(json.message || "Delete failed");

      setLocations((prev) => prev.filter((l) => l.LocationID !== id));
      toast.success(json.message || "Deleted.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Unable to delete location.");
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(AdminContactDetailsAPI.UpdateContactStatus, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          LocationID: id,
          Status: newStatus,
          UpdatedBy: "Admin",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success)
        throw new Error(json.message || "Status update failed");

      setLocations((prev) =>
        prev.map((l) =>
          l.LocationID === id ? { ...l, Status: newStatus } : l,
        ),
      );
      toast.success(json.message || "Status updated.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Unable to update status.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <MapPin className="h-6 w-6 text-[#4158D0]" />
          <h1 className="text-2xl font-black">Locations</h1>
          <div className="ml-auto">
            <button
              onClick={openAdd}
              className="rounded-xl bg-white/5 px-4 py-2 font-semibold"
            >
              <Plus className="inline-block mr-2" /> Add Location
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : locations.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-8 text-center">
            <p className="text-gray-300">No locations found.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc) => (
              <div
                key={loc.LocationID}
                className="rounded-3xl border border-white/10 bg-[#111827] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      {loc.LocationManager || "--"}
                    </h3>
                    <p className="mt-2 text-sm text-gray-300 break-words">
                      {loc.FullAddress}
                    </p>
                    <div className="mt-3 flex flex-col gap-1 text-sm text-gray-400">
                      <span>Phone: {loc.ContactNumber || "-"}</span>
                      <span>Email: {loc.ContactEmail || "-"}</span>
                      <span>Type: {loc.LocationType || "-"}</span>
                      <span>Status: {loc.Status || "Active"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(loc)}
                        className="rounded-full bg-white/5 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteLocation(loc.LocationID)}
                        className="rounded-full bg-red-600 p-2 text-white"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        toggleStatus(loc.LocationID, loc.Status || "Active")
                      }
                      className="mt-2 rounded-xl bg-white/5 px-3 py-1 text-sm"
                    >
                      {loc.Status === "Active" ? (
                        <span className="flex items-center gap-2">
                          <ToggleRight /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ToggleLeft /> Inactive
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0B0F19] p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4">
              {form.LocationID ? "Edit Location" : "Add Location"}
            </h3>
            <div className="grid gap-3">
              <input
                value={form.LocationManager || ""}
                onChange={(e) =>
                  setForm({ ...form, LocationManager: e.target.value })
                }
                placeholder="Manager"
                className="rounded-xl border border-white/10 bg-white/2 px-3 py-2"
              />
              <input
                value={form.ContactNumber || ""}
                onChange={(e) =>
                  setForm({ ...form, ContactNumber: e.target.value })
                }
                placeholder="Phone"
                className="rounded-xl border border-white/10 bg-white/2 px-3 py-2"
              />
              <input
                value={form.ContactEmail || ""}
                onChange={(e) =>
                  setForm({ ...form, ContactEmail: e.target.value })
                }
                placeholder="Email"
                className="rounded-xl border border-white/10 bg-white/2 px-3 py-2"
              />
              <input
                value={form.LocationType || ""}
                onChange={(e) =>
                  setForm({ ...form, LocationType: e.target.value })
                }
                placeholder="Type"
                className="rounded-xl border border-white/10 bg-white/2 px-3 py-2"
              />
              <textarea
                value={form.FullAddress || ""}
                onChange={(e) =>
                  setForm({ ...form, FullAddress: e.target.value })
                }
                placeholder="Address"
                className="rounded-xl border border-white/10 bg-white/2 px-3 py-2"
              />

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={saveLocation}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#4158D0] to-[#C850C0] px-4 py-2 font-bold"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
