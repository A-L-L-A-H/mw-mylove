FROM oven/bun:1-alpine AS runtime

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY src ./src
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV MW_MYLOVE_PORT=4460

EXPOSE 4460

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4460/health || exit 1

CMD ["bun", "run", "src/index.ts"]
