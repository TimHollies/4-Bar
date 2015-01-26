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
        	url: "198.91.86.144",
            port: "3000"
        };
        break;
    default:
        throw new Error("Unknown host");
}