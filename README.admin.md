# RM Sounds Admin README

## Overview

This document describes the admin dashboard for RM Sounds. The admin app is a protected Next.js route tree built with React, Tailwind CSS, and TypeScript.

## Purpose

The admin dashboard allows RM Sounds staff to manage:
- admin user login and authentication
- event bookings and booking status updates
- event type catalog entries
- gallery image uploads and deletions
- contact locations and contact details

## Key Pages

- `app/(admin)/Login/page.tsx`
  - Admin login page with credential entry and JWT-backed session storage.
- `app/(admin)/Dashboard/page.tsx`
  - Dashboard for viewing and managing booking records, including status updates and booking details.
- `app/(admin)/EventTypes/page.tsx`
  - Event type management page with CRUD and status toggles.
- `app/(admin)/Gallery/page.tsx`
  - Gallery management page for uploading and deleting images.
- `app/(admin)/Locations/page.tsx`
  - Location/contact management page for storing addresses, phone numbers, emails, and map embeds.

## App Layout and Shared Components

- `app/(admin)/layout.tsx`
  - Admin page shell that conditionally hides the bottom navigation on login.
- `components/admin/AdminBottomNav.tsx`
  - Bottom navigation used across admin pages.

## Authentication

- Admin auth uses JWT tokens stored in both `localStorage` and a cookie named `token`.
- `services/SimpleJwt.ts`
  - Handles JWT signing and verification via HS256.
- `services/AuthService.ts`
  - Provides helper logic for authenticated API requests.
- `app/(admin)/1constants/API_BaseURL.ts`
  - Uses `NEXT_PUBLIC_API_BASE_URL` or `http://localhost:3000`.
- `app/(admin)/1constants/API_AdminLogin.ts`
  - Contains the admin login endpoint constant.

## Admin API Integration

Admin API endpoints are defined in `app/(admin)/1constants`:
- `AdminContactDetailsAPI` for contact/location CRUD and status updates
- `AdminEventBookingAPI` for booking fetch and status updates
- `AdminEventTypesAPI` for event type CRUD and status toggles
- `AdminGalleryAPI` for gallery upload, listing, and deletion
- `AdminLoginAPI` for sign-in

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000/Login` to access the admin login page.

## Environment Variables

The app supports the following environment variables:
- `NEXT_PUBLIC_API_BASE_URL`
  - Controls the API base URL for both client and admin route constants.
  - Defaults to `http://localhost:3000` when not set.
- `JWT_SECRET`
  - Used by server-side authentication verification in `services/SimpleJwt.ts`.
  - Important for production security; do not use the default fallback value.

## Notes

- The admin dashboard is mounted under the Next.js route segment `app/(admin)`.
- `app/(admin)/layout.tsx` wraps pages in a dark admin shell and renders `AdminBottomNav` except on the login screen.
- Booking status changes can be set to `Accepted`, `Rejected`, `Cancelled`, or `Completed` within the dashboard.
- Gallery uploads are handled via `FormData` and require backend support for image upload processing.
- Location and contact records are fetched/updated through `AdminContactDetailsAPI`.

## Dependencies

Important admin dependencies:
- `next` 16.2.9
- `react` 19.2.4
- `typescript` 5
- `tailwindcss` v4
- `lucide-react`
- `sonner`
- `date-fns`

## Recommended Workflow

- Confirm backend API routes are available before using admin features.
- Keep API endpoint constants in sync with the server routes in `app/(admin)/1constants`.
- Use `npm run lint` to verify the code style and catch issues early.

## Useful Files

- `app/(admin)/1constants/API_AdminBaseURL.ts`
- `app/(admin)/1constants/API_AdminContactDetails.ts`
- `app/(admin)/1constants/API_AdminEventBookings.ts`
- `app/(admin)/1constants/API_AdminEventTypes.ts`
- `app/(admin)/1constants/API_AdminGallery.ts`
- `services/SimpleJwt.ts`
- `components/admin/AdminBottomNav.tsx`
