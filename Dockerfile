from node:alpine

workdir /usr/src/bot

copy package.json /usr/src/bot

run npm i --only=production

copy . /usr/src/bot

cmd ["npm", "run", "pm2"]
