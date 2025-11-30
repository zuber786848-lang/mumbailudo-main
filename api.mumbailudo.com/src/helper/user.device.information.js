const UAParser = require('ua-parser-js');

async function userAgentParser(userAgent) {
    const parser = new UAParser();
    parser.setUA(userAgent);
    const result = parser.getResult();
    return {
        browser: result.browser.name,
        browserVersion: result.browser.version,
        os: result.os.name,
        osVersion: result.os.version,
        device: result.device.model || 'Unknown',
        deviceType: result.device.type || 'Unknown'
    };
}

const checkIPAddress = () => {
    const clientIP = req.ip; // Get the client's IP address
    const allowedIp = ''
    if (clientIP === allowedIp || clientIP === ':::ffff:' + allowedIp) {
        next(); // Allow access if the IP is in the whitelist
    } else {
        res.status(403).send("Access denied");
    }
}

// app.use(checkIPAddress)
module.exports = { userAgentParser, checkIPAddress }
