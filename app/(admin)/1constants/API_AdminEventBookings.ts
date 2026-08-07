import { APIBaseURL } from "./API_BaseURL";

export const AdminEventBookingAPI = {
  GetEventBookings: `${APIBaseURL}/AdminEventBookings/GetEventBookings`,
  UpdateEventBookingStatus: `${APIBaseURL}/AdminEventBookings/UpdateEventBookingStatus`,
} as const;
