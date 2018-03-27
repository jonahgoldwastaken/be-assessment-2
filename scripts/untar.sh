#!/usr/bin/env sh
set -x

export NODE_ENV=production
cd ~/ && \
tar zxf package.tgz -C . && \
cp .env hdate/.env && \
cd hdate && \
mkdir -p db/log && \
npm rebuild && \
screen -X -S hdate quit && \
screen -dmS hdate npm start