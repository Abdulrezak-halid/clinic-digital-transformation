FROM node:24-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY packages packages
COPY apps apps
RUN npm run db:generate && npm run build
FROM build AS migrate
WORKDIR /app/apps/api
CMD ["npx","prisma","migrate","deploy"]
FROM node:24-bookworm-slim AS api
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build --chown=node:node /app /app
RUN npm prune --omit=dev --ignore-scripts
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
USER node
EXPOSE 3001
CMD ["node","apps/api/dist/main.js"]
FROM nginxinc/nginx-unprivileged:stable-alpine AS web
COPY ops/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
