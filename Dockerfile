# Build the static site with Bun, then serve it with nginx.
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# No BASE_PATH: self-hosted builds serve from the domain root.
RUN bun run build

FROM nginx:1.27-alpine AS serve
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
