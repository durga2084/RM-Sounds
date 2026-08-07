"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  isBefore,
  isSameDay,
  startOfToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ViewEventCalendarAPI } from "@/app/(client)/1constants/API_ViewEventCalandar";
import { EventBookingAPI } from "@/app/(client)/1constants/API_EventsBookings";
import BookingModal from "@/components/public/BookingModal";

interface CalendarDay {
  date: string;
  status: "Available" | "PartiallyBooked" | "FullyBooked";
}

interface EventBooking {
  BookingID: number;
  BookingNo: string;
  CustomerName: string;
  MobileNumber: string;
  EventType: number;
  EventDate: string;
  EventEndDate: string;
  EventLocation: string;
  Notes: string;
  BookingStatus: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt?: string | null;
  UpdatedBy?: string | null;
  EventTypeName: string;
  EventShortKey: string;
}

export default function CalendarPage() {
  const today = startOfToday();

  const years = [
    today.getFullYear(),
    today.getFullYear() + 1,
    today.getFullYear() + 2,
  ];

  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedYear, today.getMonth(), 1),
  );

  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>("");

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<
    "BookingID" | "BookingNo" | "MobileNumber"
  >("BookingNo");
  const [searchValue, setSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<EventBooking[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDate, setConfirmDate] = useState<Date | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lastFetchedRef = useRef<{ month: number; year: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();

    if (
      lastFetchedRef.current &&
      lastFetchedRef.current.month === month &&
      lastFetchedRef.current.year === year
    ) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchCalendarData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(ViewEventCalendarAPI.ViewEventCalendar, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Month: month, Year: year }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setCalendarData(result.data);
          lastFetchedRef.current = { month, year };
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }
        console.error("Failed to fetch calendar data:", err);
        setError("Could not load availability. Please refresh.");
        setCalendarData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();

    return () => {
      controller.abort();
    };
  }, [currentMonth]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDaysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const statusMap = useMemo(() => {
    const map = new Map<string, string>();
    calendarData.forEach((item) => map.set(item.date, item.status));
    return map;
  }, [calendarData]);

  const { fullDates, partialDates, availableDates } = useMemo(() => {
    const full: Date[] = [];
    const partial: Date[] = [];
    const available: Date[] = [];

    allDaysInMonth.forEach((date) => {
      if (isBefore(date, today) || isSameDay(date, today)) return;
      const dateStr = date.toISOString().split("T")[0];
      const status = statusMap.get(dateStr);
      if (status === "FullyBooked") full.push(date);
      else if (status === "PartiallyBooked") partial.push(date);
      else available.push(date);
    });

    return {
      fullDates: full,
      partialDates: partial,
      availableDates: available,
    };
  }, [allDaysInMonth, statusMap, today]);

  const handleDayClick = (date: Date) => {
    if (isBefore(date, today) || isSameDay(date, today)) return;

    const dateStr = date.toISOString().split("T")[0];
    const status = statusMap.get(dateStr) || "Available";

    if (status === "FullyBooked") {
      setToastMessage("Fully Booked");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    setConfirmDate(date);
    setConfirmStatus(status);
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    if (confirmDate) {
      setSelectedBookingDate(confirmDate.toISOString().split("T")[0]);
      setBookingModalOpen(true);
    }
    setConfirmDate(null);
    setConfirmStatus(null);
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    setConfirmDate(null);
    setConfirmStatus(null);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setSearchError("Enter a search value.");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch(EventBookingAPI.ViewMyEvents, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Type: searchType, Value: searchValue.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message || `HTTP error ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setSearchResults(result.data);
      } else {
        setSearchError(result.message || "No event found.");
      }
    } catch (err) {
      setSearchError((err as Error).message || "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] px-4 py-10 pb-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-[4px] text-[#C850C0]">
              Event Booking
            </p>
            <h1 className="mt-2 text-3xl font-black">Availability Calendar</h1>
            <p className="mt-2 text-gray-400">
              Select an available date to reserve your event.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 outline-none backdrop-blur-xl"
            >
              {years.map((year) => (
                <option key={year} value={year} className="bg-[#0B0F19]">
                  {year}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="rounded-xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] px-5 py-3 font-bold text-white transition hover:scale-[1.02]"
            >
              View My Event
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-4 backdrop-blur-xl">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-[#C850C0]" />
            </div>
          ) : error ? (
            <div className="flex h-96 items-center justify-center text-red-400">
              {error}
            </div>
          ) : (
            <div className="flex justify-center">
              <DayPicker
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                fixedWeeks
                showOutsideDays
                startMonth={startOfMonth(today)}
                disabled={(date) =>
                  isBefore(date, today) || isSameDay(date, today)
                }
                modifiers={{
                  full: fullDates,
                  partial: partialDates,
                  available: availableDates,
                }}
                modifiersClassNames={{
                  full: "calendar-full",
                  partial: "calendar-partial",
                  available: "calendar-available",
                }}
                onDayClick={handleDayClick}
              />
            </div>
          )}

          <div className="my-4 border-t border-white/10" />
          <div>
            <h2 className="mb-2 text-2xl font-bold">Booking Status</h2>
            <div className="flex w-full flex-row items-stretch justify-around gap-2">
              <div className="flex flex-1 flex-col items-center rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center">
                <span className="text-sm font-medium sm:text-base">
                  Fully Booked
                </span>
                <div className="mt-1.5 h-5 w-5 rounded-full bg-red-500" />
              </div>
              <div className="flex flex-1 flex-col items-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-center">
                <span className="text-sm font-medium text-yellow-300 sm:text-base">
                  Partially Booked
                </span>
                <div className="mt-1.5 h-5 w-5 rounded-full bg-yellow-400" />
              </div>
              <div className="flex flex-1 flex-col items-center rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center">
                <span className="text-sm font-medium text-green-300 sm:text-base">
                  Fully Available
                </span>
                <div className="mt-1.5 h-5 w-5 rounded-full border-2 border-green-500 bg-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-red-500/90 px-6 py-3 text-white shadow-xl backdrop-blur-sm">
          {toastMessage}
        </div>
      )}

      {showConfirm && confirmDate && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleConfirmNo();
          }}
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0B0F19]/95 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F]" />
            <h3 className="text-xl font-bold text-white">Book Event</h3>
            <p className="mt-2 text-sm text-gray-300">
              Do you want to book an event on{" "}
              <strong className="text-white">
                {format(confirmDate, "dd/MM/yyyy")}
              </strong>
              ?
              {confirmStatus === "PartiallyBooked" && (
                <span className="ml-1 text-yellow-300">
                  (Partially booked - still available)
                </span>
              )}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleConfirmYes}
                className="flex-1 rounded-2xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] py-3 font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
              >
                Yes
              </button>
              <button
                onClick={handleConfirmNo}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingModal
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedBookingDate("");
        }}
        initialDate={selectedBookingDate}
      />

      {showSearchModal && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSearchModal(false);
              setSearchError(null);
              setSearchResults([]);
              setSearchValue("");
            }
          }}
        >
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19]/95 shadow-2xl backdrop-blur-2xl">
            <button
              onClick={() => {
                setShowSearchModal(false);
                setSearchError(null);
                setSearchResults([]);
                setSearchValue("");
              }}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              Close
            </button>

            <div className="max-h-[80vh] overflow-hidden">
              <div className="border-b border-white/10 px-6 py-5">
                <h3 className="text-xl font-bold text-white">View My Event</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Search by Booking ID, Booking No, or Mobile Number.
                </p>
              </div>

              <div className="space-y-4 px-6 py-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <select
                    value={searchType}
                    onChange={(e) =>
                      setSearchType(e.target.value as typeof searchType)
                    }
                    className="appearance-none rounded-2xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-white outline-none transition duration-200 hover:border-white/20"
                  >
                    <option
                      value="BookingNo"
                      className="bg-[#0B0F19] text-white"
                    >
                      Booking No
                    </option>
                    <option
                      value="BookingID"
                      className="bg-[#0B0F19] text-white"
                    >
                      Booking ID
                    </option>
                    <option
                      value="MobileNumber"
                      className="bg-[#0B0F19] text-white"
                    >
                      Mobile Number
                    </option>
                  </select>

                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Enter search value"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500"
                  />

                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="rounded-2xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FF512F] px-4 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </button>
                </div>

                {searchError && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    {searchError}
                  </div>
                )}
              </div>

              <div className="max-h-[55vh] overflow-y-auto px-6 pb-6">
                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">
                      Event Results
                    </h4>
                    <div className="space-y-3">
                      {searchResults.map((event) => (
                        <div
                          key={event.BookingID}
                          className="rounded-3xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-gray-400">
                              Booking No:
                            </span>
                            <span className="font-semibold text-white">
                              {event.BookingNo}
                            </span>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#111827] p-3">
                              <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                                Name
                              </p>
                              <p className="mt-1 text-white text-sm">
                                {event.CustomerName}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-[#111827] p-3">
                              <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                                Mobile
                              </p>
                              <p className="mt-1 text-white text-sm">
                                {event.MobileNumber}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-[#111827] p-3">
                              <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                                Event Date
                              </p>
                              <p className="mt-1 text-white text-sm">
                                {format(
                                  new Date(event.EventDate),
                                  "dd MMM yyyy",
                                )}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-[#111827] p-3">
                              <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                                End Date
                              </p>
                              <p className="mt-1 text-white text-sm">
                                {format(
                                  new Date(event.EventEndDate),
                                  "dd MMM yyyy",
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#111827] p-3">
                              <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                                Event Type
                              </p>
                              <p className="mt-1 text-white text-sm">
                                {event.EventTypeName}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-[#111827] p-3">
                              <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                                Status
                              </p>
                              <p className="mt-1 text-white text-sm">
                                {event.BookingStatus}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 rounded-2xl bg-[#111827] p-3">
                            <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                              Location
                            </p>
                            <p className="mt-1 text-white text-sm whitespace-pre-line">
                              {event.EventLocation}
                            </p>
                          </div>
                          <div className="mt-3 rounded-2xl bg-[#111827] p-3">
                            <p className="text-[10px] uppercase tracking-[.32em] text-gray-500">
                              Notes
                            </p>
                            <p className="mt-1 text-white text-sm whitespace-pre-line">
                              {event.Notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
