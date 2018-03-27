#!/usr/bin/env sh
set -x

export NODE_ENV=production
nvm use 9.8.0 && \
cd ~/ && \
tar zxvf package.tgz -C . && \
cd hdate && \
mkdir -p db/log && \
npm rebuild && \
npm run start