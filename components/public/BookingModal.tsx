"use client";

import {
  useEffect,
  useRef,
  useState,
  ChangeEvent,
  FormEvent,
  useCallback,
  useMemo,
} from "react";
import { MouseEvent as ReactMouseEvent } from "react";

import {
  CalendarPlus,
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  X,
  Loader2,
  ChevronDown,
  Search,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

import { DropdownsAPI } from "@/app/(client)/1constants/API_Dropdowns";
import { EventBookingAPI } from "@/app/(client)/1constants/API_EventsBookings";
import { WhatsappNumberAPI } from "@/app/(client)/1constants/API_WhatsappNumber";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
}

interface BookingFormData {
  customerName: string;
  mobileNumber: string;
  eventType: string;
  eventDate: string;
  eventEndDate: string;
  eventLocation: string;
  notes: string;
}

interface BookingErrors {
  customerName?: string;
  mobileNumber?: string;
  eventType?: string;
  eventDate?: string;
  eventLocation?: string;
}

interface BookingAlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
  bookingData?: {
    customerName: string;
    eventDate: string;
    eventEndDate: string;
  };
}

interface EventType {
  EventTypeID: number;
  EventTypeName: string;
  EventShortKey: string;
}

const whatsappNumberCache = {
  promise: null as Promise<string | null> | null,
  value: null as string | null,
};

const eventTypesCache = {
  promise: null as Promise<EventType[] | null> | null,
  value: null as EventType[] | null,
};

interface BookingAlertProps {
  alert: BookingAlertState;
  whatsappLoading: boolean;
  whatsappNumber: string | null;
  onClose: () => void;
  onSendWhatsApp: () => void;
}

