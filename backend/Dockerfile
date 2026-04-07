FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source code
COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/server.js"]
