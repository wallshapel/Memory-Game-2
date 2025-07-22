# Base image with Node 22
FROM node:22

# Sets the working directory within the container
WORKDIR /app

# Copy the files needed to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project (src, public, etc.).
COPY . .

# Exposes the port on which the app is running
EXPOSE 3000

# Compile the TypeScript code
RUN npm run build

# Command to run the compiled app
CMD ["node", "dist/index.js"]
