# ConfigBot
Launch a basic Discord bot from a config file.

## Usage
In an existing JS project:
```js
var configbot = require("configbot");
configbot({
  token: "<token>",
  responses: {
    ping: "pong"
  }
});
```
Or from the shell:
```
npx https://github.com/tehzevo/configbot config.yml
```

## TODO
* allow multiple responses per trigger (detect arrays)
* regex
* more magics
* invite permissions
