from node:alpine

workdir /usr/src/app

copy package.json /usr/src/app

run npm i --only=production

copy . /usr/src/app

cmd ["npm", "run", "pm2"]
