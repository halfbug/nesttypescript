FROM node:12.16.0-alpine as development
WORKDIR /app
COPY package*.json ./
RUN npm install -g yarn
RUN yarn
COPY . .
RUN yarn run build

FROM node:12.16.0-alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY package*.json ./
RUN npm install -g yarn
RUN yarn --only=production
# RUN npm install --only=production
COPY . .
COPY --from=development /app/dist ./dist
EXPOSE 5000
CMD yarn run start:prod