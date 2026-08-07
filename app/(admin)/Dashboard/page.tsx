"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BadgeAlert,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Check,
  Eye,
  MapPin,
  Phone,
  User,
  X,
  Calendar,
  FileText,
  Hash,
  Loader2,
} from "lucide-react";
import { AdminEventBookingAPI } from "@/app/(admin)/1constants/API_AdminEventBookings";

type BookingStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Cancelled"
  | "Completed";

type Booking = {
  BookingID: number;
  BookingNo: string;
  CustomerName: string;
  MobileNumber: string;
  EventType: number;
  EventTypeName: string;
  EventShortKey: string;
  EventDate: string;
  EventEndDate: string;
  EventLocation: string;
  Notes: string;
  BookingStatus: BookingStatus;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string | null;
  UpdatedBy: string | null;
};

type UpdateStatusPayload = {
  BookingID: number;
  Status: "Accepted" | "Rejected";
  UpdatedBy: string;
  BookingAvailability?: "FullyBooked" | "PartiallyBooked";
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const API_ADMIN_BOOKINGS = AdminEventBookingAPI.GetEventBookings;
const API_UPDATE_BOOKING_STATUS = AdminEventBookingAPI.UpdateEventBookingStatus;

function toDatePart(dateStr: string): string {
  return dateStr.split("T")[0];
}

function toIsoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function bookingStatusClasses(status: BookingStatus) {
  switch (status) {
    case "Accepted":
      return "bg-green-500/15 text-green-400";
    case "Pending":
      return "bg-amber-500/15 text-amber-400";
    case "Rejected":
      return "bg-red-500/15 text-red-400";
    case "Cancelled":
      return "bg-gray-500/15 text-gray-300";
    case "Completed":
      return "bg-blue-500/15 text-blue-400";
    default:
      return "bg-white/10 text-white";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

function formatDateForDisplay(dateStr: string): string {
  return format(new Date(dateStr), "dd/MM/yyyy");
}

export default function AdminCalendarPage() {
  const today = new Date();
  const initialDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDate(today));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<number | null>(
    null,
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const fromDate = new Date(year, month, 1);
      const toDate = new Date(year, month + 1, 0);
      const fromStr = toIsoDate(fromDate);
      const toStr = toIsoDate(toDate);

      try {
        const res = await fetch(API_ADMIN_BOOKINGS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            PageNumber: 1,
            PageSize: 100,
            SearchText: "",
            Status: "",
            FromDate: fromStr,
            ToDate: toStr,
            SortColumn: "EventDate",
            SortOrder: "ASC",
          }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Failed to fetch bookings");
        }
        setBookings(json.data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error(err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [currentDate]);

  const handleStatusUpdate = async (
    bookingId: number,
    newStatus: "Accepted" | "Rejected",
    availability?: "FullyBooked" | "PartiallyBooked",
  ) => {
    if (updatingBookingId) return;
    setUpdatingBookingId(bookingId);
    setNotification(null);

    try {
      const payload: UpdateStatusPayload = {
        BookingID: bookingId,
        Status: newStatus,
        UpdatedBy: "Admin",
      };
      
      if (newStatus === "Accepted" && availability) {
        payload.BookingAvailability = availability;
      }

      const res = await fetch(API_UPDATE_BOOKING_STATUS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Update failed");
      }
      
      setBookings((prev) =>
        prev.map((b) =>
          b.BookingID === bookingId
            ? {
                ...b,
                BookingStatus: newStatus,
                UpdatedAt: new Date().toISOString(),
                UpdatedBy: "Admin",
              }
            : b,
        ),
      );
      setNotification({
        message: json.message || "Booking updated successfully",
        type: "success",
      });
      if (isModalOpen) closeModal();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: unknown) {
      setNotification({ message: getErrorMessage(err), type: "error" });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setUpdatingBookingId(null);
      setShowAvailabilityModal(false);
      setPendingBookingId(null);
    }
  };

  const handleApproveClick = (bookingId: number) => {
    setPendingBookingId(bookingId);
    setShowAvailabilityModal(true);
  };

  const todayStr = toIsoDate(today);

  const upcomingEvents = bookings.filter((b) => {
    const datePart = toDatePart(b.EventDate);
    return (
      datePart >= todayStr &&
      b.BookingStatus !== "Completed" &&
      b.BookingStatus !== "Cancelled"
    );
  }).length;

  const waitingForApproval = bookings.filter(
    (b) => b.BookingStatus === "Pending",
  ).length;

  const completedEvents = bookings.filter(
    (b) => b.BookingStatus === "Completed",
  ).length;

  const currentMonthBookings = bookings.length;

  const nextEvent = useMemo(() => {
    const future = bookings
      .filter((b) => toDatePart(b.EventDate) >= todayStr)
      .sort((a, b) => a.EventDate.localeCompare(b.EventDate));
    if (future.length === 0) {
      return { date: "—", customer: "—", event: "No upcoming events" };
    }
    const first = future[0];
    const d = new Date(first.EventDate);
    return {
      date: format(d, "dd/MM/yyyy"),
      customer: first.CustomerName,
      event: first.EventTypeName,
    };
  }, [bookings, todayStr]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }
    return cells;
  }, [currentDate]);

  const selectedBookings = bookings.filter(
    (booking) => toDatePart(booking.EventDate) === selectedDate,
  );

  const changeMonth = (direction: number) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1,
      ),
    );
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading bookings...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Error loading bookings: {error}</p>
          <button
            onClick={() => {
              setCurrentDate(new Date(currentDate));
            }}
            className="mt-4 px-4 py-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${
              notification.type === "success"
                ? "bg-green-500/20 border-green-500/30 text-green-300"
                : "bg-red-500/20 border-red-500/30 text-red-300"
            } max-w-sm`}
          >
            {notification.message}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-3xl font-black">Booking Calendar</h1>
          <p className="mt-2 text-sm text-gray-400">
            View and manage all customer bookings.
          </p>
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-600/15 via-slate-900 to-slate-900 shadow-lg">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Next Event
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-black">{nextEvent.event}</h2>
              <p className="mt-2 text-gray-300">
                {nextEvent.event !== "No upcoming events" ? (
                  <>
                    There is an event on
                    <span className="font-semibold text-white">
                      {" "}
                      {nextEvent.date}
                    </span>{" "}
                    for{" "}
                    <span className="font-semibold text-cyan-300">
                      {nextEvent.customer}
                    </span>
                    .
                  </>
                ) : (
                  <span className="text-gray-400">
                    No upcoming events scheduled.
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-8 py-6 text-center">
              <CalendarDays className="mx-auto mb-2 h-10 w-10 text-cyan-400" />
              <p className="text-lg font-bold">{nextEvent.date}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-blue-500/20 bg-[#111827] p-4">
            <div className="flex items-center justify-between">
              <CalendarDays className="h-8 w-8 text-blue-400" />
              <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">
                {format(currentDate, "MMM yyyy")}
              </span>
            </div>
            <p className="mt-5 text-xs text-gray-400">Upcoming Events</p>
            <h2 className="mt-1 text-3xl font-black">{upcomingEvents}</h2>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-[#111827] p-4">
            <div className="flex items-center justify-between">
              <BadgeAlert className="h-8 w-8 text-amber-400" />
              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] text-amber-300">
                Pending
              </span>
            </div>
            <p className="mt-5 text-xs text-gray-400">Waiting Approval</p>
            <h2 className="mt-1 text-3xl font-black">{waitingForApproval}</h2>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-[#111827] p-4">
            <div className="flex items-center justify-between">
              <CircleCheckBig className="h-8 w-8 text-purple-400" />
              <span className="rounded-full bg-purple-500/10 px-2 py-1 text-[10px] text-purple-300">
                Till Date
              </span>
            </div>
            <p className="mt-5 text-xs text-gray-400">Completed Events</p>
            <h2 className="mt-1 text-3xl font-black">{completedEvents}</h2>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-[#111827] p-4">
            <div className="flex items-center justify-between">
              <CalendarClock className="h-8 w-8 text-green-400" />
              <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] text-green-300">
                Month
              </span>
            </div>
            <p className="mt-5 text-xs text-gray-400">Total Bookings</p>
            <h2 className="mt-1 text-3xl font-black">{currentMonthBookings}</h2>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-4 shadow-lg lg:p-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-xl border border-white/10 p-2 transition hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold lg:text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="rounded-xl border border-white/10 p-2 transition hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-bold uppercase text-gray-400 lg:text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square rounded-xl"
                  />
                );
              }

              const dateString = `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1,
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              const dayBookings = bookings.filter(
                (booking) => toDatePart(booking.EventDate) === dateString,
              );

              const isSelected = selectedDate === dateString;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDateSelect(dateString)}
                  className={`aspect-square rounded-2xl border transition-all
                    ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/20"
                        : "border-white/10 bg-[#0B0F19] hover:border-cyan-400/40"
                    }`}
                >
                  <div className="flex h-full flex-col items-center justify-center">
                    <span
                      className={`text-sm font-bold lg:text-base ${
                        isSelected ? "text-cyan-300" : "text-white"
                      }`}
                    >
                      {day}
                    </span>
                    {dayBookings.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <span
                            key={booking.BookingID}
                            className={`h-2.5 w-2.5 rounded-full
                              ${
                                booking.BookingStatus === "Accepted"
                                  ? "bg-green-400"
                                  : booking.BookingStatus === "Pending"
                                    ? "bg-amber-400"
                                    : booking.BookingStatus === "Rejected"
                                      ? "bg-red-400"
                                      : booking.BookingStatus === "Completed"
                                        ? "bg-blue-400"
                                        : "bg-gray-400"
                              }`}
                          />
                        ))}
                        {dayBookings.length > 3 && (
                          <span className="text-[10px] text-gray-400">
                            +{dayBookings.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              Pending
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-400" />
              Accepted
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-400" />
              Completed
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              Rejected
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-400" />
              Cancelled
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Bookings</h2>
              <p className="mt-1 text-sm text-gray-400">
                Selected Date :{" "}
                <span className="font-semibold text-cyan-400">
                  {selectedDate}
                </span>
              </p>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              {selectedBookings.length} Booking
              {selectedBookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {selectedBookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#111827] p-10 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-4 text-lg font-semibold">No Bookings</h3>
              <p className="mt-2 text-sm text-gray-400">
                There are no bookings for this date.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {selectedBookings.map((booking) => (
                <div
                  key={booking.BookingID}
                  className="rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-lg"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {booking.EventTypeName}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${bookingStatusClasses(
                            booking.BookingStatus,
                          )}`}
                        >
                          {booking.BookingStatus}
                        </span>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-cyan-400" />
                          <span>{booking.CustomerName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-green-400" />
                          <a
                            href={`tel:${booking.MobileNumber}`}
                            className="text-green-300 hover:text-green-200 underline-offset-2 hover:underline transition"
                          >
                            {booking.MobileNumber}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-red-400" />
                          <span>{booking.EventLocation}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarClock className="h-5 w-5 text-yellow-400" />
                          <span>{formatDateForDisplay(booking.EventDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => openModal(booking)}
                        className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      {booking.BookingStatus === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleApproveClick(booking.BookingID)
                            }
                            disabled={updatingBookingId === booking.BookingID}
                            className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300 transition hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingBookingId === booking.BookingID ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.BookingID, "Rejected")
                            }
                            disabled={updatingBookingId === booking.BookingID}
                            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingBookingId === booking.BookingID ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 rounded-full p-2 bg-white/5 hover:bg-white/10 transition"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold">
                      {selectedBooking.EventTypeName}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${bookingStatusClasses(
                        selectedBooking.BookingStatus,
                      )}`}
                    >
                      {selectedBooking.BookingStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Booking #{selectedBooking.BookingNo}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="font-medium">
                      {selectedBooking.CustomerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Mobile</p>
                    <a
                      href={`tel:${selectedBooking.MobileNumber}`}
                      className="font-medium text-green-300 hover:text-green-200 underline-offset-2 hover:underline transition"
                    >
                      {selectedBooking.MobileNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-medium">
                      {selectedBooking.EventLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Event Type</p>
                    <p className="font-medium">
                      {selectedBooking.EventTypeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Event Date</p>
                    <p className="font-medium">
                      {formatDateForDisplay(selectedBooking.EventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Event End Date</p>
                    <p className="font-medium">
                      {formatDateForDisplay(selectedBooking.EventEndDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Notes</p>
                    <p className="font-medium text-gray-200 whitespace-pre-wrap">
                      {selectedBooking.Notes || "No notes provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-medium"
                >
                  Close
                </button>
                {selectedBooking.BookingStatus === "Pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleApproveClick(selectedBooking.BookingID)
                      }
                      disabled={updatingBookingId === selectedBooking.BookingID}
                      className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300 transition hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingBookingId === selectedBooking.BookingID ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          selectedBooking.BookingID,
                          "Rejected",
                        )
                      }
                      disabled={updatingBookingId === selectedBooking.BookingID}
                      className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingBookingId === selectedBooking.BookingID ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAvailabilityModal && pendingBookingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowAvailabilityModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAvailabilityModal(false)}
              className="absolute top-4 right-4 rounded-full p-2 bg-white/5 hover:bg-white/10 transition"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Mark Calendar Availability</h3>
              <p className="text-sm text-gray-400">
                How should the calendar be marked for this booking?
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() =>
                    handleStatusUpdate(
                      pendingBookingId,
                      "Accepted",
                      "FullyBooked",
                    )
                  }
                  disabled={updatingBookingId === pendingBookingId}
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
                >
                  {updatingBookingId === pendingBookingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  Fully Booked
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(
                      pendingBookingId,
                      "Accepted",
                      "PartiallyBooked",
                    )
                  }
                  disabled={updatingBookingId === pendingBookingId}
                  className="flex items-center justify-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-50"
                >
                  {updatingBookingId === pendingBookingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  Partially Booked
                </button>
              </div>

              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
