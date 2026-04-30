# Darak Mobile

Flutter mobile client scaffold for the Darak platform.

The mobile app is designed to reuse the same Next.js backend API:

- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Listings: `/api/listings`
- Messages: `/api/messages/conversations`, `/api/messages`
- Appointments: `/api/appointments`
- Reviews: `/api/reviews`
- Tickets: `/api/tickets`
- Notifications: `/api/notifications`

## Run

Install Flutter, then from this folder:

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

For a real phone on the same Wi-Fi, replace `10.0.2.2` with your computer IP.

For production:

```bash
flutter run --dart-define=API_BASE_URL=https://your-vercel-domain.com
```
