# Daily Report

Daily report app with mobile, desktop, and server packages.

## Quick Start

- Install dependencies with npm.
- Run server: npm run dev:server
- Run desktop: npm run dev:desktop
- Run mobile: npm run dev:mobile

## Phone Setup (Expo)

- Set apps/mobile/.env with your LAN IP, for example: EXPO_PUBLIC_API_BASE=http://192.168.1.20:4000
- Ensure the phone and dev machine are on the same network.

## Packages

- apps/mobile: React Native app (Expo)
- apps/desktop: Electron desktop app
- packages/server: Node/Express backend
- packages/shared: Shared schemas and helpers
