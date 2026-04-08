# ─────────────────────────────────────────────────────────────────────────────
# Stage dev : ng serve avec hot-reload (monter ./frontend-web/src en volume)
# Les node_modules sont installes au premier demarrage et mis en cache
# dans le volume Docker nomme "frontend-node-modules".
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

COPY . .

EXPOSE 4200

# Au premier demarrage le volume node_modules est vide -> npm ci s'execute.
# Aux demarrages suivants le volume est deja peuple -> on passe directement.
CMD ["sh", "-c", \
     "[ -d node_modules/.bin ] || npm ci && \
      npx ng serve \
        --host 0.0.0.0 \
        --port 4200 \
        --proxy-config proxy.conf.docker.json \
        --no-hmr"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage build : compile Angular pour la production
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage prod : Nginx sert les fichiers statiques + reverse-proxy vers backend
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS prod

# Le builder @angular/build:application sort les bundles dans browser/
COPY --from=build /app/dist/stageconnect-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
