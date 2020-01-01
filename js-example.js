var configbot = require("./index.js");
configbot({
	prefix: ["-", "<@!bot_id> "], // If there is no prefix then it will skip the check.
	token: "<token>",
	responses: {
		ping: "pong"
	}
}, "<token>"); //optional token in second parameter if you don't want to store it in the config