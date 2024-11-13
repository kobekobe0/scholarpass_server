# Start with a Node.js base image with Debian Bullseye, which includes compatibility for required dependencies
FROM node:18-bullseye

# Install dependencies required by `canvas`
RUN apt-get update && \
    apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application files to the working directory
COPY . .

# Expose the port your app runs on (default: 3000, change if needed)
EXPOSE 3000

# Command to start the app
CMD ["npm", "start"]
