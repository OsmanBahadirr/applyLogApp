FROM oven/bun:1.1.16-alpine AS deps

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.1.16-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p data && [ -f data/applications.json ] || echo "[]" > data/applications.json

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_ESLINT=1

RUN bun run build

FROM oven/bun:1.1.16-alpine AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
