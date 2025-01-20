FROM node:22.3.0-alpine AS build
RUN npm install -g pnpm
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=http://dotnet-webapi:8080
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_PATH_PREFIX=/api
ENV NEXT_PUBLIC_API_PATH_PREFIX=$NEXT_PUBLIC_API_PATH_PREFIX
ARG NEXT_PUBLIC_R2_BASE_URL=https://e63dc3517df224880521f623e3aee6f0.r2.cloudflarestorage.com
ENV NEXT_PUBLIC_R2_BASE_URL=$NEXT_PUBLIC_R2_BASE_URL
ARG NEXT_PUBLIC_R2_PATH_PREFIX=/sample-dotnet-webapi-bucket
ENV NEXT_PUBLIC_R2_PATH_PREFIX=$NEXT_PUBLIC_R2_PATH_PREFIX
COPY . .
RUN pnpm install
RUN pnpm build

FROM node:22.3.0-alpine
RUN npm install -g pnpm
WORKDIR /app
ENV NODE_ENV production
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
ENTRYPOINT ["pnpm", "start"]