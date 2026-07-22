FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY bridge-server.js .
EXPOSE 3001
CMD ["node", "bridge-server.js"]
