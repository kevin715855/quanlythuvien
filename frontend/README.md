# DGM Library Frontend

Staff/admin console built with React, Vite, TypeScript, and explicit domain/application/infrastructure/presentation layers.

## Local development

```powershell
npm install
npm run dev
```

Vite serves `http://localhost:5173` and proxies `/api` to `http://localhost:3000`. Start the NestJS backend separately.
If you run the frontend inside Docker Compose, the proxy target comes from `VITE_API_PROXY_TARGET=http://backend:3000` so `/api` reaches the backend container.

## Verification

```powershell
npm run typecheck
npm test
npm run build
```

The test suite includes application behavior, HTTP/auth refresh, React workflows, and dependency-direction checks. Production assets are written to `dist`.

## Docker

The existing multi-stage Dockerfile runs `npm ci` and `npm run build`, then serves the generated files through Nginx. In Compose, the frontend dev server and the Nginx container both forward `/api` to the backend service.
