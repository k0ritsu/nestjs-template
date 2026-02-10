FROM node:24.10.0-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package*json ./
RUN npm ci

COPY tsconfig.json tsup.config.ts ./
COPY src src
RUN NODE_ENV=production npm run build && \
  npm prune --omit=dev --omit=optional

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist /app/dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json /app/package.json

USER nestjs

CMD ["node", "/app/dist/main.js"]
