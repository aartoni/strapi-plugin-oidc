# docker build -t strapi-plugin-sso .
# docker run -P -t strapi-plugin-sso
FROM node:20-alpine
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app
COPY . .
RUN yarn global add node-gyp yalc
RUN yarn config set network-timeout 600000 -g
ENV PATH=/opt/app/node_modules/.bin:$PATH
RUN ["yarn", "install"]
RUN ["yalc", "publish", "--private"]
# TODO Make it so that no playground file is moved until here, so that an update to the playground doesn't require a full build
RUN ["yarn", "playground:install"]
EXPOSE 1337
CMD ["yarn", "playground:develop"]
