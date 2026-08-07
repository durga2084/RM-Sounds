import { APIBaseURL } from "./API_BaseURL";

export const AdminContactDetailsAPI = {
  GetContactDetails: `${APIBaseURL}/AdminContactDetails/GetContactDetails`,
  PostContactDetails: `${APIBaseURL}/AdminContactDetails/PostContactDetails`,
  DeleteContactDetails: `${APIBaseURL}/AdminContactDetails/DeleteContactDetails`,
  UpdateContactStatus: `${APIBaseURL}/AdminContactDetails/UpdateContactStatus`,
} as const;
