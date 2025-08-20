# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

RUN chmod +x ./node_modules/.bin/vite
RUN npm run build
