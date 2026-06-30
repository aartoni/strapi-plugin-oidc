# docker build -t strapi-plugin-sso .
# docker run -P -t strapi-plugin-sso
FROM node:22-alpine
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app
RUN yarn config set network-timeout 600000 -g
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
ENV PATH=/opt/app/node_modules/.bin:$PATH
RUN yarn build
RUN yarn yalc publish --private
# TODO Make it so that no playground file is moved until here, so that an update to the playground doesn't require a full build
RUN yarn playground:install
RUN yarn playground:build
EXPOSE 1337
CMD ["yarn", "playground:start"]
