# Setup Guide: CampusConnect Frontend

## Prerequisites
- Node.js 18+ and npm 8+
- A running CampusConnect backend (see backend repo)

## Steps

1. Clone this repo:
   git clone git@github.com:stevebraown/campusconnect-frontend.git
   cd campusconnect-frontend

2. Install dependencies:
   npm install

3. Create `.env` from `.env.example`:
   cp .env.example .env

4. Update `.env` with your backend URL (if not localhost:5001):
   VITE_API_URL=http://your-backend-url:5001
   VITE_SOCKET_URL=http://your-backend-url:5001

5. Run locally:
   npm run dev
   Frontend will be at http://localhost:5173

6. Build for production:
   npm run build

7. Run with Docker:
   docker build -t campusconnect-frontend .
   docker run -p 3000:3000 campusconnect-frontend

## Troubleshooting

**CORS errors when calling backend?**
- Ensure VITE_API_URL matches your backend address.
- Check that backend has CORS enabled.

**WebSocket connection fails?**
- Ensure VITE_SOCKET_URL is set correctly.
- Check that backend socket.io is running.
