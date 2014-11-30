var os = require("os");

module.exports = {};

switch (os.hostname()) {
    case "Tim-PC":
        module.exports = {
        	url: "localhost",
            port: "3000"
        };
        break;
    case "www":
        module.exports = {
        	url: "www.bzdbbb.co.uk",
            port: "3000"
        };
        break;
    default:
        throw new Exception("Unknown host");
}