FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose port if needed (optional)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
