#!/usr/bin/env sh
set -x

export NODE_ENV=production
export NVM_BIN=$HOME/.nvm/versions/node/v8.9.3/bin

cd ~/ && \
tar zxvf package.tgz -C . && \
cd hdate . && \
npm install && \
npm run start