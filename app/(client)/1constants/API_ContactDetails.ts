import { APIBaseURL } from "./API_BaseURL";

export const ContactDetailsAPI = {
  GetContactDetails: `${APIBaseURL}/ContactDetails/GetContactDetails`,
} as const;
