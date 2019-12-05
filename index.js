#!/usr/bin/env node

var fs = require("fs");
var YAML = require("yaml");
var Discord = require('discord.js');
var traverse = require('traverse');
var deepcopy = require("deepcopy");

function onlyMention(text)
{
  var match = text.match(/^<@!?([0-9]+)>$/);
  return match && match[1] == client.user.id;
}

function send(channel, response)
{
  response = deepcopy(response);
  replaceMagics(response);

  if(typeof response == "object")
  {
    channel.send(response.content, {embed: response.embed});
  }
  else
  {
    channel.send(response);
  }
}

function replaceMagics(response)
{
  if(typeof response == "object")
  {
    traverse(response).forEach(function (x) {
      if(typeof x != "string")
      {
        return;
      }

      x = x.replace("@guilds", client.guilds.array().length);
      x = x.replace("@users", client.users.array().length);
      x = x.replace("@time", new Date().toLocaleString());
      x = x.replace("@id", client.id);
      x = x.replace("@avatar", client.user.avatarURL);
      x = x.replace("@invite", `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot`);
      x = x.replace("@name", client.user.username)
      x = x.replace("@tag", client.user.tag)
      //guildmember.displayname
      //guildmember.nickname

      this.update(x);
    });
  }
}

function configbot(config)
{
  var client = new Discord.Client();

  client.on('message', msg => {
    var content = msg.content;
    for(var key of Object.keys(config.responses))
    {
      var res = config.responses[key];
      //TODO: if starts with @/, regex?
      if(key == "@onlymention" && onlyMention(content))
      {
        send(msg.channel, res);
      }
      else if(content == key)
      {
        send(msg.channel, res);
      }
    }
  });

  client.on('ready', () => {
    console.log(`[ConfigBot] Logged in as ${client.user.tag}!`);
  });

  client.login(config.token);
}

if(require.main === module)
{
  var config = YAML.parse(fs.readFileSync(process.argv[2], 'utf8'));
  configbot(config);
}

module.exports = configbot;
