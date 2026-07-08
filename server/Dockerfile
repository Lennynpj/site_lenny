FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY seed ./seed

EXPOSE 3001
CMD ["npm", "run", "start"]
