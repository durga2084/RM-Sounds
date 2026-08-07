"use client";

import { useEffect, useState } from "react";
import { PartyPopper, Plus, Edit, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminEventTypesAPI } from "@/app/(admin)/1constants/API_AdminEventTypes";
import { toast } from "sonner";

type EventTypeForm = { EventTypeID?: number; EventTypeName?: string; Status?: string };

type EventType = {
  EventTypeID: number;
  EventTypeName: string;
  EventShortKey: string;
  Status: string;
};

export default function EventTypesPage() {
  const [types, setTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventTypeForm>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(AdminEventTypesAPI.GetEventTypes, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ PageNumber: 1, PageSize: 50 }),
        });

        const json = await res.json();

        if (!ignore && json?.success) {
          setTypes(json.data || []);
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

  const openEdit = (t: EventType) => {
    setForm({ EventTypeID: t.EventTypeID, EventTypeName: t.EventTypeName, Status: t.Status });
    setShowForm(true);
  };

  const saveType = async () => {
    try {
      setSaving(true);

      const payload = { ...form, CreatedBy: "Admin", UpdatedBy: "Admin" };

      const res = await fetch(AdminEventTypesAPI.PostEventType, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save type");

      const refreshed = await (await fetch(AdminEventTypesAPI.GetEventTypes, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ PageNumber: 1, PageSize: 50 }) })).json();

      setTypes(refreshed.data || []);
      setShowForm(false);
      toast.success(json.message || "Saved.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Unable to save type.");
    } finally {
      setSaving(false);
    }
  };

  const deleteType = async (id: number) => {
    if (!confirm("Delete this event type?")) return;
    try {
      const res = await fetch(AdminEventTypesAPI.DeleteEventType, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ EventTypeID: id }) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
      setTypes((prev) => prev.filter((t) => t.EventTypeID !== id));
      toast.success(json.message || "Deleted.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Unable to delete type.");
    }
  };

  const toggleStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(AdminEventTypesAPI.UpdateEventTypeStatus, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ EventTypeID: id, Status: status === "Active" ? "Inactive" : "Active", UpdatedBy: "Admin" }) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Status update failed");
      setTypes((prev) => prev.map((t) => (t.EventTypeID === id ? { ...t, Status: json.data.Status } : t)));
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
          <PartyPopper className="h-6 w-6 text-[#FF512F]" />
          <h1 className="text-2xl font-black">Event Types</h1>
          <div className="ml-auto">
            <button onClick={openAdd} className="rounded-xl bg-white/5 px-4 py-2 font-semibold"> <Plus className="inline-block mr-2"/> Add Type</button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : types.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-8 text-center">
            <p className="text-gray-300">No event types found.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((t) => (
              <div key={t.EventTypeID} className="rounded-3xl border border-white/10 bg-[#111827] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{t.EventTypeName}</h3>
                    <p className="mt-2 text-sm text-gray-300">Short key: {t.EventShortKey}</p>
                    <div className="mt-3 text-sm text-gray-400">Status: {t.Status}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="rounded-full bg-white/5 p-2"><Edit className="h-4 w-4"/></button>
                      <button onClick={() => deleteType(t.EventTypeID)} className="rounded-full bg-red-600 p-2 text-white"><Trash className="h-4 w-4"/></button>
                    </div>
                    <button onClick={() => toggleStatus(t.EventTypeID, t.Status)} className="mt-2 rounded-xl bg-white/5 px-3 py-1 text-sm">
                      {t.Status === "Active" ? <span className="flex items-center gap-2"><ToggleRight/> Active</span> : <span className="flex items-center gap-2"><ToggleLeft/> Inactive</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0B0F19] p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4">{form.EventTypeID ? "Edit Event Type" : "Add Event Type"}</h3>
            <div className="grid gap-3">
              <input value={form.EventTypeName || ""} onChange={(e)=>setForm({...form, EventTypeName: e.target.value})} placeholder="Event Type Name" className="rounded-xl border border-white/10 bg-white/2 px-3 py-2" />
              <select value={form.Status || "Active"} onChange={(e)=>setForm({...form, Status: e.target.value})} className="rounded-xl border border-white/10 bg-white/2 px-3 py-2">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="flex gap-3 justify-end mt-4">
                <button onClick={()=>setShowForm(false)} className="rounded-xl border border-white/10 px-4 py-2">Cancel</button>
                <button onClick={saveType} disabled={saving} className="rounded-xl bg-gradient-to-r from-[#4158D0] to-[#C850C0] px-4 py-2 font-bold">{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
