# AssetManager-Mobile

Mobile app for browsing and reserving company equipment (laptops, cameras, and other assets), built with **Expo** and **React Native**. Talks to a NestJS backend for auth, equipment listings, and reservation management.

## Features

- 🔐 JWT-based authentication (token stored securely via `expo-secure-store`)
- 📦 Browse available equipment
- 📅 Interactive calendar for creating reservations (daily and hourly booking modes depending on equipment type)
- ⏳ Buffer-day handling — equipment can require a preparation gap between reservations
- ✏️ View, edit, cancel, and return your own reservations
- 🚫 Prevents booking equipment that's already reserved, in maintenance, or retired

## Tech Stack

- [Expo](https://expo.dev) (SDK 57) + [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- React Native 0.86 / React 19
- `expo-secure-store` for token storage
- `@expo/vector-icons` for icons

## Prerequisites

- Node.js (LTS recommended)
- npm
- [Expo Go](https://expo.dev/go) app on your phone, or an Android/iOS simulator
- A running instance of the backend API (NestJS)

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/Squezer123/AssetManager-Mobile.git
   cd AssetManager-Mobile
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Point the app at your backend**

   The API base URL is currently set in `lib/auth.js` (or wherever `API_URL` is defined):

   ```js
   export const API_URL = 'http://localhost:3001';
   ```

   Update this to match your backend's address — if you're testing on a physical device, `localhost` won't work; use your machine's LAN IP instead (e.g. `http://192.168.1.10:3001`).

4. **Start the app**

   ```bash
   npm start
   ```

   Then choose a platform:

   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Project Structure

```
.
├── app/          # Screens and routes (Expo Router)
├── lib/          # API clients, auth helpers
├── assets/       # Images, fonts, icons
├── .claude/      # Claude Code configuration
├── app.json      # Expo app config
└── package.json
```

## Backend API

This app expects a NestJS backend exposing endpoints such as:

- `POST /auth/login` — authenticate and receive an access token
- `GET /users/me` — current user info
- `GET /equipment/:id` — equipment details, including existing reservations
- `POST /reservations` — create a reservation
- `GET /reservations/me` — list your reservations
- `PATCH /reservations/:id` — edit a reservation's dates
- `PATCH /reservations/:id/cancel` — cancel a reservation
- `PATCH /reservations/:id/return` — mark equipment as returned

All reservation routes require a valid JWT in the `Authorization: Bearer <token>` header.

## License

MIT
