# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Angular app
RUN npm run build --prod

# Runtime stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
