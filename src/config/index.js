const nconf = require("nconf");
const path = require("path");

nconf.argv()
  .env()
  .file({
    file: process.env.NODE_ENV === 'pro' ?
      path.join(__dirname, "pro.config.json") :
      path.join(__dirname, "dev.config.json")
  });

module.exports = nconf;
