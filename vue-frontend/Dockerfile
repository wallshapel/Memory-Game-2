# Stage 1: Build
FROM node:22 as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Static server with nginx
FROM nginx:stable-alpine
# Copy the generated build to the nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Use our config with fallback to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy optional configuration (we'll use the default for now)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
