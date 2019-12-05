#!/usr/bin/env node

var fs = require("fs");
var YAML = require("yaml");
//var Discord = require('discord.js');
var Eris = require("eris");
var traverse = require('traverse');
var deepcopy = require("deepcopy");

var client;

function onlyMention(text)
{
  var match = text.match(/^<@!?([0-9]+)>$/);
  return match && match[1] == client.user.id;
}

function send(msg, response)
{
  var channel = msg.channel;
  response = deepcopy(response);
  response = replaceMagics(response, msg);

  //should work for str or object
  channel.createMessage(response);
}

function replacer(x, msg)
{
  //resolve shard id
  var shard = msg.channel.guild == null ? 0 : client.guildShardMap[msg.channel.guild.id];
  x = x.replace("@guilds", client.guilds.size);
  x = x.replace("@users", client.users.size);
  x = x.replace("@time", new Date().toLocaleString());
  x = x.replace("@id", client.user.id);
  x = x.replace("@avatar", client.user.avatarURL);
  x = x.replace("@invite", `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot`);
  x = x.replace("@name", client.user.username);
  x = x.replace("@tag", client.user.username + "#" + client.user.discriminator);
  x = x.replace("@shard", shard+1);
  x = x.replace("@shards", client.shards.size);

  //TODO:
  //uptime
  //voice channel connections (for music bots)
  //guildmember.displayname
  //guildmember.nickname
  return x;
}

function replaceMagics(response, msg)
{
  if(typeof response == "object")
  {
    traverse(response).forEach(function (x) {
      if(typeof x != "string")
      {
        return;
      }
      x = replacer(x, msg);
      this.update(x);
    });
  }
  else
  {
    response = replacer(response, msg);
  }

  return response;
}

function configbot(config)
{
  console.log(config.sharding)
  //handle sharding:
  var sharding = config.sharding || {};
  var maxShards = sharding.max || "auto";
  var firstShardID = sharding.first || 0;
  var lastShardID = sharding.last || (typeof maxShards == "number" ? maxShards - 1 : 0);
  var options = { maxShards, firstShardID, lastShardID };
  
  console.log(options)

  client = new Eris(config.token, options);

  //client.on('message', msg => {
  client.on('messageCreate', msg => {
    var content = msg.content;
    for(var key of Object.keys(config.responses))
    {
      var res = config.responses[key];
      //TODO: if starts with @/, regex?
      if(key == "@onlymention" && onlyMention(content))
      {
        send(msg, res);
      }
      else if(content == key)
      {
        send(msg, res);
      }
    }
  });

  client.on('ready', () => {
    console.log(`[ConfigBot] Logged in as ${client.user.username}#${client.user.discriminator}!`);
  });

  //client.login(config.token);
  client.connect();
}

if(require.main === module)
{
  var config = YAML.parse(fs.readFileSync(process.argv[2], 'utf8'));
  configbot(config);
}

module.exports = configbot;
