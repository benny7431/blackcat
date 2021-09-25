FROM node:14.16.1-slim

WORKDIR /home
COPY . .

ARG DEBIAN_FRONTEND="noninteractive"
RUN apt-get -qqy update && \
  apt-get -qqy install \
  python \
  make \
  g++ \
  build-essential \
  libtool \
  autoconf \
  automake \
  curl && \
  npm i yarn -g --force && \
  yarn install --ignore-engines && \
  yarn run build && \
  yarn global add pm2 && \
  yarn cache clean

EXPOSE 8080

CMD ["bash", "bootstrap.sh"]
