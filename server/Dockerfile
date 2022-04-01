FROM node:17-slim

WORKDIR /usr/src/app

COPY shared/hitpoints-shared-1.0.0.tgz ./shared.tgz
COPY server/package*.json ./server/

# RUN cd server && npm install ../shared.tgz && npm ci --production
RUN cd server && npm install ../shared.tgz --production
RUN cd server && npm ci --production

COPY client/dist ./client/dist
COPY server/dist ./server/dist
COPY shared/dist ./shared/dist

WORKDIR /usr/src/app/server

CMD ["npm", "run", "start-production"]
