# Stage 1: Build Node.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (use ci for reproducible builds)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Accept build arg for dynamic API URL injection in CI/CD
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve via Nginx (Lightweight production server)
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing and SSE proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
