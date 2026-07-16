# Stage 1: Build React static assets
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2: Serve React assets via Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Standard Nginx config for single-page routing fallback
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
