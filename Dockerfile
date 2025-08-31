# ------------ ZERA X BOT DOCKERFILE ------------

# Base image: Node.js LTS (stable)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all source files into container
COPY . .

# Expose port (Railway/Heroku auto-assigns)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
