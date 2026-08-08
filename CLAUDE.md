# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend** (`cd backend`):
```bash
npm install
npm start        # Express server on port 9000
```

**Frontend** (`cd frontend`):
```bash
npm install
npm start        # Dev server with hot reload on port 3000
npm run build    # Production build
npm test         # Run tests via react-scripts
```

**Health check**:
```bash
curl http://localhost:9000/healthcheck
```

**Infrastructure** (`cd health-check`):
```bash
pip install -r requirements.txt -t ./FunctionHealth
sam build
sam deploy --guided
```

## Architecture

AgilFacil is a real-time collaborative agile planning tool with two main features: **Kanban boards** and **Planning Poker** rooms. Both use WebSockets for live multi-user synchronization.

### Request flow

```
React (port 3000) ──HTTP──▶ Express REST (port 9000)
                  ──WS───▶ Socket.io handlers ──▶ broadcast to room
```

Nginx in production proxies `/socket/` to the backend and everything else to the frontend. The backend serves HTTP in dev and HTTPS in prod (Let's Encrypt certs), toggled by `NODE_ENV=prod` in `backend/.env`.

### Real-time layer

Socket connections carry query params: `userName`, `userId`, `idSession`, `service` (`board` | `poker`). [backend/socket/indexSocket.js](backend/socket/indexSocket.js) routes incoming events to either `socketBoardService.js` or `socketPokerService.js`. The frontend manages socket lifecycle through [frontend/src/customHooks/useSocket.js](frontend/src/customHooks/useSocket.js).

### Authentication

AWS Cognito via Amplify issues JWT tokens on the frontend. Protected backend routes call `validateToken` middleware ([backend/services/generic/validateToken.js](backend/services/generic/validateToken.js)) which verifies the JWT against the Cognito JWKS endpoint. Guest access routes skip this middleware.

### Data persistence

DynamoDB is the primary store (tables: `board`, `room`; region: `sa-east-1`). The `board` table has GSI `gsi_board_user` for per-user board queries. NeDB ([backend/database/index.js](backend/database/index.js)) is the local fallback when AWS credentials are unavailable. Table names and index names are centralized in [backend/config.js](backend/config.js).

### Backend service organization

`backend/services/` is organized by domain:
- `board/` — Kanban board CRUD (`controllerBoardService.js`) and socket event handlers (`socketBoardService.js`)
- `poker/` — Poker room CRUD (`controllerPokerService.js`) and socket event handlers (`socketPokerService.js`)
- `generic/` — JWT validation, CloudWatch structured logging, SNS publishing

### Frontend page organization

`frontend/src/pages/` mirrors the backend domains:
- `board/` — BoardPage, CreateBoardPage, BoardListPage, GuestUrlBoardPage, ExportPDFPage
- `poker/` — CreateAndEnterRoomPage, RoomPage, GuestUrlPage, NotificationPage
- `generic/` — HomePage, AboutPage, LoaderPage, SolicitaLoginPage

Routes and the `<ProtectedRoute>` auth wrapper are defined in [frontend/src/main/App.js](frontend/src/main/App.js).

## Environment configuration

| File | Purpose |
|------|---------|
| `backend/.env` | `NODE_ENV`, `REGION`, `SNS_ARN` |
| `backend/config.js` | Port, CORS origins, DynamoDB table/index names |
| `frontend/src/aws-exports.js` | Cognito user pool and app client IDs; update `redirectSignIn`/`redirectSignOut` for local dev |
| `frontend/.env.development` / `frontend/.env.production` | `REACT_APP_FRONT_BASE_URL`, `REACT_APP_SERVER_BASE_URL`, `REACT_APP_WS_BOARD_URL`, `REACT_APP_WS_POKER_URL` — not versioned; loaded automatically by CRA based on `npm start`/`npm run build`. `frontend/src/constants/apiConstants.js` reads these with safe fallback defaults, so it no longer needs manual edits per environment. |

## Common development tasks

**New REST endpoint**: add route in [backend/routes/indexRoutes.js](backend/routes/indexRoutes.js) → implement in `backend/services/{domain}/controller*.js` → add `validateToken` middleware if auth is required → call from frontend via [frontend/src/services/utils.js](frontend/src/services/utils.js).

**New real-time event**: add listener in `backend/services/{domain}/socket*.js` → broadcast response → emit from frontend using the socket ref exposed by `useSocket`.

## Known pitfalls

- **Socket drops**: verify `idSession` and `service` query params are set on the WebSocket URL.
- **DynamoDB locally**: set `AWS_PROFILE` or equivalent env vars; NeDB fallback activates automatically if DynamoDB is unreachable.
- **CORS**: allowed origins are in `backend/config.js`; update when adding environments.
- **Cognito local testing**: update `redirectSignIn`/`redirectSignOut` in `aws-exports.js` and the corresponding Allowed callback/sign-out URLs in the Cognito console.
- **Production deploy**: after launching a new AWS instance, update the IP in the CloudFlare dashboard. Also update the URLs in `frontend/.env.production` (not committed — create/edit locally) before building the frontend.
