import { APIBaseURL } from "./API_BaseURL";

export const AdminEventTypesAPI = {
  GetEventTypes: `${APIBaseURL}/AdminEventTypes/GetEventTypes`,
  PostEventType: `${APIBaseURL}/AdminEventTypes/PostEventType`,
  DeleteEventType: `${APIBaseURL}/AdminEventTypes/DeleteEventType`,
  UpdateEventTypeStatus: `${APIBaseURL}/AdminEventTypes/UpdateEventTypeStatus`,
} as const;
