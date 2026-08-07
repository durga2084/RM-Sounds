import { APIBaseURL } from "./API_BaseURL";

export const EventBookingAPI = {
  CreateEvent: `${APIBaseURL}/EventBookings/CreateEvent`,
  ViewMyEvents: `${APIBaseURL}/EventBookings/ViewMyEvents`,
} as const;
