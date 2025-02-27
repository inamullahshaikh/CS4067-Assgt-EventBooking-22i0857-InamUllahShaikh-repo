# Use a lightweight Node.js image
FROM node:18-alpine 

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install 

# Copy the rest of the frontend files
COPY . .

# Expose the port for the frontend
EXPOSE 3000

# Start the frontend app
CMD ["npm", "start"]
