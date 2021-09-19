FROM node:current

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
  yarn install && \
  yarn run build && \
  yarn install --production --ignore-scripts --prefer-offline && \
  yarn global add pm2 && \
  yarn cache clean

EXPOSE 8080

CMD ["bash", "bootstrap.sh"]
