# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies using 'npm ci' for a clean, deterministic install
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration for React SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the Docker host
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
