/*
 * ====================NOTE====================
 *    This code was created by Daedalline,
 *   please don't claim this as your own work
 *        https://github.com/Daedalline
 * ============================================
 */

const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');

module.exports.run = async(interaction, config, maps, client) => {

    if(interaction.channel.id != config.CoursesLeageChannelID){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();

    let rawdata = await fs.readFileSync('speedrun_data.json');
    let data = await JSON.parse(rawdata); 

    var map = interaction.options.getString('map');
    var players = data[map];
    
    //Le Sorte'
    var simpleData = {};
    for(var player in players){
        simpleData[player] = players[player];
    }
    
    // If empty no need to sort anything
    if(Object.keys(simpleData).length <= 0){
        var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There does not apear to be any scores for **${map}**`);
        return await interaction.editReply({embeds: [embed]})
    }
    
    var sortable = [];
    for (var item in simpleData){
        sortable.push([item, simpleData[item]]);
    }

    sortable.sort(function(a,b){
        if (a[1][0] == b[1][0]) {
            if (a[1][1] == b[1][1]) {
                var dateA = new Date(a[1][2]);
                var dateB = new Date(b[1][2]);
                if (dateA < dateB){
                    return -1;
                }
                else if (dateA > dateB){
                    return 1;
                }
                else {
                    return 0;            
                }
            }
            else {
                return a[1][1]-b[1][1];
            }
        }
        else {    
            return a[1][0] - b[1][0];
        }
    })

    var sortedData = {}
    sortable.forEach(function(item){
        var date = new Date(null);
        date.setSeconds(item[1][1]);
        var timeString = date.toISOString().slice(11, 19);
        
        sortedData[item[0]]=[item[1][0], timeString];
    })
    
    var tbl = ""
    var index = 0
    for(player in sortedData){
        if(index >= 20){
            break;
        }
        tbl += `<@${player}>: ${sortedData[player][0]}, ${sortedData[player][1]}\n`
        index ++
    }
    var embed = new Discord.MessageEmbed()
    .setTitle(`Speedrun Leaderboard for ${map}`)
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
};

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'map': {
            Maps.Maps.forEach(map => {
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
    "name": "speedrun_course",
    "description": "See the speedrun leaderboard for each map",
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