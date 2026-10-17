#!/bin/sh
mkdir -p /data/docs
chown -R node:node /data/docs
exec su-exec node node src/index.js
