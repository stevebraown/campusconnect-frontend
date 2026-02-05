# CampusConnect Frontend

React + Vite frontend for CampusConnect. This is a standalone repo that communicates only with backend APIs (no Firebase SDK).

## Prerequisites
- Node.js 20+
- npm

## Setup
```bash
npm install
```

Create `.env` from `.env.example` and update values as needed.

## Environment Variables
- `VITE_API_URL` (e.g., http://localhost:5001)
- `VITE_SOCKET_URL` (e.g., http://localhost:5001)

## API-Only Architecture
- This frontend communicates exclusively via HTTP/WebSocket with the CampusConnect backend.
- No direct Firebase access; all backend integration is via REST API.
- See `VITE_API_URL` in `.env.example` for backend configuration.

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

## Troubleshooting
**CORS errors when calling backend?**
- Ensure `VITE_API_URL` matches your backend address.
- Confirm the backend has CORS enabled.

**WebSocket connection fails?**
- Ensure `VITE_SOCKET_URL` is set correctly.
- Confirm the backend socket.io server is running.

## Notes
- Frontend communicates only via backend APIs.
- No direct Firebase access or SDK usage.
