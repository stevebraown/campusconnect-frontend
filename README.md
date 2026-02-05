# CampusConnect Frontend

React + Vite frontend for CampusConnect. Communicates only with backend APIs (no Firebase SDK).

## Prerequisites
- Node.js 20+
- npm

## Setup
```bash
npm install
```

Create `.env` (see `.env.example`).

## Environment Variables
- `VITE_API_URL` (e.g., http://localhost:5001)
- `VITE_SOCKET_URL` (e.g., http://localhost:5001)

## Run locally
```bash
npm run dev
```

## Build for production
```bash
npm run build
```

## Docker
```bash
docker build -t campusconnect-frontend .
docker run --rm -p 3000:3000 campusconnect-frontend
```

## Notes
- Frontend communicates only via backend APIs.
- No direct Firebase access or SDK usage.
