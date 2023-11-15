# Install dependencies only when needed
FROM docker.io/node:lts-alpine as build
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY . .
RUN npm install --only=production
RUN npx nx build ui --prodution

# Production image, copy all the files and run nest
FROM docker.io/node:lts-alpine as runner
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/dist/apps/ui .

COPY nginx/nginx.conf /tmp/nginx.conf

RUN envsubst < /tmp/nginx.conf > /etc/nginx/conf.d/default.conf

RUN chown -R node:node .
USER node

CMD ["nginx", "-g", "daemon off;"]
