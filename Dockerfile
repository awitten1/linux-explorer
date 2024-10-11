# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.7.3

FROM ubuntu:24.04 AS base

WORKDIR /usr/src/app

FROM base AS deps

RUN <<EOF
apt update
apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
/bin/bash nodesource_setup.sh
apt install -y nodejs cmake ninja-build build-essential
EOF

FROM deps AS build

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "namespaces.js"]
