# docker build -t strapi-plugin-sso .
# docker run -P -t strapi-plugin-sso
FROM node:24-alpine
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app
RUN yarn config set network-timeout 600000 -g
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN yarn yalc publish --private
RUN yarn playground:install
RUN yarn playground:build
EXPOSE 1337
CMD ["yarn", "playground:start"]
