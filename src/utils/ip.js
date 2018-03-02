const os = require('os');
const ifaces = os.networkInterfaces();

const getExternalIp = () => {
  for (const dev in ifaces) {
    let iface;
    if (ifaces.hasOwnProperty(dev)) {
      iface = ifaces[dev].filter((details) => details.family === 'IPv4' &&
                                              details.internal === false);
    }
    if (iface.length > 0) return iface[0].address;
  }
};

module.exports.getExternalIp = getExternalIp;
