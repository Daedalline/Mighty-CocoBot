/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 * ============================================
 */

const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');

module.exports.run = async(interaction, config, client) => {

    if(interaction.channel.id != config.CoursesLeageChannelID){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply()

    let rawdata = await fs.readFileSync('data.json');
    let data = await JSON.parse(rawdata); 

    var map = interaction.options.getString('map')
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
            .setDescription(`There does not apear to be any scores for **${map}**`);
        return await interaction.editReply({embeds: [embed]})
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
    .setTitle(`Scoreboard for ${map}`)
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
};

module.exports.autocomplete = async (interaction, Config) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'map': {
            Config.Maps.forEach(map => {
                if(map.toLowerCase().includes(value.value.toLowerCase()) || value == ""){
                    res.push({
                        name: map,
                        value: map
                    })
                }
            })
            break;
        }
    }
    interaction.respond(res.slice(0,25))
}

module.exports.info = {
    "name": "course",
    "description": "See the leaderboard for each map",
    "options": [
        {
            "name": "map",
            "description": "The map you want the leaderboard for",
            "type": 3,
            "autocomplete": true,
            "required": true
        }
    ]
};
