# ===== Build stage =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY .. .
RUN npm run build

# ===== Runtime stage =====
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
ENV NODE_ENV=production
EXPOSE 4001
# In dev usavi ts-node su src/decoder.main.ts; in prod avvia il JS compilato:
CMD ["node", "dist/decoder.main.js"]
