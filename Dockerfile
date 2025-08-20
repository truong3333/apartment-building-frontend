# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# copy package.json và package-lock.json trước
COPY package*.json ./

# cài dependencies (cả devDependencies, vì vite nằm trong đó)
RUN npm install

# copy toàn bộ source code
COPY . .

# build ra dist
RUN npm run build

# Stage 2: Serve bằng nginx
FROM nginx:alpine

# copy file build từ stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# copy nginx config mặc định
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
