FROM node:lts-alpine AS base
RUN mkdir /repo
COPY package.json /repo

# add deps
FROM base AS deps
RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base
WORKDIR /repo

RUN npm i --only=production
RUN cp -r ./node_modules ./prod_node_modules
RUN npm i

# clean the source
FROM base AS deploy
WORKDIR /repo
COPY init.sh ecosystem.config.js .babelrc ./

RUN chmod 777 /repo/init.sh

COPY --from=deps /repo/node_modules ./node_modules

VOLUME ["/repo/src"]
EXPOSE 8080

CMD ["/repo/init.sh"]


