# ConfigBot
Launch a basic Discord bot from a config file.

## Usage
In an existing JS project:
```js
var configbot = require("configbot");
configbot({
  token: "<token>"
  responses: {
    ping: "pong"
  }
}, "<token>"); //optional token in second parameter if you don't want to store it in the config
```
Or from the shell:
```shell
npx https://github.com/tehzevo/configbot config.yml
#or
npx https://github.com/tehzevo/configbot config.yml <token>
```

## TODO
* allow multiple responses per trigger (detect arrays)
* regex
* more magics
* invite permissions
