#!/bin/sh
# Bundle the ES modules into one classic script so the page also opens from file://.
cd "$(dirname "$0")" && ../../../../node_modules/.bin/esbuild js/main.js --bundle --format=iife --target=es2020 --outfile=js/bundle.js --log-level=warning