function BookingAlert({
  alert,
  whatsappLoading,
  whatsappNumber,
  onClose,
  onSendWhatsApp,
}: BookingAlertProps) {
  if (!alert.show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B0F19]/95 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,.8)] p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F]" />

        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${alert.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"} mb-4`}
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8" />
            )}
          </div>

          <h3
            className={`text-xl font-bold ${alert.type === "success" ? "text-emerald-400" : "text-red-400"}`}
          >
            {alert.type === "success" ? "Success!" : "Error"}
          </h3>

          <p className="mt-2 text-sm text-gray-300 leading-relaxed">
            {alert.message}
          </p>

          {alert.type === "success" && (
            <button
              onClick={onSendWhatsApp}
              disabled={whatsappLoading || !whatsappNumber}
              className={`mt-4 w-full rounded-2xl bg-[#25D366] hover:bg-[#128C7E] px-6 py-3 font-bold text-white shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <MessageCircle className="h-5 w-5" />
              {whatsappLoading ? "Loading..." : "Send WhatsApp"}
            </button>
          )}

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] px-6 py-3 font-bold text-white shadow-[0_0_30px_rgba(200,80,192,.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(200,80,192,.6)] active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingModal({
  open,
  onClose,
  initialDate,
}: BookingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dateSetRef = useRef(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(false);
  const [eventTypesError, setEventTypesError] = useState<string | null>(null);

  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [form, setForm] = useState<BookingFormData>({
    customerName: "",
    mobileNumber: "",
    eventType: "",
    eventDate: "",
    eventEndDate: "",
    eventLocation: "",
    notes: "",
  });

  const [errors, setErrors] = useState<BookingErrors>({});

  const [alert, setAlert] = useState<BookingAlertState>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (open && initialDate && !dateSetRef.current) {
      setForm((prev) => ({ ...prev, eventDate: initialDate }));
      dateSetRef.current = true;
    }
    if (!open) {
      dateSetRef.current = false;
    }
  }, [open, initialDate]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const fetchWhatsAppNumber = async () => {
      setWhatsappLoading(true);

      if (whatsappNumberCache.value) {
        setWhatsappNumber(whatsappNumberCache.value);
        setWhatsappLoading(false);
        return;
      }

      if (whatsappNumberCache.promise) {
        try {
          const cachedNumber = await whatsappNumberCache.promise;
          if (cachedNumber) {
            setWhatsappNumber(cachedNumber);
          }
        } finally {
          setWhatsappLoading(false);
        }
        return;
      }

      whatsappNumberCache.promise = (async () => {
        try {
          const res = await fetch(WhatsappNumberAPI.GetWhatsappNumber, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });

          const rawText = await res.text();
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${rawText}`);
          }

          const data = JSON.parse(rawText);
          if (data.success && data.data?.WhatsappNumber) {
            whatsappNumberCache.value = data.data.WhatsappNumber;
            return data.data.WhatsappNumber;
          }

          throw new Error("Invalid response format");
        } catch (err) {
          console.error("Failed to fetch WhatsApp number:", err);
          return null;
        }
      })();

      try {
        const resolvedNumber = await whatsappNumberCache.promise;
        if (resolvedNumber) {
          setWhatsappNumber(resolvedNumber);
        }
      } finally {
        setWhatsappLoading(false);
        whatsappNumberCache.promise = null;
      }
    };

    fetchWhatsAppNumber();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const fetchEventTypes = async () => {
      setEventTypesLoading(true);
      setEventTypesError(null);

      if (eventTypesCache.value) {
        setEventTypes(eventTypesCache.value);
        setEventTypesLoading(false);
        return;
      }

      if (eventTypesCache.promise) {
        try {
          const cachedTypes = await eventTypesCache.promise;
          if (cachedTypes) {
            setEventTypes(cachedTypes);
          }
        } finally {
          setEventTypesLoading(false);
        }
        return;
      }

      eventTypesCache.promise = (async () => {
        try {
          const response = await fetch(DropdownsAPI.EventTypes, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            eventTypesCache.value = result.data;
            return result.data;
          }

          throw new Error("Invalid response format");
        } catch (error) {
          console.error("Failed to fetch event types:", error);
          setEventTypesError("Failed to load event types. Please refresh.");
          return null;
        }
      })();

      try {
        const resolvedTypes = await eventTypesCache.promise;
        if (resolvedTypes) {
          setEventTypes(resolvedTypes);
        }
      } finally {
        setEventTypesLoading(false);
        eventTypesCache.promise = null;
      }
    };

    fetchEventTypes();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else if (!alert.show) {
          onCloseRef.current();
        }
      }
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, isDropdownOpen, alert.show]);

  const resetForm = () => {
    setErrors({});
    setForm({
      customerName: "",
      mobileNumber: "",
      eventType: "",
      eventDate: "",
      eventEndDate: "",
      eventLocation: "",
      notes: "",
    });
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const closeModal = useCallback(() => {
    if (loading) return;
    resetForm();
    onCloseRef.current();
  }, [loading]);

  const handleAlertOk = useCallback(() => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
    setAlert({ show: false, type: "success", message: "" });
    if (alert.type === "success") {
      closeModal();
    }
  }, [alert.type, closeModal]);

  useEffect(() => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }

    if (alert.show && alert.type === "success") {
      alertTimeoutRef.current = setTimeout(() => {
        handleAlertOk();
      }, 30000);
    }

    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
    };
  }, [alert.show, alert.type, handleAlertOk]);

  const handleOverlayClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const validateMobileNumber = (value: string): string | null => {
    if (!value.trim()) {
      return "Enter Mobile Number";
    }
    if (!/^[6-9]\d{9}$/.test(value.trim())) {
      return "Enter Valid Mobile Number";
    }
    return null;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "mobileNumber") {
      const error = validateMobileNumber(value);
      setErrors((prev) => ({
        ...prev,
        mobileNumber: error || undefined,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (form.eventType) {
      const selected = eventTypes.find(
        (t) => String(t.EventTypeID) === form.eventType,
      );
      if (
        selected &&
        selected.EventTypeName.toLowerCase() !== value.toLowerCase()
      ) {
        setForm((prev) => ({ ...prev, eventType: "" }));
      }
    }
    setIsDropdownOpen(true);
    setErrors((prev) => ({ ...prev, eventType: "" }));
  };

  const handleSelectEventType = (type: EventType) => {
    setForm((prev) => ({ ...prev, eventType: String(type.EventTypeID) }));
    setSearchTerm(type.EventTypeName);
    setIsDropdownOpen(false);
    setErrors((prev) => ({ ...prev, eventType: "" }));
  };

  const filteredEventTypes = useMemo(
    () =>
      eventTypes.filter((type) =>
        type.EventTypeName.toLowerCase().includes(
          searchTerm.toLowerCase().trim(),
        ),
      ),
    [eventTypes, searchTerm],
  );

  const validate = () => {
    const newErrors: BookingErrors = {};

    if (!form.customerName.trim()) {
      newErrors.customerName = "Enter Customer Name";
    }

    const mobileError = validateMobileNumber(form.mobileNumber);
    if (mobileError) {
      newErrors.mobileNumber = mobileError;
    }

    if (!form.eventType.trim()) {
      newErrors.eventType = "Select Event Type";
    }
    if (!form.eventDate.trim()) {
      newErrors.eventDate = "Select Event Date";
    }
    if (!form.eventLocation.trim()) {
      newErrors.eventLocation = "Enter Event Location";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        CustomerName: form.customerName.trim(),
        MobileNumber: form.mobileNumber.trim(),
        EventType: Number(form.eventType),
        EventDate: form.eventDate,
        EventEndDate: form.eventEndDate || form.eventDate,
        EventLocation: form.eventLocation.trim(),
        Notes: form.notes.trim(),
      };

      const response = await fetch(EventBookingAPI.CreateEvent, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setAlert({
          show: true,
          type: "success",
          message: `Booking #${result.data.BookingNo} created successfully!`,
          bookingData: {
            customerName: form.customerName.trim(),
            eventDate: form.eventDate,
            eventEndDate: form.eventEndDate || form.eventDate,
          },
        });
      } else {
        throw new Error(result.message || "Unknown error");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      setAlert({
        show: true,
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit booking. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
    if (!alert.bookingData || !whatsappNumber) return;
    const { customerName, eventDate, eventEndDate } = alert.bookingData;

    let dateText = formatDate(eventDate);
    if (eventEndDate && eventEndDate !== eventDate) {
      dateText += ` to ${formatDate(eventEndDate)}`;
    }

    const message = `Hello, my name is ${customerName}. I booked an event on ${dateText}. Please review it and confirm.`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    window.open(url, "_blank");
  };

  if (!open) return null;

  return (
    <>
      {/* ===== MAIN BOOKING MODAL ===== */}
      <div
        onClick={handleOverlayClick}
        className="
          fixed inset-0 z-[9999]
          flex items-center justify-center
          bg-black/70 backdrop-blur-sm p-4
          animate-in fade-in duration-300
        "
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0B0F19]/95 shadow-[0_20px_60px_rgba(0,0,0,.6)] backdrop-blur-2xl animate-in zoom-in-95 duration-300 mx-4"
        >
          <div className="flex-shrink-0 sticky top-0 z-10 border-b border-white/10 bg-[#0B0F19]/95 backdrop-blur-2xl px-4 sm:px-7 py-5 sm:py-6">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4158D0]/15 via-[#C850C0]/15 to-[#FF512F]/15" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] shadow-[0_0_25px_rgba(200,80,192,.35)]">
                  <CalendarPlus className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-white">
                    Book Event
                  </h2>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-400">
                    Fill in your event details and we`ll contact you shortly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 sm:py-7 scrollbar-hide"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <form
              id="booking-form"
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <User className="h-4 w-4 text-[#FF512F]" />
                    Customer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    placeholder="Enter your full name"
                    value={form.customerName}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:ring-2 focus:ring-[#FF512F]/30 ${errors.customerName ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-[#FF512F]"}`}
                  />
                  {errors.customerName && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Phone className="h-4 w-4 text-[#25D366]" />
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:ring-2 focus:ring-[#25D366]/30 ${errors.mobileNumber ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-[#25D366]"}`}
                  />
                  {errors.mobileNumber && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="md:col-span-2 relative" ref={dropdownRef}>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Calendar className="h-4 w-4 text-[#C850C0]" />
                    Event Type <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={
                        eventTypesLoading
                          ? "Loading..."
                          : eventTypesError
                            ? "Error loading"
                            : "Search event type..."
                      }
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        if (!eventTypesLoading && !eventTypesError)
                          setIsDropdownOpen(true);
                      }}
                      disabled={eventTypesLoading || !!eventTypesError}
                      className={`w-full rounded-2xl border bg-white/5 px-4 py-3 pl-10 text-white placeholder:text-gray-500 outline-none transition focus:ring-2 focus:ring-[#C850C0]/30 ${errors.eventType ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-[#C850C0]"} disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    {eventTypesLoading && (
                      <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                    )}
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </div>

                  {isDropdownOpen && !eventTypesLoading && !eventTypesError && (
                    <div
                      className="absolute z-20 w-full mt-1 rounded-2xl border border-white/10 bg-[#0B0F19]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,.6)] max-h-60 overflow-y-auto scrollbar-hide"
                      style={{
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                      }}
                    >
                      {filteredEventTypes.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          No results found
                        </div>
                      ) : (
                        filteredEventTypes.map((type) => (
                          <button
                            key={type.EventTypeID}
                            type="button"
                            onClick={() => handleSelectEventType(type)}
                            className={`w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition border-b border-white/5 last:border-0 flex items-center justify-between ${String(type.EventTypeID) === form.eventType ? "bg-white/10 border-l-2 border-l-[#C850C0]" : ""}`}
                          >
                            <span>{type.EventTypeName}</span>
                            <span className="text-xs text-gray-400">
                              {type.EventShortKey}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {errors.eventType && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.eventType}
                    </p>
                  )}
                  {eventTypesError && (
                    <p className="mt-2 text-sm text-red-400">
                      {eventTypesError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Calendar className="h-4 w-4 text-[#4158D0]" />
                    Event Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-white outline-none transition focus:ring-2 focus:ring-[#4158D0]/30 ${errors.eventDate ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-[#4158D0]"}`}
                  />
                  {errors.eventDate && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.eventDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Calendar className="h-4 w-4 text-[#FF512F]" />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="eventEndDate"
                    value={form.eventEndDate}
                    onChange={handleChange}
                    min={
                      form.eventDate || new Date().toISOString().split("T")[0]
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#FF512F] focus:ring-2 focus:ring-[#FF512F]/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <MapPin className="h-4 w-4 text-[#C850C0]" />
                  Event Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="eventLocation"
                  placeholder="Village / Town / Address"
                  value={form.eventLocation}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:ring-2 focus:ring-[#C850C0]/30 ${errors.eventLocation ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-[#C850C0]"}`}
                />
                {errors.eventLocation && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.eventLocation}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <FileText className="h-4 w-4 text-[#4158D0]" />
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Tell us about your event..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:border-[#4158D0] focus:ring-2 focus:ring-[#4158D0]/30"
                />
              </div>
            </form>
          </div>

          <div className="flex-shrink-0 sticky bottom-0 z-10 border-t border-white/10 bg-[#0B0F19]/95 backdrop-blur-2xl px-4 sm:px-7 py-5 sm:py-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 sm:px-6 py-2.5 sm:py-3 font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="booking-form"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-white shadow-[0_0_30px_rgba(200,80,192,.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(200,80,192,.6)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Submit Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <BookingAlert
        alert={alert}
        whatsappLoading={whatsappLoading}
        whatsappNumber={whatsappNumber}
        onClose={handleAlertOk}
        onSendWhatsApp={handleWhatsApp}
      />
    </>
  );
}
