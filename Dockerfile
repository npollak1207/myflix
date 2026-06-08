# Multi-stage build: compile the React SPA, then bake it into a Caddy image.
# This replaces the old "build on the host, bind-mount frontend/dist" flow so
# `docker compose up --build` is fully self-contained and reproducible.

# --- Stage 1: build the frontend ---
FROM node:20-alpine AS build
WORKDIR /app/frontend

# Install deps first for better layer caching.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build the production bundle into /app/frontend/dist.
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Caddy serving the built SPA ---
FROM caddy:2
# The Caddyfile is still bind-mounted in docker-compose so config edits don't
# require a rebuild; the built SPA lives at the path the Caddyfile serves from.
COPY --from=build /app/frontend/dist /srv/frontend
