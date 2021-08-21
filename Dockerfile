FROM ubuntu:21.10

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
  curl "https://deb.nodesource.com/node_16.x/pool/main/n/nodejs/nodejs_16.7.0-deb-1nodesource1_amd64.deb" --output "nodejs.deb" && \
  apt install -qqy ./nodejs.deb && \
  rm -rf nodejs.deb && \
  npm i yarn -g && \
  yarn install && \
  yarn global add pm2

EXPOSE 8080

CMD ["bash", "bootstrap.sh"]
