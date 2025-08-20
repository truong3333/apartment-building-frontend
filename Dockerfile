# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Cài bash và libc cho Alpine
RUN apk add --no-cache bash libc6-compat

COPY package*.json ./
RUN npm install --include=dev

COPY . .

# Sửa quyền cho vite nếu cần
RUN chmod +x node_modules/.bin/vite

RUN npm run build

# Stage 2: Serve bằng nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
