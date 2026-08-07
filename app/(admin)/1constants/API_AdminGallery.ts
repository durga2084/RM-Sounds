import { APIBaseURL } from "./API_BaseURL";

export const AdminGalleryAPI = {
  GetGalleryImages: `${APIBaseURL}/AdminGallery/GetGalleryImages`,
  PostGalleryImage: `${APIBaseURL}/AdminGallery/PostGalleryImage`,
  DeleteGalleryImage: `${APIBaseURL}/AdminGallery/DeleteGalleryImage`,
} as const;
