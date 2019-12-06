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
}, "<token>"); //optional token in second parameter if you don't want to store it in the config
```
Or from the shell:
```shell
npx https://github.com/tehzevo/configbot config.yml
#or
npx https://github.com/tehzevo/configbot config.yml <token>
```
### Using the magic object
ConfigBot supports a "magic object" which can populated with data from outside ConfigBot:
```js
var configbot = require("configbot");
var magic = configbot({
  token: "<token>",
  responses: {
    foo: "@{bar} @{baz}"
  }
});
magic.bar = "Hello";
magic.baz = "world!";

//Meanwhile, in Discord: foo -> "Hello world!"
```

## TODO
* allow multiple responses per trigger (detect arrays)
* regex
* more magics
* invite permissions
