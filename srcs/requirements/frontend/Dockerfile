# Base Image: Node.js LTS (Long Term Support) version on Alpine Linux
# Alpine is chosen for its small footprint (security and speed).
# node:20-alpine contains necessary tools (npm, node) pre-installed.
FROM node:20-alpine

# Set the working directory inside the container to /app.
# All subsequent commands (COPY, RUN, CMD) will be executed in this folder.
WORKDIR /app

# COPY dependency definitions first!
# Docker caches each layer. If we copy package.json separately,
# Docker will only re-run 'npm install' if package.json changes.
# If we copied everything (COPY . .) first, any change in a single .js file
# would force Docker to reinstall all modules again (slow!).
COPY package*.json ./

# Install dependencies defined in package.json.
# This creates the node_modules folder inside the image.
RUN npm install

# Now copy the rest of the application source code.
# Since we use volumes in docker-compose for development, 
# this step is mostly for creating a standalone production-ready image.
COPY . .

# Vite (the default React build tool) runs on port 5173 by default.
# This instruction functions as documentation for the port mapping.
EXPOSE 5173

# Default command to run the application.
# "npm run dev" starts the development server.
# "-- --host" is CRITICAL in Docker:
# By default, Vite listens on 127.0.0.1 (localhost inside container),
# preventing access from outside. "--host" makes it listen on 0.0.0.0.
CMD ["npm", "run", "dev", "--", "--host"]