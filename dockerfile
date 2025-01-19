FROM node:23-alpine AS build
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build

FROM node:23-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
ENTRYPOINT ["pnpm", "start"]