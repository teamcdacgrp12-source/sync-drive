# SyncDrive

A real-time **watch party** platform — a host plays a video and everyone in the room watches it perfectly in sync, with live chat and WebRTC camera/screen sharing.

## Project Structure

```
syncdrive-v2/
├── backend/
│   └── discovery-service/    # Eureka service registry (:8761) — first service, more to come
├── frontend/
│   └── syncdrive-fe/         # React 19 + Vite frontend (:5173)
└── uploads/                  # Shared avatar upload directory
```

## Planned Backend Services

| # | Service | Port | Role |
|---|---|---|---|
| 1 | discovery-service | 8761 | Eureka registry — everything registers here |
| 2 | gateway-service | 8080 | Single entry point, JWT validation, routing |
| 3 | auth-service | 8081 | Register / login / JWT issuing |
| 4 | user-service | 8084 | Profiles + avatars |
| 5 | room-service | 8082 | Create / join / leave rooms |
| 6 | chat-service | 8083 | WebSocket hub, chat, WebRTC signaling |
| 7 | stream-service | 8085 | Synchronized stream state |

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.5, Spring Cloud (Eureka, Gateway, OpenFeign), MySQL, Redis, Flyway
- **Frontend:** React 19, Vite, React Router, Axios, SockJS/STOMP, WebRTC

## Getting Started

### Discovery Service
```bash
cd backend/discovery-service
./mvnw spring-boot:run
# Eureka dashboard: http://localhost:8761
```

### Frontend
```bash
cd frontend/syncdrive-fe
npm install
npm run dev
# App: http://localhost:5173
```

