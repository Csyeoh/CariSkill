# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy all package files (including lock file if present)
COPY package*.json ./

# Install ALL dependencies (including devDependencies like typescript, @types/*)
RUN npm install

# Copy source files
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --only=production

# Copy compiled JavaScript from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the standard Cloud Run port
EXPOSE 8080

# Command to run the service
CMD ["npm", "start"]
