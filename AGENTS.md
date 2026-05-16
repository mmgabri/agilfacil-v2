# AgilFacil - AI Agent Instructions

**AgilFacil** is a collaborative agile planning tool featuring Kanban boards and Planning Poker, built with React and Node.js, deployed on AWS with real-time WebSocket support.

## Project Structure

```
├── backend/              # Express.js API server (port 9000)
│   ├── services/        # Business logic organized by domain
│   │   ├── board/       # Kanban board logic
│   │   ├── poker/       # Planning poker logic
│   │   └── generic/     # Auth, logging, SNS, validation
│   ├── socket/          # Socket.io real-time handlers
│   ├── routes/          # REST API endpoints
│   ├── database/        # DynamoDB client
│   └── server.js        # Express app entry point
├── frontend/            # React 18 app (port 3000)
│   ├── src/
│   │   ├── pages/       # Route pages (board/, poker/, generic/)
│   │   ├── components/  # Shared React components
│   │   ├── services/    # API, localStorage, utils
│   │   ├── customHooks/ # Custom React hooks (useSocket)
│   │   ├── constants/   # apiConstants, config
│   │   └── styles/      # CSS and JSS styles
│   └── amplify/         # AWS Amplify auth configuration
├── infra/               # CloudFormation templates
├── health-check/        # Lambda health check
└── nginx_*.txt          # Nginx proxy configuration templates
```

## Build & Run

**Backend:**
```bash
cd backend
npm install
npm start              # Runs on port 9000
```

**Frontend:**
```bash
cd frontend
npm install
npm run build          # Production build
npm start              # Dev server (port 3000)
npm test               # Run tests
```

## Architecture & Patterns

### Real-Time Communication (Socket.io)
- **Query params**: `userName`, `userId`, `idSession`, `service` (board|poker)
- **Socket routing** in [backend/socket/indexSocket.js](backend/socket/indexSocket.js): dispatch to board or poker handlers
- **Frontend** uses [customHooks/useSocket.js](frontend/src/customHooks/useSocket.js) to manage socket lifecycle

### Authentication
- **AWS Amplify** for user auth (JWT tokens)
- **validateToken middleware** in [backend/services/generic/validateToken.js](backend/services/generic/validateToken.js) for protected routes
- **Cognito** handles user sign-up, sign-in, and token validation

### Data Persistence
- **Primary**: DynamoDB (tables: `board`, `room`) with GSI for user queries
- **Fallback**: NeDB (local file-based) when AWS is unavailable
- **Config**: Region `sa-east-1`, table names and index names in [backend/config.js](backend/config.js)

### Logging & Monitoring
- **CloudWatch Logs** via [backend/services/generic/cloudWatchLoggerService.js](backend/services/generic/cloudWatchLoggerService.js)
- **SNS** for notifications via [backend/services/generic/snsService.js](backend/services/generic/snsService.js)

### Board Feature
- **Kanban** with drag-and-drop (react-beautiful-dnd on frontend)
- **Real-time updates** for column reorder, card add/delete, color, obfuscation
- **PDF export** via jsPDF
- **Guest sharing** via guest URLs

### Poker Feature
- **Planning poker** rooms with real-time voting
- **Vote status tracking** and result display
- **Guest access** via unique URLs

## Common Development Tasks

### Adding a New API Endpoint
1. Add route in [backend/routes/indexRoutes.js](backend/routes/indexRoutes.js)
2. Implement controller logic in [backend/services/{domain}/controller*.js](backend/services/)
3. Add validateToken middleware if authentication required
4. Call from frontend using [services/utils.js](frontend/src/services/utils.js) HTTP helpers

### Adding a Real-Time Event
1. Add socket event listener in [backend/services/{domain}/socket*.js](backend/services/)
2. Implement handler and broadcast response
3. Emit event from frontend (see [customHooks/useSocket.js](frontend/src/customHooks/useSocket.js))

### Frontend Page Structure
- Pages located in [frontend/src/pages/](frontend/src/pages/) organized by feature (board/, poker/, generic/)
- Use **React Router** for navigation (BrowserRouter in [App.js](frontend/src/main/App.js))
- Wrap protected routes with `<ProtectedRoute>` component
- Use **styled-components** and **react-bootstrap** for styling

### Environment Configuration
- **Backend**: Uses `.env` file (PORT, NODE_ENV, AWS credentials via ENV)
- **Frontend**: AWS exports in [aws-exports.js](frontend/src/aws-exports.js)
- **Production**: NODE_ENV=prod enables HTTPS with Let's Encrypt certs
- **Nginx**: Reverse proxy for both frontend (3000) and backend (9000)

## Deployment Context

- **Node versions**: Frontend and backend run on same host via PM2
- **Nginx**: Reverse proxy redirects `/socket/` to backend, other routes to frontend
- **HTTPS**: Auto-renewal via certbot
- **Serve format**: React build static, backend API + WebSocket

## Key Technologies

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend State | React 18 + Hooks | useSocket for WebSocket, Context for auth |
| Frontend UI | Bootstrap 5, styled-components, react-jss | Consistent with atlaskit theme |
| Frontend Networking | Axios, Socket.io-client | Custom useSocket hook abstracts socket lifecycle |
| Backend Runtime | Node.js, Express | Middleware: CORS, body-parser, token validation |
| Real-Time | Socket.io | Namespaced by service (board/poker) |
| Auth | AWS Cognito (Amplify) | JWT tokens, Amplify UI component for login |
| Database | DynamoDB (AWS) | Tables: board, room; GSI: gsi_board_user |
| Logging | CloudWatch Logs | centralized logs for debugging |
| Notifications | SNS | for alert-based communications |

## Common Pitfalls & Solutions

1. **Socket connection drops**: Check `idSession` and `service` query params; see WebSocket URL in browser console
2. **DynamoDB access**: Ensure AWS_PROFILE or env vars are set; fall back to NeDB works locally
3. **CORS issues**: Configured in [backend/config.js](backend/config.js) — update origin as needed
4. **Token validation fails**: Check JWT expiry; ensure Cognito pool ID matches [aws-exports.js](frontend/src/aws-exports.js)

## Useful Commands

```bash
# Backend
npm start                    # Start server
npm test                     # Run tests (if available)

# Frontend  
npm start                    # Dev server with hot reload
npm run build                # Production build
npm test                     # Run tests

# PM2 (production)
pm2 start --name agilfacil-backend npm -- start
pm2 start --name agilfacil-frontend npm -- start
pm2 status

# Health Check
curl http://localhost:9000/healthcheck
```

## Files to Review When Starting

- [README.md](README.md) — Deployment instructions
- [backend/config.js](backend/config.js) — Port, table names, CORS
- [backend/server.js](backend/server.js) — Express setup, HTTP/HTTPS
- [frontend/src/main/App.js](frontend/src/main/App.js) — Routes, auth wrapper
- [backend/services/generic/validateToken.js](backend/services/generic/validateToken.js) — Token validation logic
