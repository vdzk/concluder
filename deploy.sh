#!/bin/bash
set -e

ssh apollo-do "mkdir -p /root/wiki_concluder/client /root/wiki_concluder/server"

cd client
npm run build
rsync -av --progress dist/ apollo-do:/root/wiki_concluder/client/
cd ../
rsync -av --progress --exclude node_modules --exclude package-lock.json server/ apollo-do:/root/wiki_concluder/server/

ssh apollo-do "cd /root/wiki_concluder/server && npm install --omit=dev"
ssh apollo-do "pm2 describe wiki_concluder > /dev/null 2>&1 && pm2 restart wiki_concluder || pm2 start src/index.ts --name wiki_concluder --cwd /root/wiki_concluder/server --node-args='--experimental-strip-types' && pm2 save"
