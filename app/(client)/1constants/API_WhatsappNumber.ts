import { APIBaseURL } from "./API_BaseURL";

export const WhatsappNumberAPI = {
  GetWhatsappNumber: `${APIBaseURL}/ContactDetails/WhatsappNumber`,
} as const;
