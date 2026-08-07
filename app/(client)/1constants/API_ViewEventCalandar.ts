import { APIBaseURL } from "./API_BaseURL";

export const ViewEventCalendarAPI = {
  ViewEventCalendar: `${APIBaseURL}/EventBookings/ViewCalendarEvents`,
} as const;
