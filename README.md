# RYDO

RYDO is a full stack MERN ride booking application for a BCA final year project. It has two roles only: Passenger and Driver. It uses free map services instead of Google Maps.

## Features

- Passenger and driver registration/login with JWT and bcryptjs.
- Role-based protected routes for `/passenger/*` and `/driver/*`.
- Passenger ride booking wizard: locations, vehicle, payment.
- OpenStreetMap tiles with `react-leaflet`.
- Nominatim autocomplete and reverse geocoding without an API key.
- OpenRouteService route drawing with distance and duration.
- Fare calculation: Auto, Sedan, SUV.
- Socket.io ride events and live driver location tracking.
- Driver online/offline toggle and 30-second incoming request cards.
- OTP-based ride start.
- COD and Razorpay Test Mode online payments.
- Passenger ride history, profile, cancellation, and driver rating.
- Driver earnings, completed ride history, profile, and vehicle display.
- Seed script with 2 passengers, 3 drivers, and 6 completed rides.

## Tech Stack

- Frontend: React, React Router v6, Tailwind CSS, Axios, React Hot Toast, React Icons
- Backend: Node.js, Express, Mongoose, Express Validator
- Auth: JWT, bcryptjs
- Realtime: Socket.io
- Maps: react-leaflet, Leaflet, OpenStreetMap
- Search: Nominatim
- Routes: OpenRouteService
- Payment: Razorpay Test Mode

## Project Structure

```text
client/
  src/
    components/
    context/
    hooks/
    pages/
    services/
    utils/
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  socket/
  utils/
```

## Environment

Create `.env` in the project root for the backend:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=rydo_super_secret_2024
PORT=5000
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

Create `client/.env` for the frontend:

```env
VITE_API_URL=http://localhost:5000
VITE_ORS_API_KEY=your_openrouteservice_key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Get a free OpenRouteService key from `openrouteservice.org`. Razorpay should be configured in Test Mode.

## Setup

```bash
npm run install:all
npm run seed
npm run dev:server
npm run dev:client
```

The backend runs on `http://localhost:5000`. The frontend runs on `http://localhost:5173`.

## Demo Accounts

Seeded passengers:

- `passenger1@rydo.com` / `pass123` - Rahul Sharma
- `passenger2@rydo.com` / `pass123` - Priya Singh

Seeded drivers:

- `driver1@rydo.com` / `pass123` - Amit Kumar, Auto
- `driver2@rydo.com` / `pass123` - Suresh Yadav, Sedan
- `driver3@rydo.com` / `pass123` - Ravi Gupta, SUV

## API Routes

### Auth

- `POST /api/auth/register`
  Body: `name`, `email`, `password`, `phone`, `role`, optional driver vehicle fields.
- `POST /api/auth/login`
  Body: `email`, `password`.
- `GET /api/auth/me`
  Requires JWT.

### Passenger

- `GET /api/passenger/profile`
- `PUT /api/passenger/profile`
- `POST /api/rides/book`
- `GET /api/rides/my`
- `GET /api/rides/:id`
- `PUT /api/rides/:id/cancel`
- `POST /api/rides/:id/rate`
- `POST /api/payment/create-order`
- `POST /api/payment/verify`

### Driver

- `GET /api/driver/profile`
- `PUT /api/driver/profile`
- `PUT /api/driver/toggle-status`
- `GET /api/driver/available-rides`
- `PUT /api/rides/:id/accept`
- `PUT /api/rides/:id/start`
- `PUT /api/rides/:id/complete`
- `GET /api/driver/earnings`
- `GET /api/driver/history`

## Socket Events

Clients emit:

- `join-room` with the user id.
- `driver-location` with `rideId`, `driverId`, `lat`, and `lng`.

Server emits:

- `new-ride-request`
- `ride-accepted`
- `ride-started`
- `ride-completed`
- `ride-cancelled`
- `location-update`

## Deployment

- Frontend: Vercel free tier.
- Backend: Render free tier.
- Database: MongoDB Atlas free 512MB cluster.
- Maps: OpenStreetMap tiles through Leaflet.
- Routes: OpenRouteService free key with 2000 requests/day.
- Payment: Razorpay Test Mode.

For deployment, set the same environment variables in the hosting dashboards. `CLIENT_URL` must match the deployed frontend URL, and `VITE_API_URL` must match the deployed backend URL.
