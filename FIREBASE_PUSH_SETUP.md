# RM Sounds Firebase Push Notification Setup

This integration adds:
- Customer and Admin FCM subscriptions in MySQL/Prisma.
- Customer subscription linking by mobile number.
- New booking -> Admin push notification.
- Booking status change -> Customer push notification.
- Browser enable-notification button for both PWAs.
- Firebase background notification handling in the existing service worker.

## 1. Install packages

npm install

## 2. Firebase project

Create a Firebase project and register the RM Sounds web app.

Firebase Console:
https://console.firebase.google.com/

Project settings -> General -> Your apps -> Web app.

Copy the Firebase Web App configuration into the NEXT_PUBLIC_FIREBASE_* variables.

## 3. Web Push certificate

Firebase Console -> Project settings -> Cloud Messaging -> Web configuration -> Web Push certificates -> Generate key pair.

Put the public key into NEXT_PUBLIC_FIREBASE_VAPID_KEY.

## 4. Service account

Firebase Console -> Project settings -> Service accounts -> Firebase Admin SDK -> Generate new private key.

DO NOT commit the JSON file.

Copy:
- project_id -> FIREBASE_PROJECT_ID
- client_email -> FIREBASE_CLIENT_EMAIL
- private_key -> FIREBASE_PRIVATE_KEY

## 5. Important service worker step

Because RM Sounds already has public/service-worker.js, this integration uses the existing service worker rather than registering a second root-scope service worker.

Replace the six placeholders at the top of public/service-worker.js with the same Firebase Web App config values.

Do not put the Firebase Admin service-account private key in this file.

## 6. Database

After reviewing the schema:

npx prisma generate
npx prisma db push

This creates FcmSubscriptions.

## 7. Environment variables

Use .env.example as the template. Set the variables in your local .env and in Hostinger's Node.js environment variables.

Never use NEXT_PUBLIC_ for:
- FIREBASE_PRIVATE_KEY
- FIREBASE_CLIENT_EMAIL

## 8. Test

1. npm run build
2. Deploy.
3. Open https://rmsounds.site/
4. Click Enable notifications.
5. Allow browser notifications.
6. Log in to /Login as admin.
7. Enable notifications in the admin PWA.
8. Create a booking.
9. Admin should receive a New Booking Received notification.
10. Change booking status from the admin panel.
11. The customer device associated with that mobile number should receive the status notification.

## Security

The uploaded project archive contained a real .env file with database credentials and JWT secret. Rotate those credentials/secrets immediately and remove the real .env from Git/version control.
