#!/usr/bin/env node

var fs = require("fs");
var YAML = require("yaml");
var Eris = require("eris");
var traverse = require('traverse');
var deepcopy = require("deepcopy");
var fd = require("format-duration");

//TODO: return an object (class?) instead of using these globals
var client;
var startTime;
var magic = {};

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
  var shardID = msg.channel.guild == null ? 0 : client.guildShardMap[msg.channel.guild.id];
  var shard = client.shards.get(shardID);
  x = x.replace("@guilds", client.guilds.size);
  x = x.replace("@users", client.users.size);
  x = x.replace("@time", new Date().toLocaleString());
  x = x.replace("@id", client.user.id);
  x = x.replace("@avatar", client.user.avatarURL);
  x = x.replace("@invite", `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot`);
  x = x.replace("@name", client.user.username);
  x = x.replace("@tag", client.user.username + "#" + client.user.discriminator);
  x = x.replace("@shard", shardID+1);
  x = x.replace("@shards", client.shards.size);
  x = x.replace("@uptime", fd(client.uptime));
  x = x.replace("@ping", shard.latency);

  //magic object replacement
  var matches = x.match(/(@{[_a-zA-Z][_a-zA-Z0-9]*})/g);
  matches = matches || [];
  for(var match of matches)
  {
    var m = match.substring(2, match.length-1);
    x = x.replace(match, magic[m]);
  }

  //TODO:
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

function configbot(config, token)
{
  //handle sharding:
  var sharding = config.sharding || {};
  var maxShards = sharding.max || "auto";
  var firstShardID = sharding.first || 0;
  var lastShardID = typeof maxShards == "number" ? (sharding.last || maxShards - 1) : 0;
  var options = { maxShards, firstShardID, lastShardID };

  client = new Eris(token || config.token, options);

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
  startTime = Date.now();

  return magic; //magic object~ spoooky
}

if(require.main === module)
{
  var config = YAML.parse(fs.readFileSync(process.argv[2], 'utf8'));
  configbot(config, process.argv[3]);
}

module.exports = configbot;
