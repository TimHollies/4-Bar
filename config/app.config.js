var os = require("os");

module.exports = {};

switch (os.hostname()) {
    case "Tim-PC":
        module.exports = {
        	url: "localhost",
            port: "3000"
        };
        break;
    case "bzdbbb":
        module.exports = {
        	url: "www.bzdbbb.co.uk",
            port: "80"
        };
        break;
    default:
        module.exports = {
            url: "198.91.86.144",
            port: "3000"
        };
        //throw new Error("Unknown host");
}