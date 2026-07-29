FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL=http://localhost:8080/api
ARG VITE_CHAT_SOCKET_URL=http://localhost:8083/ws
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CHAT_SOCKET_URL=${VITE_CHAT_SOCKET_URL}
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -q --spider http://localhost/health || exit 1
