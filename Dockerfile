FROM node:20-alpine

WORKDIR /app

# Installer les librairies requises par Alpine pour Next.js (SWC) et node-gyp
RUN apk add --no-cache libc6-compat python3 make g++

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (avec legacy-peer-deps pour éviter les conflits de versions)
RUN npm install --legacy-peer-deps

# Copier le reste du projet
COPY . .

# Construire l'application Next.js
RUN npm run build

# Exposer le port de l'application
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
