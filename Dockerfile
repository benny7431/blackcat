FROM ubuntu:20.04

WORKDIR /home
COPY . .

ARG DEBIAN_FRONTEND="noninteractive"
RUN apt -qqy update && \
  apt -qqy install \
  python \
  make \
  g++ \
  build-essential \
  libtool \
  autoconf \
  automake \
  curl && \
  curl "https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/nodejs_14.16.1-deb-1nodesource1_amd64.deb" --output "nodejs.deb" && \
  apt install -qqy ./nodejs.deb && \
  rm -rf nodejs.deb

RUN npm i npm -g && \
  npm i && \
  npm i pm2 -g

EXPOSE 8080

CMD ["bash", "bootstrap.sh"]
