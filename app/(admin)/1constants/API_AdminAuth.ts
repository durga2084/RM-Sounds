import { APIBaseURL } from "./API_BaseURL";

export const AdminAuthAPI = {
  Logout: `${APIBaseURL}/AdminLogout`,
} as const;
