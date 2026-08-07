# RM Sounds Client README

## Overview

This document describes the client-facing web app for RM Sounds. The client app is built with Next.js, React, Tailwind CSS, and TypeScript.

## Purpose

The client site presents RM Sounds services and enables users to:
- view the landing page and service showcase
- browse equipment categories and featured systems
- view event galleries and image previews
- contact RM Sounds via displayed phone, email, and address
- check event availability on an interactive calendar
- submit booking requests or contact inquiries through backend APIs

## Key Pages

- `app/(client)/page.tsx`
  - Public home page with hero section, featured systems, and service highlights.
- `app/(client)/ExploreSystems/page.tsx`
  - Detailed category pages for sound systems, roadshow rigs, speaker/amplifier packages, and LED visual systems.
- `app/(client)/GalleryImages/page.tsx`
  - Public image gallery with lightbox preview and swipe/keyboard navigation.
- `app/(client)/ContactUs/page.tsx`
  - Contact page with business details, phone/email links, Google Map embed, and booking CTA.
- `app/(client)/Calendar/page.tsx`
  - Booking calendar page showing available, partially booked, and fully booked days.

## App Layout and Shared Components

- `app/(client)/layout.tsx`
  - Wraps client pages in `ClientShell`.
- `components/public/ClientShell.tsx`
  - Adds shared layout features: `Navbar`, `FloatingButtons`, and `MobileBottomNav`.
- `app/(client)/client.css`
  - Client-specific styling overrides and global client UI styles.

## API Integration

The client uses constants from `app/(client)/1constants` to call backend APIs.

Important API endpoints:
- `ContactDetailsAPI.GetContactDetails`
- `EventBookingAPI.CreateEvent`
- `EventBookingAPI.ViewMyEvents`
- `GalleryImagesAPI.GetGalleryImages`
- `ViewEventCalendarAPI.ViewEventCalendar`
- `API_WhatsappNumber` for WhatsApp contact data

API base URL:
- `app/(client)/1constants/API_BaseURL.ts`
  - Uses `NEXT_PUBLIC_API_BASE_URL` or defaults to `http://localhost:3000`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Build and Production

- Build the app:
  ```bash
  npm run build
  ```
- Run the production server:
  ```bash
  npm start
  ```

## Notes

- This client app is part of a full-stack Next.js application and depends on server-side API routes under `app/api`.
- The client uses `react-day-picker` for calendar interactions and `lucide-react` icons throughout.
- The public gallery supports remote image URLs and uses `next/image`.
- Environment variable support is minimal; set `NEXT_PUBLIC_API_BASE_URL` when the backend is hosted separately.

## Dependencies

Key dependencies used by the client app:
- `next` 16.2.9
- `react` 19.2.4
- `typescript` 5
- `tailwindcss` v4
- `react-day-picker`
- `lucide-react`
- `sonner`
- `date-fns`

## Useful Files

- `app/(client)/1constants/Images.ts`
- `app/(client)/1constants/Videos.ts`
- `components/public/Navbar.tsx`
- `components/public/FloatingButtons.tsx`
- `components/public/MobileBottomNav.tsx`
- `app/(client)/api/*`

## Recommended Workflow

- Edit page content in `app/(client)`.
- Update API paths in `app/(client)/1constants` when backend changes.
- Test calendar, gallery, and contact page flows during development.
