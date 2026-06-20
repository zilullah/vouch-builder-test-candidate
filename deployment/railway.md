# Railway Deployment Guide

This project is fully configured for zero-downtime deployment on Railway.

## Configuration Verification

- **Port Binding**: The Fastify server correctly binds to `process.env.PORT` fallback to `3000` (`src/server.ts:7`).
- **Host Binding**: The Fastify server correctly binds to the `0.0.0.0` host interface, which is required for Railway to map external traffic to the Docker container (`src/server.ts:7`).
- **Build Script**: `npm run build` is explicitly defined in `package.json` to compile TypeScript to `dist/`.
- **Start Script**: `npm run start` is explicitly defined in `package.json` to run the compiled `dist/server.js`.
- **Local File Paths**: All local paths to `events.json` and `night-logs.md` use relative resolution (`__dirname` relative) rather than hardcoded absolute paths, preventing `ENOENT` errors on the cloud environment.

## Deployment Steps

1. Create a new project in [Railway.app](https://railway.app/).
2. Select **Deploy from GitHub repo**.
3. Point to your repository containing this code.
4. Railway will automatically detect the Node.js environment via `package.json`.
5. Railway will automatically run `npm run build` and then `npm run start`.
6. Once deployed, generate a Domain in the Railway Dashboard to get a public URL.

## Example Request (Production)

```bash
curl -X POST https://your-railway-domain.up.railway.app/handover \
  -H "Content-Type: application/json" \
  -d '{"hotelId":"lumen-sg"}'
```
