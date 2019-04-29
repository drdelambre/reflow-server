FROM node:lts-alpine AS base

RUN mkdir /repo

COPY package.json /repo/

# install dependancies
FROM base AS deps
RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base

WORKDIR /repo

RUN npm i

# copy over some stuff
FROM base AS deploy
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY project.config.js /repo/
COPY .eslintrc /repo/
COPY .eslintignore /repo/
COPY build /repo/build
COPY public /repo/public

VOLUME ["/repo/src"]
EXPOSE 80

CMD ["/bin/bash"]
