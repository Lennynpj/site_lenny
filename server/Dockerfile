FROM node:22-alpine
# tzdata : sans ce paquet, Alpine ignore la variable TZ et reste en UTC — les
# bornes de mois seraient alors décalées de 1 à 2 heures.
RUN apk add --no-cache tzdata
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY seed ./seed

EXPOSE 3001
CMD ["npm", "run", "start"]
