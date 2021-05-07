/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 * ============================================
 */

const Discord = require("discord.js");
const utils = require("../utils")
const fs = require("fs");
const yaml = require('js-yaml');

let Config = null;

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}

module.exports.run = async(bot, interaction, args) => {

    var channelID = Config.CoursesLeageChannelID

    if(interaction.channel_id != channelID){
        utils.error(bot, interaction, "You are not allowed to do that in this channel")
        return
    }
    await utils.setLoading(bot, interaction)

    var data = await utils.loadData()

    var map = args[0].value
    var mapName = await utils.findMapname(map)
    var players = data[map]

    //Le Sorte'
    var simpleData = {}
    for(var player in players){
        simpleData[player] = players[player]
    }

    var sortable = []
    for (var item in simpleData){
        sortable.push([item, simpleData[item]])
    }

    sortable.sort(function(a,b){
        return a[1] - b[1]
    })

    var objSorted = {}
    sortable.forEach(function(item){
        objSorted[item[0]]=item[1]
    })

    var sortedData = {}
    for(var item in objSorted){
        sortedData[item] = players[item]
    }

    if(Object.keys(objSorted).length <= 0){
        var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There does not apear to be any scores for **${mapName}**`);
        return await utils.respondLoadingEmbed(bot, interaction, embed)
    }

    var tbl = ""
    var index = 0
    for(player in sortedData){
        if(index >= 10){
            break;
        }
        tbl += `${index+1}: <@${player}> ${sortedData[player]}\n`
        index ++
    }
    var embed = new Discord.MessageEmbed()
    .setTitle(`Scoreboard for ${mapName}`)
    .setDescription(tbl);
    return await utils.respondLoadingEmbed(bot, interaction, embed)
};

module.exports.info = {
    "name": "course",
    "description": "See the leaderboard for each map",
    "options": [
        {
            "name": "map",
            "description": "The map you want the leaderboard for",
            "type": 3,
            "choices": utils.maps,
            "required": true
        }
    ]
};
