# 🚗 RYDO — Ride Booking App

> A full-stack ride-hailing web app built with the MERN stack.  
> Passengers book rides, drivers accept them — all in real-time.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

---

## 💡 About

RYDO is a ride booking platform I built to explore full-stack development end-to-end — from JWT auth and REST APIs to real-time communication with Socket.io and live map routing. It supports two roles: **Passenger** and **Driver**, each with their own dashboard and ride flow.

No paid APIs were used — everything runs on free, open-source services.

---

## ✨ Features

### 👤 Passenger
- Register & login with JWT authentication
- Search pickup & drop locations (Nominatim autocomplete)
- Choose vehicle — Auto, Sedan, or SUV with fare preview
- View live route on map with distance & duration
- Pay via **Razorpay** or **Cash on Delivery**
- OTP-based ride start for security
- Real-time driver tracking via Socket.io
- Ride history, cancellation & driver rating
- Profile management

### 🚘 Driver
- Register with vehicle details
- Go online/offline toggle
- Incoming ride requests with 30-second countdown
- Accept, start (OTP), and complete rides
- Earnings dashboard & ride history
- Profile management

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Axios |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT, bcryptjs |
| Realtime | Socket.io |
| Maps | React-Leaflet, OpenStreetMap |
| Geocoding | Nominatim (free, no key needed) |
| Routing | OpenRouteService — HeiGIT API |
| Payment | Razorpay Test Mode |

---

## 📁 Project Structure

```
RYDO/
├── client/                  # React Frontend
│   └── src/
│       ├── components/      # Map, Sidebar, UI components
│       ├── context/         # Auth, Ride, Socket contexts
│       ├── hooks/           # Custom hooks
│       ├── pages/           # Auth, Passenger, Driver pages
│       ├── services/        # API, ORS, Nominatim services
│       └── utils/           # Fare calculator, formatters
│
└── server/                  # Node.js Backend
    ├── config/              # MongoDB connection
    ├── controllers/         # Auth, Ride, Driver, Payment
    ├── middleware/          # Auth, Role check, Validation
    ├── models/              # User, Driver, Ride, Payment
    ├── routes/              # All API routes
    ├── socket/              # Socket.io handler
    └── utils/               # Helpers
```

---

## ⚙️ Environment Setup

### Backend — create `.env` in root:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=rydo_super_secret_2024
PORT=5000
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
ORS_API_KEY=your_heigit_api_key
```

### Frontend — create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/anujverma1103/RYDO.git
cd RYDO

# 2. Install all dependencies
npm run install:all

# 3. Seed demo data
cd server && node seed.js

# 4. Start backend
cd server && node index.js

# 5. Start frontend (new terminal)
cd client && npm run dev
```

- Frontend → `http://localhost:5173`
- Backend → `http://localhost:5000`

---

## 🔑 Demo Accounts

### Passengers
| Name | Email | Password |
|---|---|---|
| Rahul Sharma | passenger1@rydo.com | pass123 |
| Priya Singh | passenger2@rydo.com | pass123 |

### Drivers
| Name | Email | Password | Vehicle |
|---|---|---|---|
| Amit Kumar | driver1@rydo.com | pass123 | Auto |
| Suresh Yadav | driver2@rydo.com | pass123 | Sedan |
| Ravi Gupta | driver3@rydo.com | pass123 | SUV |

---

## 📡 API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user/driver |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Passenger
| Method | Route | Description |
|---|---|---|
| POST | `/api/rides/book` | Book a ride |
| GET | `/api/rides/my` | Ride history |
| PUT | `/api/rides/:id/cancel` | Cancel ride |
| POST | `/api/rides/:id/rate` | Rate driver |

### Driver
| Method | Route | Description |
|---|---|---|
| PUT | `/api/driver/toggle-status` | Go online/offline |
| GET | `/api/driver/available-rides` | View available rides |
| PUT | `/api/rides/:id/accept` | Accept ride |
| PUT | `/api/rides/:id/start` | Start ride (OTP) |
| PUT | `/api/rides/:id/complete` | Complete ride |
| GET | `/api/driver/earnings` | View earnings |

### Map
| Method | Route | Description |
|---|---|---|
| POST | `/api/map/route` | Get route between two points |

---

## 🔌 Socket Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `join-room` | `userId` |
| Client → Server | `driver-location` | `{ rideId, driverId, lat, lng }` |
| Server → Client | `new-ride-request` | Ride details |
| Server → Client | `ride-accepted` | Driver details |
| Server → Client | `ride-started` | OTP |
| Server → Client | `ride-completed` | Ride summary |
| Server → Client | `location-update` | `{ lat, lng }` |

---

## 🌐 Free Services Used

| Service | Purpose |
|---|---|
| MongoDB Atlas | Database (512MB free tier) |
| OpenStreetMap | Map tiles |
| Nominatim | Location search & geocoding |
| HeiGIT / OpenRouteService | Route drawing (2000 req/day free) |
| Razorpay | Payment gateway (Test Mode) |

---

## 👨‍💻 Built By

**Anuj Verma**  
GitHub: [@anujverma1103](https://github.com/anujverma1103)

---

> ⭐ If you like this project, consider giving it a star!